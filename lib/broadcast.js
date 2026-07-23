import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function broadcastEvent(event, payload) {
  try {
    const channel = supabase.channel('league-events');
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: event,
          payload: payload
        }).then(() => {
          supabase.removeChannel(channel);
        });
      }
    });
  } catch (error) {
    console.error("Broadcast failed:", error);
  }
}
