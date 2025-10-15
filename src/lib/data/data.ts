

import type { Exercise, PersonalBest, Workout, Metcon } from './types';
import { format } from 'date-fns';

export const exercises: Exercise[] = [
  { id: '1', name: 'Squat', type: 'strength' },
  { id: '2', name: 'Bench Press', type: 'strength' },
  { id: '3', name: 'Deadlift', type: 'strength' },
  { id: '4', name: 'Overhead Press', type: 'strength' },
  { id: '5', name: 'Barbell Row', type: 'strength' },
  { id: '6', name: 'Pull-up', type: 'strength' },
  { id: '7', name: 'Dumbbell Curl', type: 'strength' },
  { id: '8', name: 'Treadmill Run', type: 'cardio' },
  { id: '9', name: 'Rowing Machine', type: 'cardio' },
  { id: '10', name: 'Stationary Bike', type: 'cardio' },
];

export const metcons: Metcon[] = [
  { id: 'm1', name: 'Fran', type: 'For Time', description: '21-15-9 reps of:\n- Thrusters (95/65 lb)\n- Pull-ups', timeCap: 10 },
  { id: 'm2', name: 'Cindy', type: 'AMRAP', description: 'As Many Rounds As Possible in 20 minutes of:\n- 5 Pull-ups\n- 10 Push-ups\n- 15 Air Squats', timeCap: 20 },
  { id: 'm3', name: 'Murph', type: 'For Time', description: 'For time:\n- 1 mile Run\n- 100 Pull-ups\n- 200 Push-ups\n- 300 Squats\n- 1 mile Run\n\nPartition the pull-ups, push-ups, and squats as needed.', timeCap: 60 },
  { id: 'm4', name: 'Grace', type: 'For Time', description: '30 Clean and Jerks for time (135/95 lb)', timeCap: 5 },
];

export const personalBests: PersonalBest[] = [
  { name: 'Squat', type: 'strength', best: { value: '140', unit: 'kg x 5'}, date: '2024-07-20' },
  { name: 'Bench Press', type: 'strength', best: { value: '100', unit: 'kg x 8'}, date: '2024-07-18' },
  { name: 'Deadlift', type: 'strength', best: { value: '180', unit: 'kg x 3'}, date: '2024-07-22' },
  { name: 'Overhead Press', type: 'strength', best: { value: '60', unit: 'kg x 10'}, date: '2024-07-16' },
];

export const workoutHistory: Workout[] = [
  {
    id: 'w1',
    type: 'traditional',
    date: '2024-07-22',
    timeOfDay: 'day',
    bodyWeight: 80,
    strength: [{
      id: 's1',
      exerciseName: 'Deadlift',
      equipment: 'Barbell',
      sets: [
        { id: 'set1', weight: 160, reps: 5 },
        { id: 'set2', weight: 170, reps: 4 },
        { id: 'set3', weight: 180, reps: 3 },
      ],
    }],
    notes: 'Felt strong today. New PR!',
  },
  {
    id: 'w2',
    type: 'metcon',
    date: '2024-07-21',
    timeOfDay: 'morning',
    workoutName: 'Fran',
    score: { type: 'time', value: '3:45' },
    notes: '',
  },
  {
    id: 'w3',
    type: 'traditional',
    date: '2024-07-20',
    timeOfDay: 'night',
    bodyWeight: 80,
    strength: [{
      id: 's2',
      exerciseName: 'Squat',
      equipment: 'Barbell',
      sets: [
        { id: 'set4', weight: 120, reps: 5 },
        { id: 'set5', weight: 130, reps: 5 },
        { id: 'set6', weight: 140, reps: 5 },
      ],
    }],
    notes: '',
  },
    {
    id: 'w4',
    type: 'metcon',
    date: '2024-07-19',
    timeOfDay: 'day',
    bodyWeight: 80,
    workoutName: 'Cindy',
    score: { type: 'rounds', value: '25' },
    notes: '20 minute AMRAP. Push-ups were the hardest part.',
  },
  {
    id: 'w5',
    type: 'traditional',
    date: '2024-07-23',
    timeOfDay: 'morning',
    bodyWeight: 79.5,
    cardio: [{
      id: 'c1',
      exerciseName: 'Treadmill Run',
      duration: 30,
      distance: 5,
    }],
    notes: 'Felt good, steady pace.'
  },
   {
    id: 'w6',
    type: 'traditional',
    date: '2024-07-24',
    timeOfDay: 'day',
    bodyWeight: 80.2,
    strength: [
      {
        id: 's3',
        exerciseName: 'Bench Press',
        equipment: 'Barbell',
        sets: [
            { id: 'set7', weight: 90, reps: 8 },
            { id: 'set8', weight: 95, reps: 6, supersetLinkId: 'ss1' },
            { id: 'set9', weight: 100, reps: 5 },
        ]
      },
      {
        id: 's4',
        exerciseName: 'Pull-up',
        equipment: 'Bodyweight',
        sets: [
            { id: 'set10', weight: 0, reps: 12 },
            { id: 'set11', weight: 0, reps: 10, supersetLinkId: 'ss1' },
            { id: 'set12', weight: 0, reps: 8 },
        ]
      }
    ],
    cardio: [{
      id: 'c2',
      exerciseName: 'Rowing Machine',
      duration: 10,
      distance: 2.5,
    }],
    notes: 'Solid upper body day.'
  }
];
