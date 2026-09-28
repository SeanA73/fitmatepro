export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscle_groups: string[];
  equipment: string[];
  sets?: number;
  reps?: string;
  duration?: number; // in seconds for time-based exercises
  rest_time?: number; // in seconds
  instructions: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  video_url?: string;
  image_url?: string;
}

// No estimated_duration field. It used to be a hand-written number per day
// (45, 50, 55, 75, 80, 90...) whose comment claimed it was "derived from sets
// and rest times" — it was not. day1_upper asserted 45 minutes over three
// exercises worth roughly 25, and because the player used that number as its
// countdown target, completion only fired after 45 minutes of which 20 had no
// exercise left to run. That is why workout_sessions had zero rows. Duration is
// now computed from the exercises by workoutDayDuration() below, so the total
// and the sum of its parts cannot drift apart again.
export interface WorkoutDay {
  id: string;
  name: string;
  focus: string[];
  exercises: Exercise[];
}

export interface WorkoutProgram {
  id: string;
  name: string;
  category: 'Weightlifting' | 'Bodybuilding' | 'General Fitness' | 'Cardio' | 'Strength' | 'Powerlifting';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration_weeks: number;
  days_per_week: number;
  description: string;
  goals: string[];
  equipment_needed: string[];
  workout_days: WorkoutDay[];
  created_by: string;
  is_template: boolean;
}

export const exerciseDatabase: Exercise[] = [
  // Upper Body Exercises
  {
    id: 'bench_press',
    name: 'Bench Press',
    description: 'Classic chest exercise using barbell or dumbbells',
    muscle_groups: ['Chest', 'Triceps', 'Shoulders'],
    equipment: ['Barbell', 'Bench'],
    sets: 4,
    reps: '8-10',
    rest_time: 120,
    instructions: [
      'Lie flat on bench with feet planted on floor',
      'Grip barbell slightly wider than shoulder width',
      'Lower bar to chest with control',
      'Press bar up explosively, fully extending arms'
    ],
    difficulty: 'Intermediate'
  },
  {
    id: 'push_ups',
    name: 'Push-ups',
    description: 'Bodyweight exercise for chest, shoulders, and triceps',
    muscle_groups: ['Chest', 'Triceps', 'Shoulders', 'Core'],
    equipment: ['None'],
    sets: 3,
    reps: '10-15',
    rest_time: 60,
    instructions: [
      'Start in plank position with hands under shoulders',
      'Lower body until chest nearly touches floor',
      'Push back up to starting position',
      'Keep core tight throughout movement'
    ],
    difficulty: 'Beginner'
  },
  {
    id: 'pull_ups',
    name: 'Pull-ups',
    description: 'Compound exercise for back and biceps',
    muscle_groups: ['Back', 'Biceps', 'Forearms'],
    equipment: ['Pull-up Bar'],
    sets: 3,
    reps: '5-8',
    rest_time: 90,
    instructions: [
      'Hang from bar with palms facing away',
      'Pull body up until chin clears bar',
      'Lower with control to full extension',
      'Engage core throughout movement'
    ],
    difficulty: 'Advanced'
  },
  // Lower Body Exercises
  {
    id: 'squats',
    name: 'Squats',
    description: 'Fundamental lower body compound movement',
    muscle_groups: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
    equipment: ['Barbell', 'Squat Rack'],
    sets: 4,
    reps: '8-12',
    rest_time: 120,
    instructions: [
      'Stand with feet shoulder-width apart',
      'Lower by bending at hips and knees',
      'Descend until thighs parallel to floor',
      'Drive through heels to return to start'
    ],
    difficulty: 'Intermediate'
  },
  {
    id: 'deadlifts',
    name: 'Deadlifts',
    description: 'King of all exercises - full body compound movement',
    muscle_groups: ['Hamstrings', 'Glutes', 'Back', 'Traps', 'Core'],
    equipment: ['Barbell'],
    sets: 3,
    reps: '5-6',
    rest_time: 180,
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend at hips and knees to grip bar',
      'Keep chest up and back straight',
      'Drive through heels to lift bar, extending hips and knees'
    ],
    difficulty: 'Advanced'
  },
  {
    id: 'lunges',
    name: 'Lunges',
    description: 'Unilateral leg exercise for strength and stability',
    muscle_groups: ['Quadriceps', 'Glutes', 'Hamstrings'],
    equipment: ['Dumbbells'],
    sets: 3,
    reps: '10-12 each leg',
    rest_time: 90,
    instructions: [
      'Step forward into lunge position',
      'Lower back knee toward ground',
      'Keep front knee over ankle',
      'Push through front heel to return to start'
    ],
    difficulty: 'Beginner'
  },
  // Cardio Exercises
  {
    id: 'burpees',
    name: 'Burpees',
    description: 'Full body high-intensity exercise',
    muscle_groups: ['Full Body'],
    equipment: ['None'],
    sets: 3,
    reps: '8-12',
    rest_time: 90,
    instructions: [
      'Start standing, squat down and place hands on floor',
      'Jump feet back into plank position',
      'Perform push-up (optional)',
      'Jump feet forward and explode up with jump'
    ],
    difficulty: 'Intermediate'
  },
  {
    id: 'mountain_climbers',
    name: 'Mountain Climbers',
    description: 'High-intensity cardio and core exercise',
    muscle_groups: ['Core', 'Shoulders', 'Legs'],
    equipment: ['None'],
    duration: 30,
    rest_time: 30,
    instructions: [
      'Start in plank position',
      'Alternate bringing knees to chest rapidly',
      'Keep hips level and core engaged',
      'Maintain steady breathing rhythm'
    ],
    difficulty: 'Beginner'
  },
  // Core Exercises
  {
    id: 'plank',
    name: 'Plank',
    description: 'Isometric core strengthening exercise',
    muscle_groups: ['Core', 'Shoulders'],
    equipment: ['None'],
    duration: 45,
    rest_time: 60,
    instructions: [
      'Start in push-up position on forearms',
      'Keep body in straight line from head to heels',
      'Engage core and glutes',
      'Breathe normally throughout hold'
    ],
    difficulty: 'Beginner'
  }
];

