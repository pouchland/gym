-- =============================================
-- Complete Exercise Library Seed
-- Run this after migration 003
-- =============================================

INSERT INTO exercise_library (
  name, muscle_group, primary_muscles, secondary_muscles, equipment, difficulty,
  description, why_good, pro_tips, common_mistakes, is_compound, is_isolation
) VALUES

-- BACK (15 exercises)
('Barbell Deadlift', 'Back', ARRAY['lower_back', 'lats', 'traps'], ARRAY['hamstrings', 'glutes', 'forearms'], 'barbell', 'advanced',
 'The ultimate full-body pulling exercise. Lift bar from floor to hip level.',
 'Builds total body strength and muscle mass. Heavy loading potential for back thickness.',
 ARRAY['Keep bar close to shins', 'Hinge at hips, don''t squat', 'Neutral spine throughout', 'Lock out hips at top'],
 ARRAY['Rounding lower back', 'Bending arms then pulling', 'Squatting the weight up', 'Hyperextending at lockout'],
 true, false),

('Pull-Ups', 'Back', ARRAY['lats', 'biceps'], ARRAY['rear_delts', 'forearms', 'core'], 'bodyweight', 'intermediate',
 'Hang from bar, pull body up until chin clears bar. Gold standard back exercise.',
 'Best bodyweight exercise for back width. Scalable with assistance or weight.',
 ARRAY['Start from dead hang', 'Pull chest to bar', 'Control the negative', 'Full range of motion'],
 ARRAY['Half reps', 'Kipping/swinging', 'Not going to dead hang', 'Shrugging shoulders'),
 true, false),

('Chin-Ups', 'Back', ARRAY['lats', 'biceps'], ARRAY['rear_delts', 'forearms'], 'bodyweight', 'intermediate',
 'Pull-up with palms facing you (supinated grip). More bicep emphasis.',
 'Great for bicep and lat development. Often easier than pull-ups for beginners.',
 ARRAY['Palms facing you, shoulder width', 'Pull chest to bar', 'Squeeze biceps at top', 'Full range of motion'],
 ARRAY['Using momentum', 'Half reps', 'Shrugging at top', 'Crossing legs excessively'],
 true, false),

('Barbell Bent-Over Row', 'Back', ARRAY['lats', 'rhomboids', 'middle_traps'], ARRAY['biceps', 'lower_back'], 'barbell', 'intermediate',
 'Bend at hips, row barbell to lower chest/stomach.',
 'Heavy compound row for back thickness. Great strength builder.',
 ARRAY['Hinge at hips ~45 degrees', 'Pull to lower chest', 'Squeeze shoulder blades', 'Don''t use excessive momentum'],
 ARRAY['Standing too upright', 'Rounding lower back', 'Using too much body english', 'Partial range of motion'],
 true, false),

('Pendlay Row', 'Back', ARRAY['lats', 'rhomboids'], ARRAY['biceps', 'lower_back'], 'barbell', 'advanced',
 'Barbell row with torso parallel to floor. Explosive pull from floor each rep.',
 'Strict form row that eliminates cheating. Great for power and back development.',
 ARRAY['Torso parallel to floor', 'Pull explosively to sternum', 'Return bar to floor each rep', 'Keep core tight'],
 ARRAY['Raising torso during pull', 'Not touching floor between reps', 'Using legs to assist', 'Rounding back'],
 true, false),

('Dumbbell Row', 'Back', ARRAY['lats', 'rhomboids'], ARRAY['biceps', 'rear_delts'], 'dumbbell', 'beginner',
 'One hand on bench, row dumbbell with other arm.',
 'Unilateral exercise for back development. Easy to learn, heavy loading potential.',
 ARRAY['Pull to hip, not chest', 'Squeeze lat at top', 'Control the negative', 'Don''t rotate torso excessively'],
 ARRAY['Too much body rotation', 'Pulling to chest instead of hip', 'Using momentum', 'Incomplete range'],
 true, false),

('Chest-Supported Row', 'Back', ARRAY['lats', 'rhomboids', 'middle_traps'], ARRAY['biceps', 'rear_delts'], 'machine', 'beginner',
 'Lie face down on incline bench, row weights up.',
 'Eliminates lower back strain. Pure back isolation with heavy weight.',
 ARRAY['Set bench to 30-45 degrees', 'Pull elbows back, not up', 'Squeeze shoulder blades', 'Full stretch at bottom'],
 ARRAY['Bench too steep', 'Shrugging shoulders', 'Partial range of motion', 'Using momentum'],
 false, false),

('Seated Cable Row', 'Back', ARRAY['lats', 'rhomboids'], ARRAY['biceps', 'rear_delts'], 'cable', 'beginner',
 'Sit at cable station, row handle to stomach.',
 'Constant tension and controlled movement. Great for back thickness.',
 ARRAY['Sit upright, slight knee bend', 'Pull to lower stomach', 'Squeeze back at contraction', 'Full stretch forward'],
 ARRAY['Leaning back too far', 'Shrugging shoulders', 'Partial range of motion', 'Using momentum'],
 false, false),

