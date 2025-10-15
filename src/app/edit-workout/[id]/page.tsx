
'use client';

import { useExercises, useWorkouts } from "@/hooks/use-local-data";
import { LogWorkoutForm } from "@/components/workouts/LogWorkoutForm";
import { notFound, useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditWorkoutPage() {
  const params = useParams();
  const id = params.id as string;
  const { exercises, isLoading: isLoadingExercises } = useExercises();
  const { getWorkoutById, isLoading: isLoadingWorkouts } = useWorkouts();
  
  const workout = getWorkoutById(id);
  const isLoading = isLoadingExercises || isLoadingWorkouts;

  if (!isLoading && !workout) {
    notFound();
  }

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
    <LogWorkoutForm exercises={exercises} workoutId={id} initialData={workout} />
  );
}
