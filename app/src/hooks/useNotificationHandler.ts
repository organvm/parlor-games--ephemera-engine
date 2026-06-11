import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useNotificationHandler() {
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Set up categories for iOS/Android
    Notifications.setNotificationCategoryAsync('invitation', [
      {
        identifier: 'accept',
        buttonTitle: 'Accept',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'decline',
        buttonTitle: 'Decline',
        options: { isDestructive: true, opensAppToForeground: false },
      },
    ]);

    // Handle foreground notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // Could show custom in-app toast here if desired
    });

    // Handle tap on notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      const action = response.actionIdentifier;

      // Handle route based on notification data
      if (data?.url) {
        // e.g. "parlor://invite/123"
        // we can navigate to the path
        router.push(data.url as any);
      } else if (data?.sessionId) {
        router.push(`/game/${data.sessionId}` as any);
      }
      
      // If there's an action, we might process it (e.g. accepted invite in background)
      if (action === 'accept') {
        // We would likely call a supbase RPC or similar, 
        // but typically opensAppToForeground means we let the UI handle it after routing
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router]);
}
