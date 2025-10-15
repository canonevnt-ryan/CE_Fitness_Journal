
'use client';

import { Card } from "@/components/ui/card";
import { BookOpen, CalendarDays } from "lucide-react";
import { JournalClient } from "@/components/workouts/JournalClient";
import AuthGuard from "@/components/auth/AuthGuard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WorkoutCalendar } from "@/components/workouts/WorkoutCalendar";
import { useWorkouts } from "@/hooks/use-local-data";
import { Skeleton } from "@/components/ui/skeleton";

export default function JournalPage() {
  const { workouts, isLoading } = useWorkouts();

  return (
    <AuthGuard>
      <div className="space-y-8 relative">
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <BookOpen className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold font-headline">
                    Workout Journal
                </h1>
            </div>
        </div>
        
        {isLoading ? (
          <Skeleton className="h-96 w-full max-w-lg mx-auto" />
        ) : workouts.length === 0 ? (
          <Card className="text-center p-8">
            <p className="text-muted-foreground">You haven't logged any workouts yet. Time to get started!</p>
          </Card>
        ) : (
          <JournalClient history={workouts} />
        )}

        <Dialog>
            <DialogTrigger asChild>
                <Button className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg" size="icon">
                    <CalendarDays className="h-6 w-6" />
                    <span className="sr-only">View Calendar</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
                <DialogHeader>
                <DialogTitle>Workout Calendar</DialogTitle>
                </DialogHeader>
                <WorkoutCalendar history={workouts} />
            </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
}
