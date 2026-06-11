export const NOTIFICATION_CATEGORIES = {
  INVITATIONS: 'invitations',
  REMINDERS: 'reminders',
  GAME_NIGHT: 'game_night',
  ARTIFACTS: 'artifacts',
  DELAYED_ARTIFACTS: 'delayed_artifacts',
  WEB_EMAILS: 'web_emails',
} as const;

export type NotificationCategory = typeof NOTIFICATION_CATEGORIES[keyof typeof NOTIFICATION_CATEGORIES];
