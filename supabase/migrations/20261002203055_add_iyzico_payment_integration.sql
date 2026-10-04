/*
# Add iyzico Payment Tracking to pro_subscriptions + Create payments table

## Overview
Adds iyzico payment integration fields to the existing `pro_subscriptions` table and creates a new `payments` table to track individual payment transactions. This enables the app to accept payments via iyzico (a Turkish payment gateway) instead of RevenueCat/Apple/Google in-app purchases.

## 1. Modified Tables

### pro_subscriptions (existing, ALTER)
- Add `iyzico_payment_id` (text, nullable): The iyzico payment transaction ID
- Add `iyzico_conversation_id` (text, nullable): The iyzico conversation ID for tracking
- Add `iyzico_last_payment_status` (text, nullable): 'pending' | 'success' | 'failed'

## 2. New Tables

### payments
- `id` (uuid, primary key, auto-generated)
- `conversation_id` (text, not null): Unique ID per checkout attempt (generated client-side)
- `plan_id` (text, not null): 'monthly' | 'lifetime'
- `amount` (numeric, not null): Payment amount in TRY
- `currency` (text, default 'TRY')
- `status` (text, not null, default 'pending'): 'pending' | 'success' | 'failed'
- `iyzico_payment_id` (text, nullable): Returned by iyzico on success
- `iyzico_raw_response` (jsonb, nullable): Full iyzico response for debugging
- `user_email` (text, nullable): Payer email
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

## 3. Security
- RLS enabled on `payments` table with anon+authenticated CRUD (single-tenant app)
- No changes to existing pro_subscriptions RLS policies (already open to anon+authenticated)

## 4. Notes
- The `payments` table records every checkout attempt, enabling audit trails and reconciliation
- `conversation_id` links the client-side checkout request to the iyzico transaction
- When a payment succeeds, the app updates `pro_subscriptions.is_pro = true` and records the iyzico IDs
*/

-- Add iyzico fields to pro_subscriptions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pro_subscriptions' AND column_name = 'iyzico_payment_id') THEN
    ALTER TABLE pro_subscriptions ADD COLUMN iyzico_payment_id text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pro_subscriptions' AND column_name = 'iyzico_conversation_id') THEN
    ALTER TABLE pro_subscriptions ADD COLUMN iyzico_conversation_id text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pro_subscriptions' AND column_name = 'iyzico_last_payment_status') THEN
    ALTER TABLE pro_subscriptions ADD COLUMN iyzico_last_payment_status text;
  END IF;
END $$;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id text NOT NULL,
  plan_id text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'TRY',
  status text NOT NULL DEFAULT 'pending',
  iyzico_payment_id text,
  iyzico_raw_response jsonb,
  user_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_payments" ON payments;
CREATE POLICY "anon_select_payments" ON payments FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_payments" ON payments;
CREATE POLICY "anon_insert_payments" ON payments FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_payments" ON payments;
CREATE POLICY "anon_update_payments" ON payments FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_payments" ON payments;
CREATE POLICY "anon_delete_payments" ON payments FOR DELETE
TO anon, authenticated USING (true);