('Lat Pulldown', 'Back', ARRAY['lats'], ARRAY['biceps', 'rear_delts'], 'cable', 'beginner',
 'Pull bar down to upper chest from cable machine.',
 'Accessible alternative to pull-ups. Great for lat width.',
 ARRAY['Lean back slightly', 'Pull to upper chest', 'Drive elbows down and back', 'Control the negative'],
 ARRAY['Pulling behind neck', 'Using momentum', 'Shrugging shoulders', 'Incomplete range'],
 false, false),

('Straight-Arm Lat Pulldown', 'Back', ARRAY['lats'], ARRAY['triceps_long_head'], 'cable', 'intermediate',
 'With straight arms, pull bar down to thighs using lats.',
 'Isolates lats without bicep assistance. Great for mind-muscle connection.',
 ARRAY['Keep arms straight but not locked', 'Initiate with lats, not arms', 'Pull down to thighs', 'Squeeze lats hard'],
 ARRAY['Bending elbows (becomes tricep pushdown)', 'Using momentum', 'Not controlling negative', 'Going too heavy'],
 false, true),

('T-Bar Row', 'Back', ARRAY['lats', 'middle_traps', 'rhomboids'], ARRAY['biceps', 'lower_back'], 'machine', 'intermediate',
 'Rowing on T-bar machine with chest support.',
 'Heavy compound row with support. Great for back thickness.',
 ARRAY['Chest supported, feet planted', 'Pull to lower chest', 'Squeeze shoulder blades', 'Control the weight'],
 ARRAY['Lifting chest off pad', 'Using excessive momentum', 'Partial range of motion', 'Shrugging shoulders'],
 true, false),

('Seal Row', 'Back', ARRAY['lats', 'rhomboids', 'middle_traps'], ARRAY['biceps'], 'barbell', 'intermediate',
 'Lie prone on flat bench, row barbell from floor.',
 'Strictest row variation - zero cheating possible.',
 ARRAY['Bench must be high enough for plates to hang', 'Pull to lower chest', 'Squeeze back at top', 'No momentum possible'],
 ARRAY['Bench too low (plate hits floor)', 'Not controlling negative', 'Incomplete range', 'Shrugging'),
 true, false),

('Rope Face Pull', 'Back', ARRAY['rear_delts', 'rhomboids', 'rotator_cuff'], ARRAY['middle_traps'], 'cable', 'beginner',
 'Pull rope to face level, externally rotating shoulders.',
 'Essential for shoulder health and posture. Hits neglected rear delts.',
 ARRAY['Pull to forehead level', 'Externally rotate at end (thumbs back)', 'Squeeze shoulder blades', 'Control the negative'],
 ARRAY['Pulling too low', 'Not rotating externally', 'Using too much weight', 'Rushing reps'],
 false, true),

('Single-Arm Cable Row', 'Back', ARRAY['lats'], ARRAY['biceps', 'core'], 'cable', 'beginner',
 'One-arm cable row with rotation for full lat contraction.',
 'Unilateral cable row with stretch and squeeze.',
 ARRAY['Rotate torso at stretch', 'Pull and rotate into lat', 'Squeeze hard at contraction', 'Control the negative'],
 ARRAY['Not rotating', 'Using momentum', 'Incomplete range', 'Going too heavy'],
 false, false),

