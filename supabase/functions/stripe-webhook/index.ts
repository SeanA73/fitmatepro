import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@17.4.0?target=deno&no-check'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '')

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return new Response('No signature', { status: 400 })
    }

    let event: Stripe.Event

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Invalid signature', { status: 400 })
    }

    console.log('Processing webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal server error', { status: 500 })
  }
})

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id)
  
  const userId = session.metadata?.supabase_user_id
  const planType = session.metadata?.plan_type
  
  if (!userId || !planType) {
    console.error('Missing metadata in checkout session')
    return
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
  
  await upsertSubscription(userId, subscription, planType)
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  console.log('Subscription changed:', subscription.id)
  
  const userId = subscription.metadata?.supabase_user_id
  const planType = subscription.metadata?.plan_type
  
  if (!userId || !planType) {
    console.error('Missing metadata in subscription')
    return
  }

  await upsertSubscription(userId, subscription, planType)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id)
  
  const { error } = await supabaseClient
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating canceled subscription:', error)
  }

  // Update profile subscription plan to free
  const userId = subscription.metadata?.supabase_user_id
  if (userId) {
    await supabaseClient
      .from('profiles')
      .update({ subscription_plan: 'free' })
      .eq('id', userId)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded:', invoice.id)
  
  const subscriptionId = invoice.subscription as string
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  
  // Record revenue event
  const userId = subscription.metadata?.supabase_user_id
  if (userId && invoice.amount_paid) {
    await supabaseClient
      .from('revenue_events')
      .insert([{
        user_id: userId,
        event_type: 'subscription_payment',
        amount_cents: invoice.amount_paid,
        currency: invoice.currency?.toUpperCase() || 'USD',
        platform: 'stripe',
        metadata: {
          invoice_id: invoice.id,
          subscription_id: subscriptionId
        }
      }])
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed:', invoice.id)
  
  const subscriptionId = invoice.subscription as string
  
  // Update subscription status to past_due
  const { error } = await supabaseClient
    .from('subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscriptionId)

  if (error) {
    console.error('Error updating past due subscription:', error)
  }
}

async function upsertSubscription(userId: string, subscription: Stripe.Subscription, planType: string) {
  const subscriptionData = {
    user_id: userId,
    plan_type: planType,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    cancel_at_period_end: subscription.cancel_at_period_end,
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    updated_at: new Date().toISOString()
  }

  // Upsert subscription
  const { error: subscriptionError } = await supabaseClient
    .from('subscriptions')
    .upsert(subscriptionData, { 
      onConflict: 'stripe_subscription_id'
    })

  if (subscriptionError) {
    console.error('Error upserting subscription:', subscriptionError)
    return
  }

  // Update profile subscription plan
  const { error: profileError } = await supabaseClient
    .from('profiles')
    .update({ subscription_plan: planType })
    .eq('id', userId)

  if (profileError) {
    console.error('Error updating profile subscription plan:', profileError)
  }

  console.log('Successfully updated subscription for user:', userId)
}
