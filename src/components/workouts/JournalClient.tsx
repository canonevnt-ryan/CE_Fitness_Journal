
'use client';

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Workout } from "@/lib/data/types";
import { Clock, Dumbbell, Repeat, Weight, Sun, Moon, Sunrise, HeartPulse, WeightIcon, ChevronLeft, ChevronRight, Pencil, Trash2, Camera } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useWorkouts } from "@/hooks/use-local-data";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { WorkoutShareCard } from "@/components/sharing/WorkoutShareCard";
import { useSettings } from "@/context/SettingsContext";


const supersetColors = [
    'bg-blue-200/50 border-blue-300 dark:bg-blue-900/50 dark:border-blue-700',
    'bg-green-200/50 border-green-300 dark:bg-green-900/50 dark:border-green-700',
    'bg-purple-200/50 border-purple-300 dark:bg-purple-900/50 dark:border-purple-700',
    'bg-orange-200/50 border-orange-300 dark:bg-orange-900/50 dark:border-orange-700',
    'bg-pink-200/50 border-pink-300 dark:bg-pink-900/50 dark:border-pink-700',
    'bg-teal-200/50 border-teal-300 dark:bg-teal-900/50 dark:border-teal-700',
];

const getIconForScoreType = (type: 'time' | 'rounds' | 'reps') => {
  switch (type) {
    case 'time': return <Clock className="w-5 h-5 mr-3 text-primary" />;
    case 'rounds': return <Repeat className="w-5 h-5 mr-3 text-primary" />;
    case 'reps': return <Dumbbell className="w-5 h-5 mr-3 text-primary" />;
    default: return null;
  }
};

const getIconForTimeOfDay = (timeOfDay: 'morning' | 'day' | 'night') => {
  switch (timeOfDay) {
    case 'morning': return <Sunrise className="h-4 w-4" />;
    case 'day': return <Sun className="h-4 w-4" />;
    case 'night': return <Moon className="h-4 w-4" />;
  }
}

