-- =============================================
-- Migration 006: Add goals field and onboarding tracking
-- =============================================

-- Add goals column to user_stats
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS goals TEXT;
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;

-- Add current_program_details for storing plan-specific data
ALTER TABLE user_stats ADD COLUMN IF NOT EXISTS current_program_details JSONB;
