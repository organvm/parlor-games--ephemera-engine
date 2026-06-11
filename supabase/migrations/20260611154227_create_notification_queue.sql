CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE TABLE notification_queue (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id      UUID REFERENCES sessions(id) ON DELETE CASCADE,
    recipient_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255),
    category        VARCHAR(10) NOT NULL,
    title           TEXT NOT NULL,
    body            TEXT NOT NULL,
    data            JSONB DEFAULT '{}',
    channel         VARCHAR(20) NOT NULL DEFAULT 'push',
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    scheduled_for   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    batch_key       VARCHAR(100),
    sent_at         TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ,
    error           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_category CHECK (category IN (
        'N01', 'N02', 'N03', 'N04', 'N05', 'N06', 'N07', 'N08',
        'N09', 'N10', 'N11', 'N12', 'N13', 'N14', 'N15', 'N16'
    )),
    CONSTRAINT valid_channel CHECK (channel IN ('push', 'email', 'push_email')),
    CONSTRAINT valid_status CHECK (status IN (
        'pending', 'scheduled', 'ready', 'sending', 'sent',
        'delivered', 'failed', 'suppressed'
    )),
    CONSTRAINT recipient_required CHECK (
        recipient_id IS NOT NULL OR recipient_email IS NOT NULL
    )
);

COMMENT ON TABLE notification_queue IS 'Server-side notification queue. All notifications pass through this table for scheduling, deduplication, quiet hours, and delivery tracking.';
COMMENT ON COLUMN notification_queue.category IS 'Notification type ID from PRD 5.4 (N01-N16).';
COMMENT ON COLUMN notification_queue.channel IS 'Delivery channel: push (app players), email (web players), push_email (both).';
COMMENT ON COLUMN notification_queue.batch_key IS 'Key for batching notifications. Notifications with the same batch_key for the same recipient are grouped (e.g., host contribution notifications).';
COMMENT ON COLUMN notification_queue.scheduled_for IS 'When the notification should be sent. For immediate notifications, this is NOW(). For scheduled reminders, this is the future time.';
COMMENT ON COLUMN notification_queue.status IS 'pending = just created; scheduled = will fire at scheduled_for; ready = processed by scheduler, awaiting dispatch; sending = being sent; sent = confirmed sent to provider; delivered = confirmed received; failed = error; suppressed = deduplicated or quiet hours.';

CREATE INDEX idx_notification_queue_status_scheduled ON notification_queue(status, scheduled_for)
    WHERE status IN ('pending', 'scheduled');
CREATE INDEX idx_notification_queue_recipient ON notification_queue(recipient_id);
CREATE INDEX idx_notification_queue_session ON notification_queue(session_id);
CREATE INDEX idx_notification_queue_batch ON notification_queue(batch_key, recipient_id, created_at)
    WHERE batch_key IS NOT NULL;
CREATE INDEX idx_notification_queue_dedup ON notification_queue(recipient_id, category, session_id, created_at);

ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY notification_queue_user_select ON notification_queue
    FOR SELECT
    USING (recipient_id = auth.uid());

-- Hosts can read notifications for their sessions
CREATE POLICY notification_queue_host_select ON notification_queue
    FOR SELECT
    USING (
        session_id IN (
            SELECT id FROM sessions WHERE host_id = auth.uid()
        )
    );

-- Only server (service role) can insert/update notifications

CREATE OR REPLACE FUNCTION should_suppress_notification(
    p_recipient_id UUID,
    p_category VARCHAR(10),
    p_session_id UUID,
    p_window_hours INTEGER DEFAULT 12
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM notification_queue
        WHERE recipient_id = p_recipient_id
          AND category = p_category
          AND session_id = p_session_id
          AND status NOT IN ('failed', 'suppressed')
          AND created_at > NOW() - (p_window_hours || ' hours')::INTERVAL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION should_batch_notification(
    p_batch_key VARCHAR(100),
    p_recipient_id UUID,
    p_batch_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM notification_queue
        WHERE batch_key = p_batch_key
          AND recipient_id = p_recipient_id
          AND status IN ('sent', 'delivered', 'sending')
          AND created_at > NOW() - (p_batch_window_minutes || ' minutes')::INTERVAL
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TABLE push_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT NOT NULL,
    platform    VARCHAR(10) NOT NULL,
    device_id   VARCHAR(100),
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_platform CHECK (platform IN ('ios', 'android')),
    CONSTRAINT token_not_empty CHECK (LENGTH(token) > 0)
);

COMMENT ON TABLE push_tokens IS 'Expo push tokens for registered devices. A user can have multiple tokens (multiple devices).';
COMMENT ON COLUMN push_tokens.token IS 'Expo push token format: ExponentPushToken[xxxxxxxxxxxx]';
COMMENT ON COLUMN push_tokens.is_active IS 'Set to false when Expo reports DeviceNotRegistered for this token.';

CREATE UNIQUE INDEX idx_push_tokens_user_token ON push_tokens(user_id, token);
CREATE INDEX idx_push_tokens_user_active ON push_tokens(user_id) WHERE is_active = true;

ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Users can manage their own tokens
CREATE POLICY push_tokens_user_all ON push_tokens
    FOR ALL
    USING (user_id = auth.uid());


CREATE TABLE notification_preferences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category        VARCHAR(30) NOT NULL,
    enabled         BOOLEAN NOT NULL DEFAULT true,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_pref_category CHECK (category IN (
        'invitations', 'contribution_reminders', 'game_night',
        'artifacts', 'delayed_artifacts', 'email'
    )),
    CONSTRAINT unique_user_category UNIQUE (user_id, category)
);