const RenderWorkoutDetails = ({ workout }: { workout: Workout }) => {
    const { displayWeight, displayDistance, weightUnit, distanceUnit } = useSettings();

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

  switch (workout.type) {
    case 'traditional':
      return (
        <div className="space-y-6">
          {workout.strength && workout.strength.length > 0 && (
            <div className="space-y-4">
              {workout.strength.map((s, idx) => (
                <div key={idx}>
                  <h3 className="font-semibold mb-2">{s.exerciseName} <span className="text-sm text-muted-foreground font-normal">{s.equipment ? `(${s.equipment})` : ''}</span></h3>
                  <ul className="space-y-3">
                    {s.sets.map((set, i) => {
                       const linkColor = set.supersetLinkId ? supersetLinkColors[set.supersetLinkId] : '';
                      return (
                      <li key={i} className={cn("flex items-center text-muted-foreground transition-colors p-2 rounded-md", linkColor)}>
                        <Weight className="w-4 h-4 mr-3 text-primary/70" />
                        <span className="font-semibold text-foreground">{displayWeight(set.weight)} {weightUnit} &times; {set.reps} reps</span>
                        <span className="ml-4 text-xs">(Set {i + 1})</span>
                         {set.supersetLinkId && <Dumbbell className="w-3 h-3 ml-2 text-primary/80" />}
                      </li>
                    )})}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {workout.cardio && workout.cardio.length > 0 && (
             <div className="space-y-4">
              {workout.cardio.map((c, idx) => (
                <div key={idx}>
                  <h3 className="font-semibold mb-2">{c.exerciseName}</h3>
                  <div className="flex flex-col space-y-3">
                      <div className="flex items-center text-lg font-semibold">
                        <Clock className="w-5 h-5 mr-3 text-primary" />
                        <span>Duration: {c.duration} mins</span>
                      </div>
                      {c.distance != null && (
                        <div className="flex items-center text-lg font-semibold">
                          <HeartPulse className="w-5 h-5 mr-3 text-primary" />
                          <span>Distance: {displayDistance(c.distance)} {distanceUnit}</span>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    case 'metcon':
      return (
        <div className="flex items-center text-xl font-bold">
          {getIconForScoreType(workout.score.type)}
          <span className="mr-2">Score:</span>
          <span>
            {workout.score.value}
            {workout.score.type === 'rounds' && ' rounds'}
          </span>
        </div>
      );
  }
}

const getWorkoutTitle = (workout: Workout): string => {
  if (workout.type === 'metcon') {
    return workout.workoutName;
  }
  if (workout.type === 'traditional') {
    const parts = [];
    if (workout.strength && workout.strength.length > 0) {
      parts.push(workout.strength.map(s => s.exerciseName).join(' / '));
    }
    if (workout.cardio && workout.cardio.length > 0) {
      parts.push(workout.cardio.map(c => c.exerciseName).join(' / '));
    }
    if (parts.length > 0) return parts.join(' & ');
  }
  return "Workout";
}


export function JournalClient({ history }: { history: Workout[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { deleteWorkout } = useWorkouts();
  const { toast } = useToast();
  const { displayWeight, weightUnit } = useSettings();
  
  const currentWorkout = history[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : history.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prevIndex => (prevIndex < history.length - 1 ? prevIndex + 1 : 0));
  };

  const handleDelete = (id: string) => {
    try {
        deleteWorkout(id);
        toast({
            title: "Workout Deleted",
            description: "The workout has been removed from your journal.",
        });
        if (currentIndex >= history.length - 1) {
            setCurrentIndex(Math.max(0, history.length - 2));
        }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to delete workout."
        })
    }
  }

  if (!currentWorkout) {
     return (
        <div className="flex flex-col items-center gap-4">
            <Card className="text-center p-8 w-full max-w-lg">
                <p className="text-muted-foreground">You haven't logged any workouts yet. Time to get started!</p>
            </Card>
        </div>
     )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between gap-4 w-full max-w-lg mb-4">
        <Button variant="outline" size="icon" onClick={goToPrevious} disabled={history.length <= 1}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous Workout</span>
        </Button>
        <p className="text-sm text-muted-foreground font-medium text-center">
            Workout {currentIndex + 1} of {history.length}
        </p>
        <Button variant="outline" size="icon" onClick={goToNext} disabled={history.length <= 1}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next Workout</span>
        </Button>
      </div>

      <div className="max-w-lg w-full">
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between bg-card gap-4">
              <div className="flex-1">
                  <Badge variant={currentWorkout.type === 'traditional' ? 'default' : 'secondary'} className="capitalize mb-2">{currentWorkout.type}</Badge>
                  <CardTitle>{getWorkoutTitle(currentWorkout)}</CardTitle>
                  <CardDescription className="flex items-center gap-2 pt-1 capitalize">
                  {getIconForTimeOfDay(currentWorkout.timeOfDay)}
                  {currentWorkout.timeOfDay} &bull; {format(parseISO(currentWorkout.date), "EEEE, MMM d, yyyy")}
                  </CardDescription>
              </div>
                <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Camera className="h-4 w-4" />
                            <span className="sr-only">Share</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Share Workout</DialogTitle>
                        </DialogHeader>
                        <WorkoutShareCard workout={currentWorkout} />
                      </DialogContent>
                    </Dialog>
                    <Link href={`/edit-workout/${currentWorkout.id}`} passHref>
                        <Button variant="outline" size="icon">
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                    </Link>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this
                                workout from your journal.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(currentWorkout.id)}>
                                Continue
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardHeader>
            <CardContent className="pt-6 flex-grow">
                <RenderWorkoutDetails workout={currentWorkout} />
            </CardContent>
             <CardFooter className="flex-col items-stretch gap-4 pt-6">
                {(currentWorkout.bodyWeight || currentWorkout.notes) && (
                    <div className="space-y-4 pt-4 border-t">
                        {currentWorkout.bodyWeight && (
                            <div className="text-sm text-muted-foreground flex items-center">
                            <WeightIcon className="h-4 w-4 mr-2" />
                            <span>Body Weight: {displayWeight(currentWorkout.bodyWeight)} {weightUnit}</span>
                            </div>
                        )}
                        {currentWorkout.notes && <p className="text-sm italic text-muted-foreground">"{currentWorkout.notes}"</p>}
                    </div>
                )}
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
