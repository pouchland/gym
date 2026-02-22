-- =============================================
-- Migration 007: Program Templates
-- Structured workout plans for each split
-- =============================================

-- Table for storing program templates
CREATE TABLE program_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  days_per_week INTEGER NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  goal TEXT, -- hypertrophy, strength, endurance, hybrid
  duration_weeks INTEGER DEFAULT 12,
  
  -- Metadata
  science_basis TEXT,
  key_principles TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for weeks within a program
CREATE TABLE program_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id TEXT REFERENCES program_templates(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  phase TEXT, -- accumulation, intensification, deload, etc.
  focus TEXT,
  notes TEXT,
  
  UNIQUE(program_id, week_number)
);

-- Table for workouts within a week
CREATE TABLE program_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id TEXT REFERENCES program_templates(id) ON DELETE CASCADE,
  week_id UUID REFERENCES program_weeks(id) ON DELETE CASCADE,
  workout_number INTEGER NOT NULL, -- 1, 2, 3, etc. within the week
  name TEXT NOT NULL,
  focus TEXT, -- e.g., "Push", "Pull", "Legs", "Upper", "Lower"
  
  -- Session parameters
  target_duration_minutes INTEGER,
  rpe_target INTEGER,
  
  UNIQUE(program_id, week_id, workout_number)
);

-- Table for exercises within a workout
CREATE TABLE program_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES program_workouts(id) ON DELETE CASCADE,
  exercise_library_id UUID REFERENCES exercise_library(id),
  
  -- Exercise parameters (can be overridden by user stats)
  sets INTEGER NOT NULL,
  reps TEXT, -- can be range like "8-12" or fixed like "5"
  intensity_percent_1rm INTEGER, -- if null, use RPE-based
  rpe_target INTEGER,
  rest_seconds INTEGER,
  
  -- Ordering
  exercise_order INTEGER NOT NULL,
  
  -- Notes for the athlete
  coaching_notes TEXT,
  
  -- Substitution options
  alternative_exercise_ids UUID[]
);

-- Enable RLS
ALTER TABLE program_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_exercises ENABLE ROW LEVEL SECURITY;

-- Everyone can view program templates (they're system templates)
CREATE POLICY "Everyone can view program templates" ON program_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Everyone can view program weeks" ON program_weeks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Everyone can view program workouts" ON program_workouts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Everyone can view program exercises" ON program_exercises FOR SELECT TO authenticated USING (true);

-- =============================================
-- Seed: Full Body Program (3 days)
-- =============================================

INSERT INTO program_templates (id, name, description, days_per_week, difficulty, goal, duration_weeks, science_basis, key_principles) VALUES
('fullbody', 'Full Body Foundation', '3-day full body training. Squat, hinge, push, pull, carry — three times per week. Best for beginners and those returning after a break.', 3, 'beginner', 'hypertrophy', 12, 
'Research shows hitting muscles twice per week outperforms once per week when volume is equated. 3-day full body delivers 9-12 working sets per muscle group per week, sufficient for meaningful progress. Motor learning benefits of practicing movements 3x/week produces faster technique improvement.',
ARRAY['Progressive overload on compound movements', '9-12 sets per muscle per week', 'Practice squat, hinge, push, pull, carry patterns', 'Train 1-3 reps from failure', 'Add weight when you can complete all sets at top of rep range']
);

-- Week 1-4: Accumulation (sets of 10-12, moderate weight)
INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) 
SELECT 'fullbody', generate_series(1, 4), 'accumulation', 'Build work capacity and technique', 'Focus on movement quality. All sets should feel controlled. Use this block to establish baseline weights.';

-- Week 5-8: Intensification (sets of 6-8, heavier)
INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) 
SELECT 'fullbody', generate_series(5, 8), 'intensification', 'Increase intensity', 'Start pushing closer to failure. Weights should increase from accumulation block.';

-- Week 9-11: Strength (sets of 4-6, heavy)
INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) 
SELECT 'fullbody', generate_series(9, 11), 'strength', 'Build strength', 'Heaviest weights of the program. Focus on bar speed and tight form.';

