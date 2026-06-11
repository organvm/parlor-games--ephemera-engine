CREATE TABLE public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 100),
  email           TEXT NOT NULL,
  auth_provider   auth_provider NOT NULL DEFAULT 'email',
  avatar_url      TEXT,
  is_host         BOOLEAN NOT NULL DEFAULT FALSE,

  -- Preferences (JSONB for flexibility; avoids schema migrations for new settings)
  notification_preferences JSONB NOT NULL DEFAULT '{
    "invitations": true,
    "contribution_reminders": true,
    "game_night": true,
    "artifacts": true,
    "delayed_artifacts": true,
    "email_notifications": true,
    "quiet_hours": {"enabled": true, "start": "22:00", "end": "08:00"}
  }'::jsonb,

  accessibility_preferences JSONB NOT NULL DEFAULT '{
    "text_size": "system",
    "high_contrast": false,
    "reduce_motion": "system",
    "screen_reader": "auto",
    "written_answer_mode": false,
    "theme": "system"
  }'::jsonb,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.users IS 'Application user profiles. Extends auth.users with display info and preferences.';
COMMENT ON COLUMN public.users.is_host IS 'Activated automatically on first session creation. No separate role system.';
COMMENT ON COLUMN public.users.notification_preferences IS 'Per-category notification toggles and quiet hours configuration.';
COMMENT ON COLUMN public.users.accessibility_preferences IS 'Text size, contrast, motion, screen reader, theme preferences.';
