// supabase/functions/stripe-webhook/index.ts
// Handles Stripe webhook events and keeps profiles.subscription_status in sync.
// Deploy: supabase functions deploy stripe-webhook
// Set Stripe webhook endpoint to: https://<project>.supabase.co/functions/v1/stripe-webhook

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  async function updateSubscriptionStatus(customerId: string, status: 'premium' | 'free') {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .limit(1);
    if (profiles && profiles.length > 0) {
      await supabase
        .from('profiles')
        .update({ subscription_status: status })
        .eq('id', profiles[0].id);
    }
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const active = subscription.status === 'active' || subscription.status === 'trialing';
      await updateSubscriptionStatus(subscription.customer as string, active ? 'premium' : 'free');
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await updateSubscriptionStatus(subscription.customer as string, 'free');
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.customer) {
        await updateSubscriptionStatus(invoice.customer as string, 'free');
      }
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