-- Week 12: Deload
INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) 
VALUES ('fullbody', 12, 'deload', 'Recovery', 'Reduce weights by 10-15%. Focus on movement quality and preparation for next cycle.');

-- =============================================
-- Seed: Upper/Lower Split (4 days)
-- =============================================

INSERT INTO program_templates (id, name, description, days_per_week, difficulty, goal, duration_weeks, science_basis, key_principles) VALUES
('ul', 'Upper/Lower Classic', 'Two upper body and two lower body sessions per week. Most efficient structure for intermediate clients — produces approximately 85% of the gains of a 5-day program with meaningfully less time investment.', 4, 'intermediate', 'hypertrophy', 12,
'Research consistently supports upper/lower split as producing approximately 85% of the gains of a 5-day program with meaningfully less time investment. Highly flexible — upper days can be differentiated (horizontal vs vertical focus) and lower days can be differentiated (quad vs posterior chain emphasis).',
ARRAY['4 days per week: Upper/Lower/Upper/Lower', '12-16 sets per muscle per week', 'Differentiate upper days (horizontal vs vertical)', 'Differentiate lower days (quad vs posterior)', 'Progressive overload across 12 weeks']
);

INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) 
SELECT 'ul', generate_series(1, 3), 'accumulation', 'Build volume base', 'Higher reps, moderate weight. Establish movement patterns.';

INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) 
SELECT 'ul', generate_series(4, 4), 'deload', 'Recovery', 'Reduce volume by 40% before intensification.';

INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) 
SELECT 'ul', generate_series(5, 7), 'intensification', 'Increase intensity', 'Lower reps, heavier weight. Push closer to failure.';

INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) 
SELECT 'ul', generate_series(8, 8), 'deload', 'Recovery', 'Reduce volume by 40% before strength phase.';

INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) 
SELECT 'ul', generate_series(9, 11), 'strength', 'Maximal strength', 'Heaviest weights. Low reps with full recovery.';

INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) 
SELECT 'ul', generate_series(12, 12), 'deload', 'Final recovery', 'Prepare for next cycle or testing.';

-- =============================================
-- Seed: PPL (6 days)
-- =============================================

INSERT INTO program_templates (id, name, description, days_per_week, difficulty, goal, duration_weeks, science_basis, key_principles) VALUES
('ppl', 'Push Pull Legs', 'Push (chest/shoulders/triceps), Pull (back/biceps), Legs — run twice per week. Popular with intermediate and advanced lifters who can consistently train 6 days per week.', 6, 'intermediate', 'hypertrophy', 12,
'PPL provides twice-weekly frequency for every muscle at high per-session volume. The per-session focus allows very thorough work. Critical caveat: PPL only functions as designed when all six sessions happen. Missing two sessions in a week means muscles get hit once instead of twice.',
ARRAY['6 days per week: Push/Pull/Legs x2', '15-20 sets per muscle per week', 'All six sessions must be completed', 'High per-session volume allows thorough work', 'Miss 2 sessions = muscles hit once not twice']
);

INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) 
SELECT 'ppl', generate_series(1, 4), 'accumulation', 'Build work capacity', 'High volume, moderate intensity. Establish baseline.';

INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) 
SELECT 'ppl', generate_series(5, 8), 'intensification', 'Increase intensity', 'Reduce volume slightly, increase weight.';

INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) 
SELECT 'ppl', generate_series(9, 11), 'strength', 'Heavy compounds', 'Focus on strength on main lifts.';

INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) 
SELECT 'ppl', generate_series(12, 12), 'deload', 'Recovery', 'Reduce volume by 50% before next cycle.';

-- =============================================
-- Seed: PPLUL (5 days)
-- =============================================

