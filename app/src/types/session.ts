import { Database } from './database';

export type SessionRow = Database['public']['Tables']['sessions']['Row'];
export type SessionInsert = Database['public']['Tables']['sessions']['Insert'];
export type SessionUpdate = Database['public']['Tables']['sessions']['Update'];

export type GameType = 'mystery' | 'trivia' | 'social';
export type SessionState = 'DRAFT' | 'INVITING' | 'PREPARING' | 'ACTIVE' | 'COMPLETE' | 'ARCHIVED';

export interface CreateSessionParams {
  name: string;
  game_type: GameType;
  date_time: string;
  config: Record<string, any>;
}
