import { MurderMysteryData } from '../types/murder-mystery';

export type ValidationIssue = {
  level: 'error' | 'warning';
  message: string;
  path: string;
};

export function validateScenario(data: MurderMysteryData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const characterIds = new Set(data.characters.map(c => c.id));

  // 1. Validate characters
  if (data.characters.length < 4) {
    issues.push({ level: 'error', message: 'At least 4 characters are required', path: 'characters' });
  }

  const murderers = data.characters.filter(c => c.is_murderer);
  if (murderers.length !== 1) {
    issues.push({ level: 'error', message: 'Exactly one character must be the murderer', path: 'characters' });
  }

  const victims = data.characters.filter(c => c.is_victim);
  if (victims.length !== 1) {
    issues.push({ level: 'error', message: 'Exactly one character must be the victim', path: 'characters' });
  }

  if (murderers.length === 1 && victims.length === 1 && murderers[0].id === victims[0].id) {
    issues.push({ level: 'error', message: 'The murderer and the victim cannot be the same person', path: 'characters' });
  }

  data.characters.forEach((char, idx) => {
    if (char.relationship?.target_character_id) {
      if (!characterIds.has(char.relationship.target_character_id)) {
        issues.push({ 
          level: 'error', 
          message: `Character ${char.id} has invalid relationship target ${char.relationship.target_character_id}`, 
          path: `characters[${idx}].relationship.target_character_id` 
        });
      }
    }
  });

  // 2. Validate crime graph
  if (!characterIds.has(data.crime.murderer_id)) {
    issues.push({ level: 'error', message: 'Crime murderer_id must reference a valid character', path: 'crime.murderer_id' });
  } else if (data.crime.murderer_id !== murderers[0]?.id) {
    issues.push({ level: 'error', message: 'Crime murderer_id does not match character is_murderer flag', path: 'crime.murderer_id' });
  }

  if (!characterIds.has(data.crime.victim_id)) {
    issues.push({ level: 'error', message: 'Crime victim_id must reference a valid character', path: 'crime.victim_id' });
  } else if (data.crime.victim_id !== victims[0]?.id) {
    issues.push({ level: 'error', message: 'Crime victim_id does not match character is_victim flag', path: 'crime.victim_id' });
  }

  data.crime.red_herrings.forEach((rh, idx) => {
    if (!characterIds.has(rh.character_id)) {
      issues.push({ level: 'error', message: `Red herring references invalid character ${rh.character_id}`, path: `crime.red_herrings[${idx}].character_id` });
    }
  });

  // 3. Validate timeline
  const orders = data.crime.timeline.map(t => t.order);
  const uniqueOrders = new Set(orders);
  if (orders.length !== uniqueOrders.size) {
    issues.push({ level: 'warning', message: 'Timeline has duplicate order numbers', path: 'crime.timeline' });
  }
  
  const sortedTimeline = [...data.crime.timeline].sort((a, b) => a.order - b.order);
  for (let i = 0; i < sortedTimeline.length - 1; i++) {
    if (sortedTimeline[i].act > sortedTimeline[i + 1].act) {
      issues.push({ level: 'error', message: 'Timeline acts must be strictly non-decreasing', path: `crime.timeline` });
      break;
    }
  }

  return issues;
}