INSERT INTO program_templates (id, name, description, days_per_week, difficulty, goal, duration_weeks, science_basis, key_principles) VALUES
('pplul', 'PPL + Upper/Lower', 'The 5-day sweet spot. Push → Pull → Legs → Upper → Lower. Three upper body sessions and two lower body sessions per week. Highest-rated 5-day format for hypertrophy.', 5, 'intermediate', 'hypertrophy', 12,
'Predictive hypertrophy modeling scores PPLUL at 9.0 out of 10 — the highest of any 5-day format. The upper day that follows the PPL sequence is an opportunity to bring up lagging muscle groups or vary movement patterns.',
ARRAY['5 days: Push/Pull/Legs/Upper/Lower', '3 upper sessions, 2 lower sessions per week', 'Highest rated 5-day format (9.0/10)', 'Perfect middle ground between volume and recovery', 'Bring up lagging muscles on second upper day']
);

INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) 
SELECT 'pplul', generate_series(1, 3), 'accumulation', 'Volume base', 'High reps, establish patterns.';

INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) 
SELECT 'pplul', generate_series(4, 4), 'deload', 'Recovery', 'Brief deload before intensification.';

INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) 
SELECT 'pplul', generate_series(5, 7), 'intensification', 'Build intensity', 'Increase weight, lower reps.';

INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) 
SELECT 'pplul', generate_series(8, 8), 'deload', 'Recovery', 'Brief deload before strength.';

INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) 
SELECT 'pplul', generate_series(9, 11), 'strength', 'Max strength', 'Heavy compounds, maximal effort.';

INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) 
SELECT 'pplul', generate_series(12, 12), 'deload', 'Final deload', 'Recovery and preparation for next cycle.';

-- =============================================
-- Seed: 5/3/1 (4 days)
-- =============================================

INSERT INTO program_templates (id, name, description, days_per_week, difficulty, goal, duration_weeks, science_basis, key_principles) VALUES
('531', '5/3/1 Strength', 'Jim Wendler\'s proven strength program. Simple percentage-based progression built around four main lifts: squat, bench, deadlift, and overhead press. The gold standard for pure strength development.', 4, 'intermediate', 'strength', 12,
'5/3/1 uses submaximal training with calculated percentages to build strength over time without burning out. The core principle: start light, progress slowly, and break personal records. This approach produces consistent long-term strength gains with minimal injury risk.',
ARRAY['4 days: Squat, Bench, Deadlift, Press', 'Percentage-based waves (5s, 3s, 1s, deload)', 'Start light, progress slowly', 'Break personal records on final sets', 'Minimum 4 main lifts per session + assistance']
);

-- 5/3/1 has a specific structure - we'll add weeks but the real magic is in the workout structure
INSERT INTO program_weeks (program_id, week_number, phase, focus, notes) VALUES
('531', 1, '5s_week', 'Sets of 5', 'Week 1: 3 sets of 5 at 65%, 75%, 85% of training max. AMRAP on final set.'),
('531', 2, '5s_week', 'Sets of 5', 'Week 2: 3 sets of 5 at 65%, 75%, 85% of training max. AMRAP on final set.'),
('531', 3, '3s_week', 'Sets of 3', 'Week 3: 3 sets of 3 at 70%, 80%, 90% of training max. AMRAP on final set.'),
('531', 4, 'deload', 'Recovery', 'Deload week: 3 sets of 5 at 40%, 50%, 60%.'),
('531', 5, '5s_week', 'Sets of 5', 'New cycle: Increase training max by 2.5kg upper, 5kg lower.'),
('531', 6, '5s_week', 'Sets of 5', 'Continue progression.'),
('531', 7, '3s_week', 'Sets of 3', 'Heavier weights.'),
('531', 8, 'deload', 'Recovery', 'Deload before intensification.'),
('531', 9, '531_week', '5/3/1', 'Week 9: 3 sets at 75%, 85%, 95%. AMRAP on final set.'),
('531', 10, '531_week', '5/3/1', 'Peak intensity.'),
('531', 11, '531_week', '5/3/1', 'Test week preparation.'),
('531', 12, 'deload', 'Recovery', 'Deload before testing or new cycle.');
