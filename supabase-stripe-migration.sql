-- Add Stripe subscriptions table
-- Run this AFTER running supabase-schema.sql

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('trialing', 'active', 'canceled', 'past_due', 'unpaid', 'incomplete')),
  price_id TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription" ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add subscription info to users table (optional)
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';

COMMENT ON TABLE subscriptions IS 'Stripe subscription data';
COMMENT ON COLUMN subscriptions.status IS 'Subscription status from Stripe';
COMMENT ON COLUMN subscriptions.price_id IS 'Stripe Price ID for the plan';
