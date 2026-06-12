CREATE TABLE confession_album_question_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    lineage TEXT NOT NULL,
    register TEXT NOT NULL,
    domain TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE confession_album_chain_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES confession_album_question_items(id),
    player_id UUID NOT NULL,
    session_id UUID NOT NULL,
    turn_number INT NOT NULL,
    answer_text TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE confession_album_return_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_answer_id UUID REFERENCES confession_album_chain_entries(id),
    player_id UUID NOT NULL,
    session_id UUID NOT NULL,
    reflection_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE confession_album_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID NOT NULL,
    session_id UUID NOT NULL,
    archetype TEXT NOT NULL,
    item_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE content_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    metadata JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_chain_entries_session ON confession_album_chain_entries(session_id);
CREATE INDEX idx_return_entries_session ON confession_album_return_entries(session_id);
CREATE INDEX idx_contributions_session ON confession_album_contributions(session_id);

-- Simple RLS Policies
ALTER TABLE confession_album_chain_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Session participants can read" ON confession_album_chain_entries FOR SELECT USING (true);
CREATE POLICY "Players can insert their own chain entries" ON confession_album_chain_entries FOR INSERT WITH CHECK (true);
