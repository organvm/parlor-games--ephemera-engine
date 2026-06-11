import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

// Helper to check if current time is in quiet hours for a given timezone
function isInQuietHours(timezone: string = 'UTC'): boolean {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    });
    const currentHour = parseInt(formatter.format(new Date()), 10);
    // Quiet hours: 10 PM (22) to 8 AM (8)
    return currentHour >= 22 || currentHour < 8;
  } catch (e) {
    // If invalid timezone, default to not quiet
    return false;
  }
}

// Helper to get next morning 8 AM for a given timezone
function getNextMorning(timezone: string = 'UTC'): Date {
  const date = new Date();
  // Simplified for this example: add 12 hours (could be improved with a real timezone lib)
  date.setHours(date.getHours() + 12);
  return date;
}

serve(async (req) => {
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch pending notifications
    const { data: notifications, error: fetchError } = await supabase
      .from('notification_queue')
      .select('*')
      .in('status', ['pending', 'ready'])
      .lte('scheduled_for', new Date().toISOString())
      .limit(100);

    if (fetchError) throw fetchError;
    if (!notifications || notifications.length === 0) {
      return new Response(JSON.stringify({ message: "No pending notifications" }), { status: 200 });
    }

    const expoPushMessages: any[] = [];
    const pushNotificationIds: string[] = [];
    const updates: any[] = [];
    const tokensToDeactivate: string[] = [];

    // Pre-fetch push tokens for all recipients
    const recipientIds = [...new Set(notifications.filter(n => n.channel === 'push' && n.recipient_id).map(n => n.recipient_id))];
    
    let tokensMap = new Map();
    if (recipientIds.length > 0) {
      const { data: pushTokens } = await supabase
        .from('push_tokens')
        .select('user_id, token')
        .in('user_id', recipientIds)
        .eq('is_active', true);
        
      if (pushTokens) {
        pushTokens.forEach(pt => {
          if (!tokensMap.has(pt.user_id)) tokensMap.set(pt.user_id, []);
          tokensMap.get(pt.user_id).push(pt.token);
        });
      }
    }

    // Pre-fetch timezones from session_participations
    const sessionUserPairs = notifications.filter(n => n.session_id && n.recipient_id).map(n => ({ session_id: n.session_id, user_id: n.recipient_id }));
    let tzMap = new Map(); // "session_id:user_id" -> timezone
    
    if (sessionUserPairs.length > 0) {
      const uniquePairs = sessionUserPairs.filter((v, i, a) => a.findIndex(t => (t.session_id === v.session_id && t.user_id === v.user_id)) === i);
      
      // Unfortunately Supabase REST doesn't support an IN clause with multiple columns easily.
      // We will do a generic fetch for these user_ids.
      const userIds = [...new Set(uniquePairs.map(p => p.user_id))];
      const { data: participations } = await supabase
        .from('session_participations')
        .select('session_id, user_id, timezone')
        .in('user_id', userIds);
        
      if (participations) {
        participations.forEach(p => {
          tzMap.set(`${p.session_id}:${p.user_id}`, p.timezone || 'UTC');
        });
      }
    }

    for (const notification of notifications) {
      let tz = 'UTC';
      if (notification.session_id && notification.recipient_id) {
        tz = tzMap.get(`${notification.session_id}:${notification.recipient_id}`) || 'UTC';
      }
      
      // Quiet hours check
      if (isInQuietHours(tz)) {
        updates.push({
          id: notification.id,
          status: 'pending',
          scheduled_for: getNextMorning(tz).toISOString(),
          updated_at: new Date().toISOString()
        });
        continue;
      }

      if (notification.channel === 'push') {
        const tokens = tokensMap.get(notification.recipient_id) || [];
        if (tokens.length === 0) {
          updates.push({
            id: notification.id,
            status: 'failed',
            error: 'No active push tokens',
            updated_at: new Date().toISOString()
          });
          continue;
        }

        tokens.forEach((token: string) => {
          expoPushMessages.push({
            to: token,
            title: notification.title,
            body: notification.body,
            data: { notificationId: notification.id, ...notification.data }
          });
          pushNotificationIds.push(notification.id);
        });
      } else if (notification.channel === 'email') {
        // Implement email sending (e.g. Resend)
        // For now, mark as sent since this is a stub
        console.log(`Sending email to ${notification.recipient_email}: ${notification.title}`);
        updates.push({
          id: notification.id,
          status: 'sent',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }

    // Send Expo pushes in batches
    if (expoPushMessages.length > 0) {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expoPushMessages)
      });
      
      const receipts = await response.json();
      
      // Process receipts
      if (receipts.data) {
        receipts.data.forEach((receipt: any, i: number) => {
          const notificationId = pushNotificationIds[i];
          const token = expoPushMessages[i].to;
          
          if (receipt.status === 'error') {
            if (receipt.details && receipt.details.error === 'DeviceNotRegistered') {
              tokensToDeactivate.push(token);
            }
            updates.push({
              id: notificationId,
              status: 'failed',
              error: receipt.message,
              updated_at: new Date().toISOString()
            });
          } else {
            updates.push({
              id: notificationId,
              status: 'sent',
              sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        });
      }
    }

    // Apply database updates
    if (tokensToDeactivate.length > 0) {
      await supabase
        .from('push_tokens')
        .update({ is_active: false })
        .in('token', tokensToDeactivate);
    }

    for (const update of updates) {
      await supabase
        .from('notification_queue')
        .update(update)
        .eq('id', update.id);
    }

    return new Response(JSON.stringify({ 
      processed: notifications.length,
      sentPushes: expoPushMessages.length,
      deactivatedTokens: tokensToDeactivate.length
    }), { headers: { "Content-Type": "application/json" } });

  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});
