
'use client';

import { useWorkouts, usePersonalBests } from "@/hooks/use-local-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Workout } from "@/lib/data/types";
import { Clock, Dumbbell, BookOpen, PlusCircle, Repeat, Trophy, Weight, Sun, Moon, Sunrise, HeartPulse } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import AuthGuard from "@/components/auth/AuthGuard";
import Welcome from "@/components/dashboard/Welcome";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/context/SettingsContext";

const getIconForScoreType = (type: 'time' | 'rounds' | 'reps') => {
  switch (type) {
    case 'time': return <Clock className="w-4 h-4 mr-2 text-primary" />;
    case 'rounds': return <Repeat className="w-4 h-4 mr-2 text-primary" />;
    case 'reps': return <Dumbbell className="w-4 h-4 mr-2 text-primary" />;
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

const RenderWorkoutDetails = ({ workout }: { workout: Workout }) => {
    const { displayWeight, displayDistance, weightUnit, distanceUnit } = useSettings();

    switch (workout.type) {
        case 'traditional':
        return (
            <div className="space-y-4">
            {workout.strength && workout.strength.length > 0 && (
                <div className="space-y-3">
                {workout.strength.slice(0, 1).map((s, idx) => (
                    <div key={idx}>
                    <h4 className="font-medium text-sm mb-2">{s.exerciseName}</h4>
                    <ul className="space-y-2">
                        {s.sets.slice(0, 2).map((set, i) => (
                        <li key={i} className="flex items-center text-sm text-muted-foreground">
                            <Weight className="w-4 h-4 mr-2 text-primary/70" />
                            Set {i + 1}: {displayWeight(set.weight)} {weightUnit} &times; {set.reps} reps
                        </li>
                        ))}
                    </ul>
                    </div>
                ))}
                {workout.strength.length > 1 && <p className="text-xs text-muted-foreground italic">+ {workout.strength.length - 1} more exercise(s)</p>}
                </div>
            )}
            {workout.cardio && workout.cardio.length > 0 && (
                <div>
                <h4 className="font-medium text-sm mb-2">{workout.cardio[0].exerciseName}</h4>
                <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-primary/70" />
                        <span>Duration: {workout.cardio[0].duration} mins</span>
                    </div>
                    {workout.cardio[0].distance != null && (
                        <div className="flex items-center">
                        <HeartPulse className="w-4 h-4 mr-2 text-primary/70" />
                        <span>Distance: {displayDistance(workout.cardio[0].distance)} {distanceUnit}</span>
                        </div>
                    )}
                </div>
                    {workout.cardio.length > 1 && <p className="text-xs text-muted-foreground italic mt-2">+ {workout.cardio.length - 1} more cardio</p>}
                </div>
            )}
            </div>
        );
        case 'metcon':
        return (
            <div className="flex items-center text-lg font-semibold">
            {getIconForScoreType(workout.score.type)}
            <span>Score: {workout.score.value}
                {workout.score.type === 'rounds' && ' rounds'}
            </span>
            </div>
        );
    }
}

// Helper to check for a cookie on the client
const hasVisitedCookie = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    return document.cookie.includes('visited=true');
}

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { bests, isLoading: isLoadingBests } = usePersonalBests();
  const { workouts, isLoading: isLoadingWorkouts } = useWorkouts();
  const { displayWeight, weightUnit } = useSettings();
  
  const recentWorkouts = workouts.slice(0, 3);
  const isLoading = isLoadingBests || isLoadingWorkouts;

  useEffect(() => {
    setIsClient(true);
    setShowWelcome(!hasVisitedCookie());
  }, []);

  if (!isClient) {
     return (
       <div className="space-y-12">
        <Skeleton className="h-[148px] w-full" />
        <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-36" />
                <Skeleton className="h-36" />
                <Skeleton className="h-36" />
                <Skeleton className="h-36" />
            </div>
        </div>
         <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="space-y-4">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
            </div>
        </div>
       </div>
    );
  }

  if (showWelcome) {
    return (
      <AuthGuard>
        <Welcome />
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="space-y-12">
      <section className="bg-card p-8 rounded-lg shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline text-foreground">Welcome back to FitFlow</h1>
          <p className="text-muted-foreground mt-2">Your journey to strength continues. Let's get moving!</p>
        </div>
        <Button asChild size="lg" className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/log-workout">
            <PlusCircle className="mr-2 h-5 w-5" />
            Log New Workout
          </Link>
        </Button>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold font-headline flex items-center"><Trophy className="mr-3 text-primary" />Personal Bests</h2>
          <Button variant="link" asChild>
              <Link href="/bests">View All Bests &rarr;</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </>
          ) : bests.length > 0 ? bests.slice(0,4).map((pb) => (
            <Card key={pb.name}>
              <CardHeader>
                <CardTitle className="text-lg">{pb.name}</CardTitle>
                <CardDescription>{format(parseISO(pb.date), "MMMM d, yyyy")}</CardDescription>
              </CardHeader>
              <CardContent>
                 <p className="text-3xl font-bold text-primary">{pb.best.value} <span className="text-base font-medium text-muted-foreground">{pb.best.unit}</span></p>
              </CardContent>
            </Card>
          )) : <p className="text-muted-foreground">No personal bests yet.</p>}
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold font-headline flex items-center"><BookOpen className="mr-3 text-primary" />Recent Activity</h2>
          <Button variant="link" asChild>
              <Link href="/journal">View Full Journal &rarr;</Link>
          </Button>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <>
              <Skeleton className="h-56" />
              <Skeleton className="h-56" />
            </>
          ) : recentWorkouts.length > 0 ? recentWorkouts.map((workout: Workout) => (
            <Card key={workout.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{getWorkoutTitle(workout)}</span>
                  <Badge variant={workout.type === 'traditional' ? 'default' : 'secondary'} className="capitalize">{workout.type}</Badge>
                </CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1 capitalize">
                    {getIconForTimeOfDay(workout.timeOfDay)}
                    {workout.timeOfDay} &bull; {format(parseISO(workout.date), "EEEE, MMM d, yyyy")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RenderWorkoutDetails workout={workout} />
                {workout.notes && <p className="text-sm italic text-muted-foreground mt-3 pt-3 border-t">"{workout.notes}"</p>}
              </CardContent>
            </Card>
          )) : <p className="text-muted-foreground">No recent workouts.</p>}
        </div>
      </section>
    </div>
    </AuthGuard>
  );
}
