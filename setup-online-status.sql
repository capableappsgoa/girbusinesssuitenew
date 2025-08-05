-- Setup for Online Status Tracking
-- This script sets up the necessary tables and functions for tracking user online status

-- Create online_status table to store user online status
CREATE TABLE IF NOT EXISTS online_status (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_online_status_user_id ON online_status(user_id);

-- Create index on last_seen for cleanup queries
CREATE INDEX IF NOT EXISTS idx_online_status_last_seen ON online_status(last_seen);

-- Function to update user's online status
CREATE OR REPLACE FUNCTION update_user_online_status(
  p_user_id UUID,
  p_is_online BOOLEAN,
  p_user_agent TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO online_status (user_id, is_online, last_seen, user_agent, ip_address, updated_at)
  VALUES (p_user_id, p_is_online, NOW(), p_user_agent, p_ip_address, NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    is_online = EXCLUDED.is_online,
    last_seen = EXCLUDED.last_seen,
    user_agent = COALESCE(EXCLUDED.user_agent, online_status.user_agent),
    ip_address = COALESCE(EXCLUDED.ip_address, online_status.ip_address),
    updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql;

-- Function to get online users
CREATE OR REPLACE FUNCTION get_online_users()
RETURNS TABLE (
  user_id UUID,
  name TEXT,
  email TEXT,
  role TEXT,
  avatar TEXT,
  last_seen TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    os.user_id,
    u.name,
    u.email,
    u.role,
    u.avatar,
    os.last_seen
  FROM online_status os
  JOIN users u ON os.user_id = u.id
  WHERE os.is_online = true 
    AND os.last_seen > NOW() - INTERVAL '5 minutes'
  ORDER BY os.last_seen DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old offline records (older than 1 hour)
CREATE OR REPLACE FUNCTION cleanup_old_online_status()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM online_status 
  WHERE last_seen < NOW() - INTERVAL '1 hour';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to cleanup old records (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-online-status', '*/15 * * * *', 'SELECT cleanup_old_online_status();');

-- Enable RLS on online_status table
ALTER TABLE online_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for online_status
-- Users can see all online statuses
CREATE POLICY "Users can view online status" ON online_status
  FOR SELECT USING (true);

-- Users can update their own online status
CREATE POLICY "Users can update own online status" ON online_status
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own online status
CREATE POLICY "Users can insert own online status" ON online_status
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to mark user as offline when they disconnect
CREATE OR REPLACE FUNCTION mark_user_offline(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE online_status 
  SET is_online = false, updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's online status
CREATE OR REPLACE FUNCTION get_user_online_status(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_online BOOLEAN;
BEGIN
  SELECT os.is_online AND os.last_seen > NOW() - INTERVAL '5 minutes'
  INTO is_online
  FROM online_status os
  WHERE os.user_id = p_user_id;
  
  RETURN COALESCE(is_online, false);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_online_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_online_status_updated_at
  BEFORE UPDATE ON online_status
  FOR EACH ROW
  EXECUTE FUNCTION update_online_status_updated_at();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON online_status TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_online_status(UUID, BOOLEAN, TEXT, INET) TO authenticated;
GRANT EXECUTE ON FUNCTION get_online_users() TO authenticated;
GRANT EXECUTE ON FUNCTION mark_user_offline(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_online_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_online_status() TO authenticated;

-- Insert sample data for testing (optional)
-- INSERT INTO online_status (user_id, is_online, last_seen) 
-- SELECT id, false, NOW() FROM users LIMIT 5; 