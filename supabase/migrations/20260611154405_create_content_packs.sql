CREATE TABLE content_packs (
    id              VARCHAR(100) PRIMARY KEY,
    name            VARCHAR(200) NOT NULL,
    game_type       VARCHAR(30) NOT NULL,
    type            VARCHAR(30) NOT NULL,
    price_tier      VARCHAR(20) NOT NULL DEFAULT 'free',
    version         VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    description     VARCHAR(200) NOT NULL,
    long_description TEXT,
    preview_items   INTEGER NOT NULL DEFAULT 3,
    author          VARCHAR(100) NOT NULL DEFAULT 'Ephemera Engine',
    tags            TEXT[] DEFAULT '{}',
    item_count      INTEGER NOT NULL DEFAULT 0,
    items           JSONB NOT NULL DEFAULT '[]',
    is_bundled      BOOLEAN NOT NULL DEFAULT false,
    platform_sku_ios     VARCHAR(100),
    platform_sku_android VARCHAR(100),
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_game_type CHECK (game_type IN (
        'confession-album', 'murder-mystery', 'whose-memory', 'exquisite-corpse'
    )),
    CONSTRAINT valid_pack_type CHECK (type IN (
        'question-lineage', 'setting-seed', 'era-packet',
        'theme', 'template', 'game-unlock'
    )),
    CONSTRAINT valid_price_tier CHECK (price_tier IN ('free', 'standard', 'premium')),
    CONSTRAINT version_semver CHECK (version ~ '^\d+\.\d+\.\d+$')
);

COMMENT ON TABLE content_packs IS 'Catalog of content packs. Bundled packs ship with the app; purchasable packs are downloaded after IAP.';
COMMENT ON COLUMN content_packs.id IS 'Globally unique pack ID matching the YAML schema (e.g., confession-album-mortality-v1).';
COMMENT ON COLUMN content_packs.items IS 'Array of content items in the pack. Schema varies by type, matching PRD 5.6 format.';
COMMENT ON COLUMN content_packs.is_bundled IS 'True for packs that ship with the app binary and are available without purchase.';
COMMENT ON COLUMN content_packs.platform_sku_ios IS 'Apple App Store product ID for IAP.';
COMMENT ON COLUMN content_packs.platform_sku_android IS 'Google Play product ID for IAP.';

CREATE INDEX idx_content_packs_game ON content_packs(game_type);
CREATE INDEX idx_content_packs_type ON content_packs(type);
CREATE INDEX idx_content_packs_published ON content_packs(published_at) WHERE published_at IS NOT NULL;
CREATE INDEX idx_content_packs_bundled ON content_packs(is_bundled) WHERE is_bundled = true;

ALTER TABLE content_packs ENABLE ROW LEVEL SECURITY;

-- Everyone can read published packs (store browsing works without auth)
CREATE POLICY content_packs_public_read ON content_packs
    FOR SELECT
    USING (published_at IS NOT NULL OR is_bundled = true);

-- Only server (service role) can insert/update packs

CREATE TABLE user_content_packs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pack_id         VARCHAR(100) NOT NULL REFERENCES content_packs(id) ON DELETE CASCADE,
    purchased_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    receipt_data    JSONB,
    platform        VARCHAR(10) NOT NULL,
    downloaded_at   TIMESTAMPTZ,

    CONSTRAINT valid_platform CHECK (platform IN ('ios', 'android', 'bundled')),
    CONSTRAINT unique_user_pack UNIQUE (user_id, pack_id)
);

COMMENT ON TABLE user_content_packs IS 'Junction table for user-owned content packs. Includes purchase receipt data for audit.';
COMMENT ON COLUMN user_content_packs.receipt_data IS 'Validated purchase receipt from Apple/Google. Stored for audit and dispute resolution.';
COMMENT ON COLUMN user_content_packs.downloaded_at IS 'When the pack content was successfully downloaded to the device. Null if not yet downloaded.';

CREATE INDEX idx_user_content_packs_user ON user_content_packs(user_id);
CREATE INDEX idx_user_content_packs_pack ON user_content_packs(pack_id);

ALTER TABLE user_content_packs ENABLE ROW LEVEL SECURITY;

-- Users can read their own purchases
CREATE POLICY user_content_packs_user_select ON user_content_packs
    FOR SELECT
    USING (user_id = auth.uid());

-- Only server (service role) can insert purchases (after receipt validation)