export const preBuiltPrograms: WorkoutProgram[] = [
  {
    id: 'beginner_strength',
    name: 'Beginner Strength Foundation',
    category: 'Strength',
    difficulty: 'Beginner',
    duration_weeks: 8,
    days_per_week: 3,
    description: 'Perfect introduction to strength training with fundamental movements',
    goals: ['Build base strength', 'Learn proper form', 'Establish routine'],
    equipment_needed: ['Barbell', 'Dumbbells', 'Bench'],
    created_by: 'FitMatePro',
    is_template: true,
    workout_days: [
      {
        id: 'day1_upper',
        name: 'Upper Body Focus',
        focus: ['Chest', 'Back', 'Arms'],
        exercises: [
          exerciseDatabase[0], // Bench Press
          exerciseDatabase[2], // Pull-ups
          exerciseDatabase[1], // Push-ups
        ]
      },
      {
        id: 'day2_lower',
        name: 'Lower Body Focus',
        focus: ['Legs', 'Glutes'],
        exercises: [
          exerciseDatabase[3], // Squats
          exerciseDatabase[5], // Lunges
          exerciseDatabase[8], // Plank
        ]
      },
      {
        id: 'day3_full',
        name: 'Full Body',
        focus: ['Full Body'],
        exercises: [
          exerciseDatabase[4], // Deadlifts
          exerciseDatabase[1], // Push-ups
          exerciseDatabase[6], // Burpees
        ]
      }
    ]
  },
  {
    id: 'bodybuilding_split',
    name: 'Classic Bodybuilding Split',
    category: 'Bodybuilding',
    difficulty: 'Intermediate',
    duration_weeks: 12,
    days_per_week: 5,
    description: 'Traditional bodybuilding approach focusing on muscle hypertrophy',
    goals: ['Muscle growth', 'Improved definition', 'Strength gains'],
    equipment_needed: ['Full Gym Access', 'Dumbbells', 'Cables', 'Machines'],
    created_by: 'FitMatePro',
    is_template: true,
    workout_days: [
      {
        id: 'chest_day',
        name: 'Chest & Triceps',
        focus: ['Chest', 'Triceps'],
        exercises: [
          exerciseDatabase[0], // Bench Press
          exerciseDatabase[1], // Push-ups
        ]
      },
      {
        id: 'back_day',
        name: 'Back & Biceps',
        focus: ['Back', 'Biceps'],
        exercises: [
          exerciseDatabase[2], // Pull-ups
          exerciseDatabase[4], // Deadlifts
        ]
      },
      {
        id: 'leg_day',
        name: 'Legs & Glutes',
        focus: ['Legs', 'Glutes'],
        exercises: [
          exerciseDatabase[3], // Squats
          exerciseDatabase[5], // Lunges
          exerciseDatabase[4], // Deadlifts
        ]
      }
    ]
  },
  {
    id: 'hiit_cardio',
    name: 'HIIT Cardio Blast',
    category: 'Cardio',
    difficulty: 'Intermediate',
    duration_weeks: 6,
    days_per_week: 4,
    description: 'High-intensity interval training for fat loss and conditioning',
    goals: ['Fat loss', 'Cardiovascular health', 'Endurance'],
    equipment_needed: ['None', 'Bodyweight Only'],
    created_by: 'FitMatePro',
    is_template: true,
    workout_days: [
      {
        id: 'hiit_1',
        name: 'Full Body HIIT',
        focus: ['Full Body', 'Cardio'],
        exercises: [
          exerciseDatabase[6], // Burpees
          exerciseDatabase[7], // Mountain Climbers
          exerciseDatabase[1], // Push-ups
        ]
      },
      {
        id: 'hiit_2',
        name: 'Lower Body Power',
        focus: ['Legs', 'Cardio'],
        exercises: [
          exerciseDatabase[3], // Squats
          exerciseDatabase[5], // Lunges
          exerciseDatabase[7], // Mountain Climbers
        ]
      }
    ]
  },
  {
    id: 'powerlifting_foundation',
    name: 'Powerlifting Foundation',
    category: 'Powerlifting',
    difficulty: 'Advanced',
    duration_weeks: 16,
    days_per_week: 4,
    description: 'Focus on the big three: squat, bench, deadlift for maximum strength',
    goals: ['Max strength', 'Powerlifting technique', 'Competition prep'],
    equipment_needed: ['Barbell', 'Squat Rack', 'Bench', 'Platform'],
    created_by: 'FitMatePro',
    is_template: true,
    workout_days: [
      {
        id: 'squat_day',
        name: 'Squat Focus',
        focus: ['Legs', 'Core'],
        exercises: [
          exerciseDatabase[3], // Squats
          exerciseDatabase[5], // Lunges
        ]
      },
      {
        id: 'bench_day',
        name: 'Bench Focus',
        focus: ['Chest', 'Triceps'],
        exercises: [
          exerciseDatabase[0], // Bench Press
          exerciseDatabase[1], // Push-ups
        ]
      },
      {
        id: 'deadlift_day',
        name: 'Deadlift Focus',
        focus: ['Back', 'Hamstrings'],
        exercises: [
          exerciseDatabase[4], // Deadlifts
          exerciseDatabase[2], // Pull-ups
        ]
      }
    ]
  },
  {
    id: 'general_fitness',
    name: 'General Fitness & Wellness',
    category: 'General Fitness',
    difficulty: 'Beginner',
    duration_weeks: 10,
    days_per_week: 4,
    description: 'Well-rounded program for overall health and fitness',
    goals: ['General health', 'Weight management', 'Energy boost'],
    equipment_needed: ['Dumbbells', 'Resistance Bands', 'Mat'],
    created_by: 'FitMatePro',
    is_template: true,
    workout_days: [
      {
        id: 'cardio_strength',
        name: 'Cardio & Strength',
        focus: ['Cardio', 'Full Body'],
        exercises: [
          exerciseDatabase[6], // Burpees
          exerciseDatabase[1], // Push-ups
          exerciseDatabase[3], // Squats
        ]
      },
      {
        id: 'flexibility_core',
        name: 'Flexibility & Core',
        focus: ['Core', 'Flexibility'],
        exercises: [
          exerciseDatabase[8], // Plank
          exerciseDatabase[7], // Mountain Climbers
        ]
      }
    ]
  }
];

