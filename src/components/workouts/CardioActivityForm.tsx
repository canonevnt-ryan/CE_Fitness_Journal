
"use client";

import { useFormContext } from "react-hook-form";
import * as z from "zod";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Exercise } from "@/lib/data/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export const cardioWorkoutSchema = z.object({
  id: z.string(),
  exerciseName: z.string().min(1, "Please select an exercise.").optional().or(z.literal("")),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute.").optional(),
  distance: z.coerce.number().min(0, "Distance cannot be negative.").optional(),
}).refine(data => {
    if (data.exerciseName) {
        return data.duration !== undefined && data.duration > 0;
    }
    return true;
});


type CardioActivityFormProps = {
  exercises: Exercise[];
  sessionIndex: number;
  removeSession: (index: number) => void;
};

export function CardioActivityForm({ exercises, sessionIndex, removeSession }: CardioActivityFormProps) {
  const form = useFormContext();
  const { distanceUnit } = useSettings();
  const cardioExercises = exercises.filter((ex) => ex.type === 'cardio');

  return (
     <Card className="bg-card relative">
        <CardHeader className="p-4">
            <CardTitle className="text-base flex justify-between items-center">
                <span>Cardio Session #{sessionIndex + 1}</span>
                 <Button type="button" variant="ghost" size="icon" onClick={() => removeSession(sessionIndex)} className="text-muted-foreground hover:text-destructive h-7 w-7">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-4 pt-0">
          <FormField
            control={form.control}
            name={`details.cardioSessions.${sessionIndex}.exerciseName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exercise</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a cardio exercise" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cardioExercises.map((ex) => (
                      <SelectItem key={ex.id} value={ex.name}>{ex.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name={`details.cardioSessions.${sessionIndex}.duration`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <Input type="number" placeholder="0" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                         <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground text-sm">
                            mins
                        </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`details.cardioSessions.${sessionIndex}.distance`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Distance</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <Input
                            type="number"
                            placeholder="0"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground text-sm">
                            {distanceUnit}
                        </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
    </CardContent>
    </Card>
  );
}
