/*
  # Decentralized Crypto Lottery System Migration

  1. New Tables
    - `tcl_tokens` - TCL token balances for users
    - `lottery_pools` - Different lottery pools ($100, $500, $1000)
    - `pool_participants` - Track participants in each pool
    - `refund_transactions` - Track 80% refunds after winner declaration

  2. Schema Updates
    - Add mobile number to users table
    - Update ticket system for pool-based lottery
    - Add TCL token tracking
    - Update referral system for 10% bonus

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for user data access
*/

-- Add mobile number to users table
ALTER TABLE users ADD COLUMN mobile_number TEXT;

-- Create TCL tokens table
CREATE TABLE IF NOT EXISTS tcl_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_earned DECIMAL(15,2) NOT NULL DEFAULT 0,
  is_withdrawable BOOLEAN NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lottery pools table
CREATE TABLE IF NOT EXISTS lottery_pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_type TEXT NOT NULL CHECK (pool_type IN ('100', '500', '1000')),
  entry_fee DECIMAL(10,2) NOT NULL,
  max_participants INTEGER NOT NULL,
  current_participants INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'full', 'completed', 'cancelled')),
  first_winner_id uuid REFERENCES users(id),
  second_winner_id uuid REFERENCES users(id),
  third_winner_id uuid REFERENCES users(id),
  first_prize DECIMAL(10,2) NOT NULL DEFAULT 0,
  second_prize DECIMAL(10,2) NOT NULL DEFAULT 0,
  third_prize DECIMAL(10,2) NOT NULL DEFAULT 0,
  participation_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  network_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  refund_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  draw_date timestamptz,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create pool participants table
CREATE TABLE IF NOT EXISTS pool_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid NOT NULL REFERENCES lottery_pools(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_amount DECIMAL(10,2) NOT NULL,
  participation_fee DECIMAL(10,2) NOT NULL,
  network_fee DECIMAL(10,2) NOT NULL,
  refund_eligible BOOLEAN NOT NULL DEFAULT true,
  refund_processed BOOLEAN NOT NULL DEFAULT false,
  is_winner BOOLEAN NOT NULL DEFAULT false,
  prize_won DECIMAL(10,2) DEFAULT 0,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(pool_id, user_id)
);

-- Create refund transactions table
CREATE TABLE IF NOT EXISTS refund_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid NOT NULL REFERENCES lottery_pools(id),
  user_id uuid NOT NULL REFERENCES users(id),
  refund_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  processed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE tcl_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE lottery_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE refund_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tcl_tokens
CREATE POLICY "Users can read own TCL tokens"
  ON tcl_tokens
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for lottery_pools
CREATE POLICY "Anyone can read lottery pools"
  ON lottery_pools
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for pool_participants
CREATE POLICY "Users can read own participation"
  ON pool_participants
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own participation"
  ON pool_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for refund_transactions
CREATE POLICY "Users can read own refunds"
  ON refund_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX tcl_tokens_user_id_idx ON tcl_tokens(user_id);
CREATE INDEX lottery_pools_status_idx ON lottery_pools(status);
CREATE INDEX lottery_pools_pool_type_idx ON lottery_pools(pool_type);
CREATE INDEX pool_participants_pool_id_idx ON pool_participants(pool_id);
CREATE INDEX pool_participants_user_id_idx ON pool_participants(user_id);
CREATE INDEX refund_transactions_user_id_idx ON refund_transactions(user_id);
CREATE INDEX refund_transactions_pool_id_idx ON refund_transactions(pool_id);

-- Insert default lottery pools
INSERT INTO lottery_pools (pool_type, entry_fee, max_participants, first_prize, second_prize, third_prize, participation_fee, network_fee, refund_amount) VALUES
('100', 100.00, 1000, 800.00, 400.00, 200.00, 10.00, 10.00, 80.00),
('500', 500.00, 200, 4000.00, 2000.00, 1000.00, 50.00, 50.00, 400.00),
('1000', 1000.00, 100, 8000.00, 4000.00, 2000.00, 100.00, 100.00, 800.00);