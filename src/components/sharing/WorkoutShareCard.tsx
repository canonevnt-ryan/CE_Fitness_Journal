
'use client';

import { Workout } from '@/lib/data/types';
import { Dumbbell, Clock, Repeat, HeartPulse, Weight, WeightIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';
import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const getIconForScoreType = (type: 'time' | 'rounds' | 'reps') => {
  switch (type) {
    case 'time': return <Clock className="w-5 h-5 text-primary" />;
    case 'rounds': return <Repeat className="w-5 h-5 text-primary" />;
    case 'reps': return <Dumbbell className="w-5 h-5 text-primary" />;
    default: return null;
  }
};

const supersetColors = [
    'bg-blue-200/50 border-blue-300 dark:bg-blue-900/50 dark:border-blue-700',
    'bg-green-200/50 border-green-300 dark:bg-green-900/50 dark:border-green-700',
    'bg-purple-200/50 border-purple-300 dark:bg-purple-900/50 dark:border-purple-700',
    'bg-orange-200/50 border-orange-300 dark:bg-orange-900/50 dark:border-orange-700',
    'bg-pink-200/50 border-pink-300 dark:bg-pink-900/50 dark:border-pink-700',
    'bg-teal-200/50 border-teal-300 dark:bg-teal-900/50 dark:border-teal-700',
];


export function WorkoutShareCard({ workout }: { workout: Workout }) {
  const { displayWeight, displayDistance, weightUnit, distanceUnit, theme, palette } = useSettings();
  const [aspectRatio, setAspectRatio] = useState<'square' | 'portrait'>('square');

  const supersetLinkColors = useMemo(() => {
    if (workout.type !== 'traditional' || !workout.strength) return {};
    const colorMap: Record<string, string> = {};
    let colorIndex = 0;
    workout.strength.forEach(ex => {
        ex.sets.forEach(set => {
            if (set.supersetLinkId && !colorMap[set.supersetLinkId]) {
                colorMap[set.supersetLinkId] = supersetColors[colorIndex % supersetColors.length];
                colorIndex++;
            }
        })
    })
    return colorMap;
  }, [workout]);


  const renderWorkoutContent = () => {
    switch(workout.type) {
      case 'traditional':
        const allItems = [
            ...(workout.strength || []).map(item => ({ ...item, itemType: 'strength' })),
            ...(workout.cardio || []).map(item => ({ ...item, itemType: 'cardio' }))
        ];
        return (
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {(workout.strength || []).map((sLog, i) => (
                <div key={`str-${i}`}>
                    <h3 className="font-semibold text-primary text-base mb-1 truncate">{sLog.exerciseName}</h3>
                    <ul className="space-y-1 text-xs">
                    {sLog.sets.map((set, j) => {
                        const linkColor = set.supersetLinkId ? supersetLinkColors[set.supersetLinkId] : '';
                        return (
                        <li key={j} className={cn("flex items-center gap-2 p-1 rounded", linkColor)}>
                            <Weight className="h-3 w-3 text-primary/70"/> 
                            <span>{displayWeight(set.weight)} {weightUnit} &times; {set.reps} reps</span>
                        </li>
                        )
                    })}
                    </ul>
                </div>
            ))}
            {(workout.cardio || []).map((cLog, i) => (
                <div key={`car-${i}`}>
                  <h3 className="font-semibold text-primary text-base mb-1 truncate">{cLog.exerciseName}</h3>
                  <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2"><Clock className="h-3 w-3 text-primary/70"/> Duration: {cLog.duration} mins</div>
                      {cLog.distance != null && <div className="flex items-center gap-2"><HeartPulse className="h-3 w-3 text-primary/70"/> Distance: {displayDistance(cLog.distance)} {distanceUnit}</div>}
                  </div>
                </div>
            ))}
          </div>
        )
      case 'metcon':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-2">{workout.workoutName}</h2>
            <div className="flex items-center justify-center text-3xl font-bold">
                {getIconForScoreType(workout.score.type)}
                <span className="ml-2">{workout.score.value}</span>
            </div>
            <p className="text-sm text-muted-foreground capitalize">{workout.score.type}</p>
          </div>
        )
      default:
        return null;
    }
  }


  return (
    <div className="space-y-4">
        <Tabs value={aspectRatio} onValueChange={(value) => setAspectRatio(value as 'square' | 'portrait')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="square">Square</TabsTrigger>
                <TabsTrigger value="portrait">Portrait</TabsTrigger>
            </TabsList>
        </Tabs>
        <div className="flex justify-center">
            <div 
                id="share-card"
                className={cn(
                    "font-body overflow-hidden",
                    "transition-all duration-300 ease-in-out flex flex-col p-8",
                    theme,
                    `theme-${palette}`,
                    'bg-card text-card-foreground border rounded-lg',
                    aspectRatio === 'square' ? 'w-[450px] h-[450px]' : 'w-[350px] h-[550px]'
                )}
            >
                <header className="grid grid-cols-2 gap-x-6 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold font-headline text-primary">Workout Summary</h1>
                        <p className="text-sm text-muted-foreground">{format(parseISO(workout.date), "EEEE, MMMM d, yyyy")}</p>
                    </div>
                    <div className="flex flex-col items-start justify-between">
                        <div className="flex items-center gap-2 text-primary self-end">
                            <Dumbbell className="w-6 h-6" />
                            <span className="font-bold text-lg font-headline">FitFlow</span>
                        </div>
                        {workout.bodyWeight && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <WeightIcon className="h-3 w-3"/>
                                <span>Bodyweight: {displayWeight(workout.bodyWeight)} {weightUnit}</span>
                            </p>
                        )}
                    </div>
                </header>
                
                <div className="flex-grow overflow-y-auto pr-2">
                    {renderWorkoutContent()}
                    {workout.notes && <p className="text-xs italic text-muted-foreground mt-4 pt-4 border-t border-border">"{workout.notes}"</p>}
                </div>
            </div>
        </div>
    </div>
  );
}
