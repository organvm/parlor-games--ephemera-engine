import { SessionState } from '../types/session';

export const VALID_TRANSITIONS: Record<SessionState, SessionState[]> = {
  'DRAFT': ['INVITING'],
  'INVITING': ['PREPARING', 'ARCHIVED'],
  'PREPARING': ['ACTIVE', 'ARCHIVED'],
  'ACTIVE': ['COMPLETE', 'ARCHIVED'],
  'COMPLETE': ['ARCHIVED'],
  'ARCHIVED': []
};
