-- =============================================
-- Migration 009: Add nutrition-related fields to user_stats
-- =============================================

-- Core fields needed for BMR/TDEE calculation
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS height_cm NUMERIC(5,1);
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS activity_level TEXT
  CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active'));

-- Notification preferences (extensible JSONB)
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}';
