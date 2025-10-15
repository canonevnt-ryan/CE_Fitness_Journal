

export type TraditionalSet = {
  id: string; // Unique ID for the set
  reps: number;
  weight: number; // Always stored in kg
  supersetLinkId?: string; // ID to link supersets
};

export type StrengthLog = {
  id: string; // Unique ID for the strength exercise log
  exerciseName: string;
  equipment?: string;
  sets: TraditionalSet[];
}

export type CardioLog = {
  id: string; // Unique ID for the cardio log
  exerciseName: string;
  duration: number; // in minutes
  distance?: number; // in km
}

type BaseWorkout = {
  id: string;
  date: string;
  timeOfDay: 'morning' | 'day' | 'night';
  bodyWeight?: number; // in kg
  notes?: string;
}

export type TraditionalWorkout = BaseWorkout & {
  type: 'traditional';
  strength?: StrengthLog[];
  cardio?: CardioLog[];
};


export type MetconWorkout = BaseWorkout & {
  type: 'metcon';
  workoutName: string;
  score: {
    type: 'time' | 'rounds' | 'reps';
    value: string;
  };
};

export type Workout = TraditionalWorkout | MetconWorkout;

export type Exercise = {
  id: string;
  name: string;
  type: 'strength' | 'cardio';
};

export type Metcon = {
  id: string;
  name: string;
  type: 'For Time' | 'AMRAP' | 'EMOM' | 'Other';
  description: string;
  timeCap?: number; // in minutes
}

export type PersonalBest = {
  name: string; // Exercise or Metcon name
  type: 'strength' | 'cardio' | 'metcon';
  best: any; // Flexible structure for different bests
  date: string;
};
