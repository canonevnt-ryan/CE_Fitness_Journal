
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Workout } from '@/lib/data/types';
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
  add,
  sub,
  isSameMonth,
  isToday,
  parseISO,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type WorkoutCalendarProps = {
  history: Workout[];
};

export function WorkoutCalendar({ history }: WorkoutCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);

  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const startingDayIndex = getDay(firstDayOfMonth);

  const workoutsByDay = React.useMemo(() => {
    const workouts: Record<string, string[]> = {};
    history.forEach((workout) => {
      // Parse the date string without timezone conversion issues
      const workoutDate = parseISO(workout.date);
      const dateKey = format(workoutDate, 'yyyy-MM-dd');
      
      if (!workouts[dateKey]) {
        workouts[dateKey] = [];
      }
      if (!workouts[dateKey].includes(workout.type)) {
        workouts[dateKey].push(workout.type);
      }
    });
    return workouts;
  }, [history]);

  const nextMonth = () => {
    setCurrentDate(add(currentDate, { months: 1 }));
  };

  const prevMonth = () => {
    setCurrentDate(sub(currentDate, { months: 1 }));
  };

  const getWorkoutBorder = (day: Date) => {
    const dayKey = format(day, 'yyyy-MM-dd');
    const dayWorkouts = workoutsByDay[dayKey] || [];
    if (dayWorkouts.includes('traditional')) {
      return 'border-primary';
    }
    if (dayWorkouts.includes('metcon')) {
      return 'border-accent';
    }
    return 'border-border';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold font-headline">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mt-2">
        {Array.from({ length: startingDayIndex }).map((_, index) => (
          <div key={`empty-${index}`} className="h-20 border rounded-md" />
        ))}
        {daysInMonth.map((day) => (
          <div
            key={day.toString()}
            className={cn(
              'h-20 border rounded-md p-1.5 text-left flex flex-col',
              !isSameMonth(day, currentDate) && 'text-muted-foreground',
              isToday(day) && 'bg-secondary',
              getWorkoutBorder(day)
            )}
          >
            <span
              className={cn(
                'font-medium',
                isToday(day) && 'text-primary'
              )}
            >
              {format(day, 'd')}
            </span>
            <div className="flex-grow" />
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full border border-primary" />
          <span>Traditional</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full border border-accent" />
          <span>Metcon</span>
        </div>
      </div>
    </div>
  );
}