('Inverted Row', 'Back', ARRAY['lats', 'rhomboids'], ARRAY['biceps', 'core'], 'bodyweight', 'beginner',
 'Row body up to bar from horizontal position.',
 'Bodyweight row, scalable by changing angle. Great for beginners.',
 ARRAY['Body straight like plank', 'Pull chest to bar', 'Squeeze shoulder blades', 'Full range of motion'],
 ARRAY['Sagging hips', 'Partial reps', 'Not controlling negative', 'Flaring elbows too wide'];

-- LEGS (15 exercises)
INSERT INTO exercise_library (
  name, muscle_group, primary_muscles, secondary_muscles, equipment, difficulty,
  description, why_good, pro_tips, common_mistakes, is_compound, is_isolation
) VALUES
('Barbell Back Squat', 'Legs', ARRAY['quads', 'glutes'], ARRAY['hamstrings', 'core', 'lower_back'], 'barbell', 'intermediate',
 'Rest bar on upper back/shoulders, squat down and stand up.',
 'The king of leg exercises. Unmatched quad and glute development, total body strength.',
 ARRAY['Bar on traps/rear delts', 'Feet shoulder width', 'Break at hips and knees together', 'Depth below parallel'],
 ARRAY['Knee valgus (caving in)', 'Half squatting', 'Good morning the weight up', 'Heels coming up'],
 true, false),

('Barbell Front Squat', 'Legs', ARRAY['quads', 'core'], ARRAY['glutes', 'upper_back'], 'barbell', 'advanced',
 'Bar rests on front delts, squat with upright torso.',
 'More quad emphasis, less lower back stress. Builds core strength.',
 ARRAY['Bar on front delts, hands loose', 'Elbows high', 'Upright torso', 'Deep squat position'],
 ARRAY['Elbows dropping', 'Good morning position', 'Shallow depth', 'Losing core tightness'],
 true, false),

('Goblet Squat', 'Legs', ARRAY['quads', 'glutes'], ARRAY['core'], 'dumbbell', 'beginner',
 'Hold dumbbell at chest, squat down.',
 'Best squat variation for beginners. Teaches proper squat pattern.',
 ARRAY['Dumbbell at chest, elbows in', 'Break at hips and knees', 'Keep chest up', 'Full depth'],
 ARRAY['Dumbbell too far from chest', 'Rounding upper back', 'Shallow depth', 'Knees caving in'],
 true, false),

('Bulgarian Split Squat', 'Legs', ARRAY['quads', 'glutes'], ARRAY['hamstrings', 'core'], 'dumbbell', 'intermediate',
 'Rear foot elevated on bench, lunge down and up.',
 'Unilateral leg builder. Fixes imbalances, brutal for quads and glutes.',
 ARRAY['Front foot far enough forward', 'Torso slightly forward', 'Drive through front heel', 'Full range of motion'],
 ARRAY['Front foot too close', 'Upright torso (too much knee stress)', 'Bouncing at bottom', 'Not controlling negative'],
 true, false),

('Romanian Deadlift', 'Legs', ARRAY['hamstrings', 'glutes'], ARRAY['lower_back', 'traps'], 'barbell', 'intermediate',
 'Hinge at hips, lowering bar with straight legs to mid-shin.',
 'Best hamstring exercise. Builds posterior chain and hip hinge pattern.',
 ARRAY['Soft knees, not locked', 'Hinge at hips only', 'Bar close to legs', 'Feel hamstring stretch'],
 ARRAY['Squatting the weight', 'Rounding back', 'Bending knees too much', 'Not feeling hamstring stretch'],
 true, false),

('Leg Press', 'Legs', ARRAY['quads', 'glutes'], ARRAY['hamstrings'], 'machine', 'beginner',
 'Push weight away using legs on 45-degree sled.',
 'Safe way to load legs heavily. No spinal compression.',
 ARRAY['Feet shoulder width, mid-platform', 'Lower until thighs hit chest', 'Don''t lock knees hard', 'Full range of motion'],
 ARRAY['Feet too low (knee stress)', 'Partial reps', 'Lifting hips off seat', 'Locking knees violently'],
 true, false),

('Hack Squat', 'Legs', ARRAY['quads'], ARRAY['glutes', 'hamstrings'], 'machine', 'intermediate',
 'Shoulder pads, squat on angled sled with back supported.',
 'Quad-focused squat with back support. Great for leg development.',
 ARRAY['Feet slightly forward on platform', 'Lower until thighs parallel', 'Drive through heels', 'Controlled movement'],
 ARRAY['Feet too far back (knee stress)', 'Partial reps', 'Bouncing at bottom', 'Locking knees hard'],
 true, false),

('Walking Lunge', 'Legs', ARRAY['quads', 'glutes'], ARRAY['hamstrings', 'calves'], 'dumbbell', 'intermediate',
 'Step forward into lunge, keep walking.',
 'Functional leg builder with balance component. Great for athletes.',
 ARRAY['Step into full lunge', 'Back knee nearly touches ground', 'Drive through front heel', 'Upright torso'],
 ARRAY['Too short steps', 'Leaning forward excessively', 'Knee valgus', 'Incomplete range'],
 true, false),

('Leg Extension', 'Legs', ARRAY['quads'], ARRAY[], 'machine', 'beginner',
 'Extend legs against resistance from seated position.',
 'Pure quad isolation. Great for targeting quad sweep and definition.',
 ARRAY['Align knee with pivot point', 'Extend fully and squeeze', 'Control the negative', 'Full range of motion'],
 ARRAY['Using momentum', 'Partial reps', 'Going too heavy', 'Locking knees hard'],
 false, true),

('Lying Leg Curl', 'Legs', ARRAY['hamstrings'], ARRAY['calves'], 'machine', 'beginner',
 'Lie face down, curl heels toward glutes.',
 'Hamstring isolation. Essential for hamstring development and knee health.',
 ARRAY['Hips stay on pad', 'Curl all the way to glutes', 'Squeeze hamstrings', 'Control the negative'],
 ARRAY['Hips lifting off pad', 'Partial range', 'Using momentum', 'Going too heavy'],
 false, true),

('Seated Leg Curl', 'Legs', ARRAY['hamstrings'], ARRAY[], 'machine', 'beginner',
 'Seated position, curl legs back under seat.',
 'Different hamstring emphasis than lying curl. Good variation.',
 ARRAY['Back against pad', 'Curl legs fully back', 'Squeeze hamstrings', 'Control the weight'],
 ARRAY['Leaning forward', 'Partial reps', 'Using momentum', 'Not controlling negative'],
 false, true),

('Calf Raise (Standing)', 'Legs', ARRAY['calves'], ARRAY[], 'machine', 'beginner',
 'Rise up on toes from standing position, lower slowly.',
 'Develops gastrocnemius (visible calf muscle). Essential for complete legs.',
 ARRAY['Full stretch at bottom', 'Rise up as high as possible', 'Pause at top', 'Slow negative'],
 ARRAY['Bouncing at bottom', 'Partial range of motion', 'Going too fast', 'Not stretching at bottom'],
 false, true),

('Calf Raise (Seated)', 'Legs', ARRAY['calves'], ARRAY[], 'machine', 'beginner',
 'Seated calf raise, targets soleus muscle.',
 'Targets deeper calf muscle. Different angle than standing.',
 ARRAY['Full stretch at bottom', 'Press up through balls of feet', 'Control the negative', 'Full range'],
 ARRAY['Bouncing', 'Partial reps', 'Going too heavy', 'Too fast'],
 false, true),

('Hip Thrust', 'Legs', ARRAY['glutes'], ARRAY['hamstrings', 'core'], 'barbell', 'intermediate',
 'Upper back on bench, thrust hips up with bar on hips.',
 'Best glute isolation exercise. Heavy loading potential.',
 ARRAY['Chin tucked, ribs down', 'Drive through heels', 'Squeeze glutes hard at top', 'Full hip extension'],
 ARRAY['Hyperextending lower back', 'Not reaching full extension', 'Using too much weight', 'Looking up'),
 false, false),

('Sissy Squat', 'Legs', ARRAY['quads'], ARRAY['calves'], 'bodyweight', 'advanced',
 'Lean back, bend knees deeply while heels stay on floor.',
 'Intense quad isolation. Great for quad definition and tear drop.',
 ARRAY['Hold something for balance initially', 'Lean back as you descend', 'Keep heels down', 'Deep bend at knees'],
 ARRAY['Heels coming up', 'Not leaning back enough', 'Incomplete range', 'Losing balance'];

-- SHOULDERS (12 exercises)
INSERT INTO exercise_library (
  name, muscle_group, primary_muscles, secondary_muscles, equipment, difficulty,
  description, why_good, pro_tips, common_mistakes, is_compound, is_isolation
) VALUES
('Overhead Press (Standing)', 'Shoulders', ARRAY['front_delts', 'side_delts'], ARRAY['triceps', 'core'], 'barbell', 'intermediate',
 'Press bar from shoulder to overhead. Classic strength exercise.',
 'Best shoulder mass and strength builder. Full body stability challenge.',
 ARRAY['Bar starts at upper chest', 'Head through at top', 'Full lockout', 'Tight core'],
 ARRAY['Using leg drive (strict press)', 'Not locking out', 'Flaring elbows', 'Hyperextending lower back'],
 true, false),

('Seated Dumbbell Press', 'Shoulders', ARRAY['front_delts', 'side_delts'], ARRAY['triceps'], 'dumbbell', 'beginner',
 'Press dumbbells overhead from seated position.',
 'Safer than standing, no leg drive. Great for shoulder development.',
 ARRAY['Palms facing forward or each other', 'Press in slight arc', 'Full range of motion', 'Control the weight'],
 ARRAY['Not going low enough', 'Using momentum', 'Flaring elbows', 'Partial reps'),
 true, false),

('Arnold Press', 'Shoulders', ARRAY['front_delts', 'side_delts'], ARRAY['triceps'], 'dumbbell', 'intermediate',
 'Start with palms facing you, rotate and press overhead.',
 'Hits all three delt heads. Named after Arnold Schwarzenegger.',
 ARRAY['Start with dumbbells at chest, palms facing you', 'Rotate as you press', 'Full rotation at top', 'Reverse on way down'],
 ARRAY['Not rotating fully', 'Using momentum', 'Partial range', 'Going too heavy'],
 true, false),

('Dumbbell Lateral Raise', 'Shoulders', ARRAY['side_delts'], ARRAY['traps'], 'dumbbell', 'beginner',
 'Raise dumbbells out to sides to shoulder height.',
 'Essential for shoulder width. Most important isolation for caps.',
 ARRAY['Slight lean forward', 'Lead with elbows', 'Raise to shoulder height', 'Control the negative'],
 ARRAY['Going too heavy', 'Using momentum/swinging', 'Raising above shoulder height', 'Shrugging shoulders'),
 false, true),

('Cable Lateral Raise', 'Shoulders', ARRAY['side_delts'], ARRAY[], 'cable', 'beginner',
 'Single arm lateral raise with cable for constant tension.',
 'Constant tension on side delts. Better than dumbbells for some.',
 ARRAY['Cable behind body', 'Lead with elbow', 'Raise to shoulder height', 'Control on way down'],
 ARRAY['Using too much weight', 'Not controlling negative', 'Shrugging', 'Partial range'],
 false, true),

('Front Dumbbell Raise', 'Shoulders', ARRAY['front_delts'], ARRAY['side_delts'], 'dumbbell', 'beginner',
 'Raise dumbbell forward to shoulder height.',
 'Isolates front delts. Often overdeveloped from pressing.',
 ARRAY['Slight bend in elbow', 'Raise to shoulder height', 'Control the negative', 'Alternate or both arms'],
 ARRAY['Using momentum', 'Going too heavy', 'Swinging', 'Raising above shoulder height'],
 false, true),

('Rear Delt Fly (Dumbbell)', 'Shoulders', ARRAY['rear_delts'], ARRAY['traps', 'rhomboids'], 'dumbbell', 'beginner',
 'Bent over, raise dumbbells out to sides targeting rear delts.',
 'Essential for shoulder balance and posture. Often neglected.',
 ARRAY['Bend at hips', 'Slight bend in elbows', 'Squeeze rear delts', 'Control the negative'],
 ARRAY['Going too heavy', 'Using momentum', 'Hitting traps instead', 'Partial range of motion'],
 false, true),

('Rear Delt Fly (Machine)', 'Shoulders', ARRAY['rear_delts'], ARRAY['traps'], 'machine', 'beginner',
 'Reverse pec deck for rear delts.',
 'Easy to set up and execute. Great mind-muscle connection.',
 ARRAY['Face the machine', 'Handles at shoulder height', 'Squeeze rear delts', 'Control the weight'],
 ARRAY['Going too heavy', 'Using momentum', 'Shrugging', 'Partial reps'),
 false, true),

('Upright Row', 'Shoulders', ARRAY['side_delts', 'traps'], ARRAY['biceps'], 'barbell', 'intermediate',
 'Pull bar up along body to chin level.',
 'Good for trap and side delt development. Controversial for shoulders.',
 ARRAY['Use EZ bar or dumbbells for wrist comfort', 'Pull to lower chest/chin', 'Elbows above hands', 'Control the negative'],
 ARRAY['Going too heavy', 'Pulling too high (impingement risk)', 'Using momentum', 'Narrow grip'),
 false, false),

('Face Pull', 'Shoulders', ARRAY['rear_delts', 'rotator_cuff'], ARRAY['traps'], 'cable', 'beginner',
 'Pull rope to face with external rotation.',
 'Essential for shoulder health. Hits rear delts and rotator cuff.',
 ARRAY['Pull to forehead level', 'Externally rotate (thumbs back)', 'Squeeze shoulder blades', 'Control the negative'],
 ARRAY['Pulling too low', 'Not rotating externally', 'Using too much weight', 'Rushing'),
 false, true),

('Push Press', 'Shoulders', ARRAY['front_delts', 'side_delts'], ARRAY['triceps', 'core', 'legs'], 'barbell', 'advanced',
 'Use slight leg drive to start press, finish with arms.',
 'Allows heavier weights than strict press. Athletic movement.',
 ARRAY['Dip and drive with legs', 'Explode up', 'Lock out with arms', 'Reset each rep'],
 ARRAY['Too much leg drive', 'Not finishing with arms', 'Hyperextending back', 'Not controlling negative'],
 true, false),

('Landmine Press', 'Shoulders', ARRAY['front_delts'], ARRAY['triceps', 'core'], 'barbell', 'beginner',
 'One end of barbell anchored, press at angle.',
 'Shoulder-friendly pressing. Good for those with shoulder pain.',
 ARRAY['Hold bar at shoulder', 'Press up and in', 'Control the negative', 'Alternate sides'],
 ARRAY['Using legs too much', 'Not controlling', 'Wrong angle', 'Leaning away'];

-- ARMS - BICEPS (10 exercises)
INSERT INTO exercise_library (
  name, muscle_group, primary_muscles, secondary_muscles, equipment, difficulty,
  description, why_good, pro_tips, common_mistakes, is_compound, is_isolation
) VALUES
('Barbell Curl', 'Arms', ARRAY['biceps'], ARRAY['forearms'], 'barbell', 'beginner',
 'Curl barbell from hips to shoulders with supinated grip.',
 'Classic bicep builder. Allows heavy loading and progressive overload.',
 ARRAY['Elbows at sides, stationary', 'Full extension at bottom', 'Squeeze at top', 'Control the negative'],
 ARRAY['Swinging/using momentum', 'Elbows moving forward', 'Partial reps', 'Not controlling negative'],
 false, true),

('Dumbbell Curl', 'Arms', ARRAY['biceps'], ARRAY['forearms'], 'dumbbell', 'beginner',
 'Curl dumbbells with palms facing up throughout.',
 'Each arm works independently. Fixes imbalances.',
 ARRAY['Elbows at sides', 'Supinated grip throughout', 'Full range of motion', 'Control the weight'],
 ARRAY['Swinging', 'Elbows moving', 'Partial reps', 'Going too heavy'),
 false, true),

('Hammer Curl', 'Arms', ARRAY['biceps', 'brachialis'], ARRAY['forearms'], 'dumbbell', 'beginner',
 'Curl with neutral grip (palms facing each other).',
 'Targets brachialis and forearms more. Great for arm thickness.',
 ARRAY['Neutral grip throughout', 'Elbows at sides', 'Full range', 'Control the negative'],
 ARRAY['Swinging', 'Incomplete range', 'Using momentum', 'Going too heavy'),
 false, true),

('Incline Dumbbell Curl', 'Arms', ARRAY['biceps'], ARRAY['forearms'], 'dumbbell', 'intermediate',
 'Curl on incline bench, arms hang behind body.',
 'Maximum bicep stretch. Great for developing lower bicep.',
 ARRAY['Bench at 45-60 degrees', 'Let arms hang back', 'Full stretch at bottom', 'Squeeze at top'],
 ARRAY['Bench too upright', 'Not getting full stretch', 'Using momentum', 'Going too heavy'],
 false, true),

('Preacher Curl', 'Arms', ARRAY['biceps'], ARRAY['forearms'], 'barbell', 'intermediate',
 'Arms on angled pad, curl from extended position.',
 'Strict form, eliminates cheating. Great for bicep peak.',
 ARRAY['Armpits over pad', 'Full extension at bottom', 'Curl all the way up', 'Control the negative'],
 ARRAY['Not going to full extension', 'Using momentum', 'Lifting elbows off pad', 'Going too heavy'],
 false, true),

('Cable Curl', 'Arms', ARRAY['biceps'], ARRAY['forearms'], 'cable', 'beginner',
 'Curl with cable for constant tension.',
 'Constant tension throughout range. Great for pump.',
 ARRAY['Elbows at sides', 'Full range of motion', 'Squeeze at contraction', 'Control the negative'],
 ARRAY['Using momentum', 'Partial reps', 'Not controlling', 'Going too heavy'],
 false, true),

('Concentration Curl', 'Arms', ARRAY['biceps'], ARRAY['forearms'], 'dumbbell', 'beginner',
 'Seated, elbow inside thigh, curl with strict form.',
 'Maximum isolation. Great for mind-muscle connection.',
 ARRAY['Elbow braced against inner thigh', 'No body movement', 'Full squeeze at top', 'Slow negative'],
 ARRAY['Using body to assist', 'Incomplete range', 'Going too fast', 'Not controlling'),
 false, true),

('Spider Curl', 'Arms', ARRAY['biceps'], ARRAY['forearms'], 'dumbbell', 'intermediate',
 'Chest supported on incline, arms hanging down, curl.',
 'Strict isolation, full contraction at top. Great peak exercise.',
 ARRAY['Chest flat on bench', 'Arms hang straight down', 'Curl up and squeeze', 'Control down'],
 ARRAY['Moving upper body', 'Incomplete range', 'Using momentum', 'Going too heavy'],
 false, true),

('Drag Curl', 'Arms', ARRAY['biceps', 'brachialis'], ARRAY['forearms'], 'barbell', 'intermediate',
 'Curl bar close to body, pulling elbows back.',
 'Different bicep emphasis. Hits outer head more.',
 ARRAY['Keep bar close to torso', 'Pull elbows back', 'Curl up', 'Control the negative'],
 ARRAY['Bar drifting away', 'Using momentum', 'Incomplete range', 'Going too heavy'],
 false, true),

('Bayesian Curl', 'Arms', ARRAY['biceps'], ARRAY['forearms'], 'cable', 'intermediate',
 'Face away from cable, curl behind body.',
 'Maximum stretch on bicep throughout. Great for growth.',
 ARRAY['Step forward from cable', 'Arm behind body', 'Curl up and squeeze', 'Control the negative'],
 ARRAY['Not stepping forward enough', 'Using momentum', 'Incomplete range', 'Not controlling'];

-- ARMS - TRICEPS (10 exercises)
INSERT INTO exercise_library (
  name, muscle_group, primary_muscles, secondary_muscles, equipment, difficulty,
  description, why_good, pro_tips, common_mistakes, is_compound, is_isolation
) VALUES
('Close-Grip Bench Press', 'Arms', ARRAY['triceps'], ARRAY['chest', 'front_delts'], 'barbell', 'intermediate',
 'Bench press with narrow grip, elbows tucked.',
 'Heavy compound tricep exercise. Builds mass and strength.',
 ARRAY['Hands shoulder-width or slightly closer', 'Elbows tucked to sides', 'Lower to lower chest', 'Press up'],
 ARRAY['Grip too narrow (wrist strain)', 'Flaring elbows', 'Bouncing off chest', 'Partial reps'],
 true, false),

('Tricep Pushdown (Rope)', 'Arms', ARRAY['triceps'], ARRAY['forearms'], 'cable', 'beginner',
 'Push rope attachment down, spread at bottom.',
 'Best tricep isolation. Constant tension, great contraction.',
 ARRAY['Elbows at sides, stationary', 'Push down and spread rope', 'Squeeze triceps', 'Control up'],
 ARRAY['Elbows moving', 'Not spreading rope', 'Partial reps', 'Going too heavy'],
 false, true),

('Tricep Pushdown (Bar)', 'Arms', ARRAY['triceps'], ARRAY['forearms'], 'cable', 'beginner',
 'Push straight or V-bar down to thighs.',
 'Classic tricep exercise. Easy to load progressively.',
 ARRAY['Elbows at sides', 'Full extension at bottom', 'Control the negative', 'Don''t lean into it'],
 ARRAY['Elbows flaring', 'Not full extension', 'Using body weight', 'Partial reps'],
 false, true),

('Overhead Tricep Extension (Dumbbell)', 'Arms', ARRAY['triceps_long_head'], ARRAY['forearms'], 'dumbbell', 'beginner',
 'Both hands on one dumbbell, extend overhead.',
 'Hits long head of triceps (often neglected). Great for arm size.',
 ARRAY['Elbows close to ears', 'Lower behind head', 'Extend fully', 'Control the negative'],
 ARRAY['Flaring elbows', 'Not going low enough', 'Partial extension', 'Going too heavy'),
 false, true),

('Overhead Tricep Extension (Cable)', 'Arms', ARRAY['triceps_long_head'], ARRAY['forearms'], 'cable', 'beginner',
 'Cable overhead extension for constant tension.',
 'Constant tension on long head. Great pump and stretch.',
 ARRAY['Face away from cable', 'Elbows forward', 'Extend fully', 'Control the negative'],
 ARRAY['Elbows flaring', 'Incomplete range', 'Using momentum', 'Going too heavy'],
 false, true),

('Skull Crusher (Barbell)', 'Arms', ARRAY['triceps'], ARRAY['forearms'], 'barbell', 'intermediate',
 'Lie on bench, lower bar to forehead, extend.',
 'Great tricep mass builder. Heavy loading potential.',
 ARRAY['Upper arms perpendicular to floor', 'Lower to forehead/nose', 'Keep elbows in', 'Extend fully'],
 ARRAY['Flaring elbows', 'Upper arms moving', 'Not controlling negative (dangerous)', 'Going too heavy'],
 false, true),

('Skull Crusher (Dumbbell)', 'Arms', ARRAY['triceps'], ARRAY['forearms'], 'dumbbell', 'intermediate',
 'Dumbbell version allows neutral grip, more wrist friendly.',
 'More natural wrist position. Can go deeper.',
 ARRAY['Palms facing each other', 'Lower beside head', 'Keep upper arms still', 'Full extension'],
 ARRAY['Upper arms moving', 'Not controlling negative', 'Incomplete range', 'Going too heavy'],
 false, true),

('Dips (Tricep Focus)', 'Arms', ARRAY['triceps'], ARRAY['chest', 'front_delts'], 'bodyweight', 'intermediate',
 'Upright dips targeting triceps over chest.',
 'Great bodyweight tricep builder. Scalable with weight belt.',
 ARRAY['Stay upright', 'Elbows close to body', 'Lower until shoulders dip', 'Full extension at top'],
 ARRAY['Leaning forward (becomes chest dip)', 'Flaring elbows', 'Partial reps', 'Bouncing'),
 true, false),

('Cable Kickback', 'Arms', ARRAY['triceps'], ARRAY['forearms'], 'cable', 'beginner',
 'Bent over, extend arm back squeezing tricep.',
 'Peak contraction exercise. Great for horseshoe shape.',
 ARRAY['Bent over parallel to floor', 'Upper arm stationary', 'Extend fully and squeeze', 'Control the negative'],
 ARRAY['Upper arm moving', 'Not full extension', 'Using momentum', 'Going too heavy'],
 false, true),

('Diamond Push-Up', 'Arms', ARRAY['triceps'], ARRAY['chest', 'front_delts'], 'bodyweight', 'intermediate',
 'Push-up with hands forming diamond under chest.',
 'Bodyweight tricep killer. Great for home workouts.',
 ARRAY['Hands under chest, diamond shape', 'Elbows tucked to sides', 'Full range of motion', 'Control tempo'],
 ARRAY['Flaring elbows', 'Partial reps', 'Sagging hips', 'Going too fast'];

-- CORE (5 exercises)
INSERT INTO exercise_library (
  name, muscle_group, primary_muscles, secondary_muscles, equipment, difficulty,
  description, why_good, pro_tips, common_mistakes, is_compound, is_isolation
) VALUES
('Plank', 'Core', ARRAY['abs', 'transverse_abdominis'], ARRAY['lower_back', 'shoulders'], 'bodyweight', 'beginner',
 'Hold push-up position on forearms. Static core exercise.',
 'Best core stability exercise. Builds anti-extension strength.',
 ARRAY['Body straight from head to heels', 'Squeeze glutes', 'Brace abs like getting punched', 'Breathe normally'],
 ARRAY['Sagging hips', 'Raising hips too high', 'Holding breath', 'Shrugging shoulders'),
 false, true),

('Hanging Leg Raise', 'Core', ARRAY['lower_abs'], ARRAY['hip_flexors'], 'bodyweight', 'intermediate',
 'Hang from bar, raise legs to 90 degrees or higher.',
 'Best lower ab exercise. Full range hip flexion.',
 ARRAY['Start from dead hang', 'Control the swing', 'Lift legs to at least 90 degrees', 'Control the negative'],
 ARRAY['Using momentum/swinging', 'Partial range', 'Bending arms', 'Arching lower back excessively'),
 false, true),

('Cable Crunch', 'Core', ARRAY['abs'], ARRAY['obliques'], 'cable', 'beginner',
 'Kneeling, crunch down pulling rope to knees.',
 'Loaded ab exercise with progressive overload potential.',
 ARRAY['Hold rope at head', 'Crunch down, not forward', 'Round upper back', 'Squeeze abs hard'],
 ARRAY['Just bending at hips', 'Not rounding back', 'Using arms to pull', 'Going too heavy'),
 false, true),

('Dead Bug', 'Core', ARRAY['abs', 'transverse_abdominis'], ARRAY['hip_flexors'], 'bodyweight', 'beginner',
 'Lie on back, extend opposite arm and leg while keeping back flat.',
 'Safe core exercise. Teaches proper bracing and control.',
 ARRAY['Lower back pressed to floor throughout', 'Move slowly', 'Breathe out as you extend', 'Don''t rush'],
 ARRAY['Lower back arching', 'Moving too fast', 'Holding breath', 'Incomplete range'],
 false, true),

('Ab Wheel Rollout', 'Core', ARRAY['abs', 'transverse_abdominis'], ARRAY['lower_back', 'shoulders'], 'bodyweight', 'intermediate',
 'Kneeling, roll wheel forward and back.',
 'Advanced core exercise. Extreme anti-extension challenge.',
 ARRAY['Start with small range', 'Keep core tight', 'Don''t let back sag', 'Pull back with abs, not arms'],
 ARRAY['Going too far too soon', 'Letting back sag', 'Using arms to pull back', 'Not controlling the negative'];

-- CARDIO (5 exercises)
INSERT INTO exercise_library (
  name, muscle_group, primary_muscles, secondary_muscles, equipment, difficulty,
  description, why_good, pro_tips, common_mistakes, is_compound, is_isolation
) VALUES
('Running', 'Cardio', ARRAY['legs', 'cardiovascular'], ARRAY['core'], 'bodyweight', 'beginner',
 'Running or jogging for cardiovascular fitness.',
 'Most accessible cardio. Builds endurance and burns calories.',
 ARRAY['Land on midfoot', 'Relaxed arms at sides', 'Breathe rhythmically', 'Build distance gradually'],
 ARRAY['Heel striking hard', 'Tensing upper body', 'Shallow breathing', 'Too much too soon'),
 true, false),

('Rowing Machine', 'Cardio', ARRAY['back', 'legs', 'cardiovascular'], ARRAY['core', 'arms'], 'machine', 'beginner',
 'Simulated rowing on machine. Full body cardio.',
 'Full body cardio with minimal impact. Great for conditioning.',
 ARRAY['Legs first, then back, then arms', 'Drive through heels', 'Lean back slightly at finish', 'Smooth recovery'],
 ARRAY['Arms pulling too early', 'Rounding back', 'Incomplete leg drive', 'Rushing the recovery'],
 true, false),

('Assault Bike', 'Cardio', ARRAY['legs', 'arms', 'cardiovascular'], ARRAY['core'], 'machine', 'beginner',
 'Air bike with arm and leg motion.',
 'Brutal full body cardio. Self-limiting intensity.',
 ARRAY['Push and pull with arms', 'Drive hard with legs', 'Breathe steadily', 'Control the pace'],
 ARRAY['Just using legs', 'Gripping too tight', 'Holding breath', 'Starting too fast'),
 true, false),

('Jump Rope', 'Cardio', ARRAY['legs', 'cardiovascular'], ARRAY['calves', 'forearms'], 'bodyweight', 'beginner',
 'Jumping rope for cardio and coordination.',
 'Portable cardio. Great for footwork and calf development.',
 ARRAY['Stay light on feet', 'Wrists rotate rope', 'Small jumps', 'Find rhythm'],
 ARRAY['Jumping too high', 'Using whole arms to rotate', 'Looking down', 'Double bouncing'),
 true, false),

('StairMaster / StepMill', 'Cardio', ARRAY['legs', 'cardiovascular'], ARRAY['glutes', 'calves'], 'machine', 'beginner',
 'Continuously climbing stairs on machine.',
 'Low impact, high intensity leg cardio. Great for glutes.',
 ARRAY['Full steps, not tiptoeing', 'Stand upright', 'Don''t lean on handles', 'Steady pace'],
 ARRAY['Shallow steps', 'Leaning on handles', 'Slouching', 'Going too fast too soon'];
