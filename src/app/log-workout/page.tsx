
'use client';

import { useExercises } from "@/hooks/use-local-data";
import { LogWorkoutForm } from "@/components/workouts/LogWorkoutForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function LogWorkoutPage() {
  const { exercises, isLoading } = useExercises();
  
  if (isLoading) {
    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
    )
  }
  
  return (
    <LogWorkoutForm exercises={exercises} />
  );
}