COMMENT ON TABLE notification_preferences IS 'Per-user notification preferences. Categories group multiple notification types (N01-N16). Missing rows default to enabled.';

CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can manage their own preferences
CREATE POLICY notification_preferences_user_all ON notification_preferences
    FOR ALL
    USING (user_id = auth.uid());


CREATE OR REPLACE FUNCTION notification_category_group(p_category VARCHAR(10))
RETURNS VARCHAR(30) AS $$
BEGIN
    RETURN CASE p_category
        WHEN 'N01' THEN 'invitations'
        WHEN 'N02' THEN 'invitations'
        WHEN 'N03' THEN 'invitations'
        WHEN 'N04' THEN 'invitations'
        WHEN 'N05' THEN 'contribution_reminders'
        WHEN 'N06' THEN 'contribution_reminders'
        WHEN 'N07' THEN 'contribution_reminders'
        WHEN 'N08' THEN 'contribution_reminders'
        WHEN 'N09' THEN 'game_night'
        WHEN 'N10' THEN 'game_night'
        WHEN 'N11' THEN 'artifacts'
        WHEN 'N12' THEN 'delayed_artifacts'
        WHEN 'N13' THEN 'delayed_artifacts'
        WHEN 'N14' THEN 'contribution_reminders'
        WHEN 'N15' THEN 'invitations'
        WHEN 'N16' THEN 'contribution_reminders'
        ELSE 'invitations'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


CREATE OR REPLACE FUNCTION enqueue_notification(
    p_session_id UUID,
    p_recipient_id UUID,
    p_recipient_email VARCHAR,
    p_category VARCHAR(10),
    p_title TEXT,
    p_body TEXT,
    p_data JSONB DEFAULT '{}',
    p_channel VARCHAR(20) DEFAULT 'push',
    p_scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    p_batch_key VARCHAR(100) DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_notification_id UUID;
    v_suppressed BOOLEAN;
    v_preference_enabled BOOLEAN;
BEGIN
    -- Check deduplication
    v_suppressed := should_suppress_notification(p_recipient_id, p_category, p_session_id);
    IF v_suppressed THEN
        INSERT INTO notification_queue (
            session_id, recipient_id, recipient_email, category,
            title, body, data, channel, status, scheduled_for, batch_key
        ) VALUES (
            p_session_id, p_recipient_id, p_recipient_email, p_category,
            p_title, p_body, p_data, p_channel, 'suppressed', p_scheduled_for, p_batch_key
        ) RETURNING id INTO v_notification_id;
        RETURN v_notification_id;
    END IF;

    -- Check user preferences (missing preference = enabled)
    SELECT COALESCE(
        (SELECT enabled FROM notification_preferences
         WHERE user_id = p_recipient_id
           AND category = notification_category_group(p_category)),
        true
    ) INTO v_preference_enabled;

    IF NOT v_preference_enabled THEN
        INSERT INTO notification_queue (
            session_id, recipient_id, recipient_email, category,
            title, body, data, channel, status, scheduled_for, batch_key
        ) VALUES (
            p_session_id, p_recipient_id, p_recipient_email, p_category,
            p_title, p_body, p_data, p_channel, 'suppressed', p_scheduled_for, p_batch_key
        ) RETURNING id INTO v_notification_id;
        RETURN v_notification_id;
    END IF;

    -- Check batching
    IF p_batch_key IS NOT NULL AND should_batch_notification(p_batch_key, p_recipient_id) THEN
        INSERT INTO notification_queue (
            session_id, recipient_id, recipient_email, category,
            title, body, data, channel, status, scheduled_for, batch_key
        ) VALUES (
            p_session_id, p_recipient_id, p_recipient_email, p_category,
            p_title, p_body, p_data, p_channel, 'suppressed', p_scheduled_for, p_batch_key
        ) RETURNING id INTO v_notification_id;
        RETURN v_notification_id;
    END IF;

    -- Insert as pending/scheduled
    INSERT INTO notification_queue (
        session_id, recipient_id, recipient_email, category,
        title, body, data, channel, status, scheduled_for, batch_key
    ) VALUES (
        p_session_id, p_recipient_id, p_recipient_email, p_category,
        p_title, p_body, p_data, p_channel,
        CASE WHEN p_scheduled_for > NOW() THEN 'scheduled' ELSE 'pending' END,
        p_scheduled_for, p_batch_key
    ) RETURNING id INTO v_notification_id;

    -- For immediate notifications, trigger dispatch
    IF p_scheduled_for <= NOW() THEN
        PERFORM pg_notify('dispatch_notification', v_notification_id::TEXT);
    END IF;

    RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION process_pending_notifications()
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    WITH ready_notifications AS (
        UPDATE notification_queue
        SET status = 'ready'
        WHERE status = 'scheduled'
          AND scheduled_for <= NOW()
        RETURNING id
    )
    SELECT COUNT(*) INTO v_count FROM ready_notifications;

    -- Notify the Edge Function for each batch
    IF v_count > 0 THEN
        PERFORM pg_notify('dispatch_notification', 'batch');
    END IF;

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: we wrap cron setup in DO block because pg_cron is available only in the postgres database
-- or via special extension. In supabase, pg_cron is supported but needs schema to be explicit.
SELECT cron.schedule(
    'process-notifications',
    '*/15 * * * *',
    $$SELECT process_pending_notifications()$$
);
