import { SessionState } from '../types/session';
import { VALID_TRANSITIONS } from '../constants/session-states';

export const canTransition = (currentState: SessionState, targetState: SessionState): boolean => {
  const allowedTransitions = VALID_TRANSITIONS[currentState];
  return allowedTransitions ? allowedTransitions.includes(targetState) : false;
};