// ---------------------------------------------------------------------------
// Standalone (non-program) sessions.
//
// There is exactly one. It used to live inline in WorkoutSession.tsx as the
// fallback branch, which meant /workout/:id ignored its own :id and every
// "Start Workout" button in the app opened this same session under six
// different invented names. It lives here now so the route can resolve a real
// record by id, and so the browse card and the player read one source.
//
// Durations are per-exercise and real; total duration is derived below rather
// than asserted.
// ---------------------------------------------------------------------------
export interface StandaloneExercise {
  name: string;
  duration: number; // seconds
  description: string;
}

export interface StandaloneWorkout {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  exercises: StandaloneExercise[];
}

export const standaloneWorkouts: StandaloneWorkout[] = [
  {
    id: 'morning-energy-boost',
    title: 'Morning Energy Boost',
    difficulty: 'Beginner',
    description: 'A short full-body warm-up to start the day.',
    exercises: [
      { name: 'Warm-up Stretches', duration: 120, description: 'Gentle movements to prepare your body' },
      { name: 'Jumping Jacks', duration: 60, description: 'Get your heart rate up with classic cardio' },
      { name: 'Bodyweight Squats', duration: 90, description: 'Strengthen your legs and glutes' },
      { name: 'Push-ups (Modified)', duration: 60, description: 'Build upper body strength at your pace' },
      { name: 'Plank Hold', duration: 45, description: 'Core strengthening exercise' },
      { name: 'Mountain Climbers', duration: 75, description: 'Full body cardio movement' },
      { name: 'Cool-down Stretches', duration: 150, description: 'Relax and stretch your worked muscles' },
    ],
  },
];

