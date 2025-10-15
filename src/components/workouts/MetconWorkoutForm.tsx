
"use client";

import { useFormContext } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useMetcons } from "@/hooks/use-local-data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

export const metconWorkoutSchema = z.object({
  workoutName: z.string().min(1, "Please enter a workout name."),
  scoreValue: z.string().min(1, "Please enter your score."),
  notes: z.string().optional(),
  // scoreType is now optional here as it will be derived, but still needed for the final workout object
  scoreType: z.enum(["time", "rounds", "reps", "other"]).optional(),
});

export function MetconWorkoutForm() {
  const form = useFormContext(); // Use the parent form context
  const { metcons } = useMetcons();

  const selectedWorkoutName = form.watch("details.workoutName");
  const selectedMetcon = metcons.find(m => m.name === selectedWorkoutName);

  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="details.workoutName"
        render={({ field }) => (
           <FormItem>
            <FormLabel>Workout Name</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a metcon" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {metcons.map((m) => (
                  <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedMetcon && (
        <Card className="bg-muted/50">
          <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">{selectedMetcon.name}</CardTitle>
                <Badge variant="secondary">{selectedMetcon.type}</Badge>
              </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedMetcon.description}</p>
            {selectedMetcon.timeCap && <p className="text-xs text-muted-foreground pt-2 border-t">Time Cap: {selectedMetcon.timeCap} minutes</p>}
          </CardContent>
        </Card>
      )}

      <FormField
        control={form.control}
        name="details.scoreValue"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Score</FormLabel>
            <FormControl>
              <Input placeholder="e.g., 12:34 or 25" {...field} />
            </FormControl>
            <FormDescription>
              Enter time (MM:SS), number of rounds, or total reps.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="details.notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea placeholder="How did it go? Any scaling?" {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
