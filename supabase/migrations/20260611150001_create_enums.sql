-- Authentication providers
CREATE TYPE auth_provider AS ENUM ('email', 'apple', 'google');

-- Game types
CREATE TYPE game_type AS ENUM (
  'confession_album',
  'murder_mystery',
  'whose_memory',
  'exquisite_corpse'
);

-- Session lifecycle states
CREATE TYPE session_state AS ENUM (
  'DRAFT',
  'INVITING',
  'PREPARING',
  'ACTIVE',
  'COMPLETE',
  'ARCHIVED',
  'CANCELED'
);

-- Participant roles
CREATE TYPE participant_role AS ENUM ('host', 'app_player', 'web_player');

-- RSVP statuses
CREATE TYPE rsvp_status AS ENUM ('pending', 'accepted', 'declined', 'maybe');