export const standaloneWorkoutDuration = (workout: StandaloneWorkout): number =>
  workout.exercises.reduce((total, exercise) => total + exercise.duration, 0);

// ---------------------------------------------------------------------------
// Derived durations for program workout days.
//
// One formula, used by the player, the browse cards, the program detail page and
// the create-a-workout preview. It is the formula CreateWorkoutForm already
// applied to user-authored days (sets * 2 minutes, plus one rest interval),
// lifted here so a pre-built day and a user-built day holding the same
// exercises report the same length instead of disagreeing by author.
// ---------------------------------------------------------------------------

// How long one exercise occupies the player, in seconds. Time-based exercises
// use their own duration; set-based ones are estimated, since "8-10 reps" has no
// fixed length. Rest is counted once per exercise, not once per set — that is
// what the original formula did, and it is the convention the numbers assume.
export const exerciseBlockSeconds = (exercise: Exercise): number =>
  (exercise.duration ?? (exercise.sets ?? 1) * 120) + (exercise.rest_time ?? 0);

// Total seconds for a workout day: exactly the sum of its exercise blocks.
export const workoutDayDuration = (day: Pick<WorkoutDay, 'exercises'>): number =>
  day.exercises.reduce((total, exercise) => total + exerciseBlockSeconds(exercise), 0);

// Rounded minutes, for display.
export const workoutDayMinutes = (day: Pick<WorkoutDay, 'exercises'>): number =>
  Math.round(workoutDayDuration(day) / 60);
