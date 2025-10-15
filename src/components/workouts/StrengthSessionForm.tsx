
"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Exercise } from "@/lib/data/types";
import { PlusCircle, Trash2, Link2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/context/SettingsContext";
import { Checkbox } from "../ui/checkbox";

export const strengthWorkoutSchema = z.object({
  id: z.string(),
  exerciseName: z.string().min(1, "Please select an exercise."),
  equipment: z.string().optional(),
  sets: z.array(z.object({
    id: z.string(),
    reps: z.coerce.number().min(1, "Must be at least 1."),
    weight: z.coerce.number().min(0, "Cannot be negative."),
    supersetLinkId: z.string().optional(),
  })).min(1, "Add at least one set."),
});

export const strengthSessionSchema = z.object({
  id: z.string(),
  exercises: z.array(strengthWorkoutSchema).min(1, "A strength session must have at least one exercise."),
});


type StrengthSessionFormProps = {
  sessionIndex: number;
  removeSession: (index: number) => void;
  exercises: Exercise[];
}

const equipmentTypes = ['Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'Other'];

export const supersetColors = [
    'bg-blue-200/50 border-blue-300 dark:bg-blue-900/50 dark:border-blue-700',
    'bg-green-200/50 border-green-300 dark:bg-green-900/50 dark:border-green-700',
    'bg-purple-200/50 border-purple-300 dark:bg-purple-900/50 dark:border-purple-700',
    'bg-orange-200/50 border-orange-300 dark:bg-orange-900/50 dark:border-orange-700',
    'bg-pink-200/50 border-pink-300 dark:bg-pink-900/50 dark:border-pink-700',
    'bg-teal-200/50 border-teal-300 dark:bg-teal-900/50 dark:border-teal-700',
];

type SetIdentifier = {
    exerciseIndex: number;
    setIndex: number;
};

function StrengthExerciseForm({ sessionIndex, exerciseIndex, removeExercise, strengthExercises, isLinkingMode, selectedSets, toggleSetSelection, supersetLinkColors }: { sessionIndex: number, exerciseIndex: number, removeExercise: (index: number) => void, strengthExercises: Exercise[], isLinkingMode: boolean, selectedSets: SetIdentifier[], toggleSetSelection: (exIndex: number, setIndex: number) => void, supersetLinkColors: Record<string, string> }) {
  const form = useFormContext();
  const { weightUnit } = useSettings();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `details.strengthSessions.${sessionIndex}.exercises.${exerciseIndex}.sets`,
  });

  return (
    <Card className="bg-card relative">
        <CardHeader className="p-4">
            <CardTitle className="text-base flex justify-between items-center">
                <span>Exercise #{exerciseIndex + 1}</span>
                 <Button type="button" variant="ghost" size="icon" onClick={() => removeExercise(exerciseIndex)} className="text-muted-foreground hover:text-destructive h-7 w-7">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </CardTitle>
        </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name={`details.strengthSessions.${sessionIndex}.exercises.${exerciseIndex}.exerciseName`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exercise</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an exercise" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {strengthExercises.map((ex) => (
                      <SelectItem key={ex.id} value={ex.name}>{ex.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name={`details.strengthSessions.${sessionIndex}.exercises.${exerciseIndex}.equipment`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipment</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {equipmentTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormLabel>Sets</FormLabel>
          <div className="space-y-2 mt-2">
            {fields.map((field, index) => {
                const set = form.getValues().details.strengthSessions[sessionIndex].exercises[exerciseIndex].sets[index];
                const supersetLinkId = set.supersetLinkId;
                const isLinked = !!supersetLinkId;
                const linkColor = isLinked ? supersetLinkColors[supersetLinkId] : '';
                const isSelected = selectedSets.some(s => s.exerciseIndex === exerciseIndex && s.setIndex === index);

                return (
                    <div key={field.id} className={cn("flex gap-2 items-end p-2 border rounded-lg bg-card transition-colors", linkColor, isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background')}>
                    {isLinkingMode && (
                        <div className="flex items-center pr-2">
                            <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleSetSelection(exerciseIndex, index)}
                                id={`cb-${sessionIndex}-${exerciseIndex}-${index}`}
                            />
                        </div>
                    )}
                    <FormField
                    control={form.control}
                    name={`details.strengthSessions.${sessionIndex}.exercises.${exerciseIndex}.sets.${index}.weight`}
                    render={({ field }) => (
                        <FormItem className="flex-1">
                        <FormLabel className="text-xs">Weight ({weightUnit})</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                placeholder="0"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name={`details.strengthSessions.${sessionIndex}.exercises.${exerciseIndex}.sets.${index}.reps`}
                    render={({ field }) => (
                        <FormItem className="flex-1">
                        <FormLabel className="text-xs">Reps</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <div className="flex flex-col gap-1">
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-muted-foreground hover:text-destructive shrink-0 h-7 w-7">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                )
            })}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ id: crypto.randomUUID(), weight: 0, reps: 0 })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Set
          </Button>
          <FormMessage>{(form.formState.errors as any)?.details?.strengthSessions?.[sessionIndex]?.exercises?.[exerciseIndex]?.sets?.root?.message}</FormMessage>
        </div>
      </CardContent>
    </Card>
  );
}


export function StrengthSessionForm({ sessionIndex, removeSession, exercises }: StrengthSessionFormProps) {
  const form = useFormContext();
  const [isLinkingMode, setIsLinkingMode] = useState(false);
  const [selectedSets, setSelectedSets] = useState<SetIdentifier[]>([]);

  // Compute colors based on form state
  const supersetLinkColors = useMemo(() => {
    const colorMap: Record<string, string> = {};
    let colorIndex = 0;
    const session = form.getValues().details.strengthSessions[sessionIndex];
    if (!session) return colorMap;

    session.exercises.forEach((ex: any) => {
      ex.sets.forEach((set: any) => {
        if (set.supersetLinkId && !colorMap[set.supersetLinkId]) {
          colorMap[set.supersetLinkId] = supersetColors[colorIndex % supersetColors.length];
          colorIndex++;
        }
      });
    });
    return colorMap;
  }, [form, sessionIndex]);
  
  const toggleSetSelection = (exerciseIndex: number, setIndex: number) => {
    setSelectedSets(prev => {
        const setIdentifier = { exerciseIndex, setIndex };
        const isAlreadySelected = prev.some(s => s.exerciseIndex === exerciseIndex && s.setIndex === setIndex);
        if (isAlreadySelected) {
            return prev.filter(s => !(s.exerciseIndex === exerciseIndex && s.setIndex === setIndex));
        } else {
            return [...prev, setIdentifier];
        }
    });
  }

  const getNextColor = () => {
    const usedColors = Object.values(supersetLinkColors);
    return supersetColors.find(c => !usedColors.includes(c)) || supersetColors[0];
  }

  const handleCreateLink = () => {
    if (selectedSets.length < 2) return;
    
    const newLinkId = crypto.randomUUID();
    const sessionPath = `details.strengthSessions.${sessionIndex}.exercises`;
    const exercisesInSession = form.getValues(sessionPath);

    selectedSets.forEach(({ exerciseIndex, setIndex }) => {
        const currentSet = exercisesInSession[exerciseIndex].sets[setIndex];
        form.setValue(`${sessionPath}.${exerciseIndex}.sets.${setIndex}`, {
            ...currentSet,
            supersetLinkId: newLinkId,
        });
    });

    setSelectedSets([]);
    setIsLinkingMode(false);
  }

  const handleUnlink = () => {
    if (selectedSets.length === 0) return;
    
    const sessionPath = `details.strengthSessions.${sessionIndex}.exercises`;
    const exercisesInSession = form.getValues(sessionPath);

    selectedSets.forEach(({ exerciseIndex, setIndex }) => {
        const currentSet = exercisesInSession[exerciseIndex].sets[setIndex];
        form.setValue(`${sessionPath}.${exerciseIndex}.sets.${setIndex}`, {
            ...currentSet,
            supersetLinkId: undefined,
        });
    });

    setSelectedSets([]);
  }

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `details.strengthSessions.${sessionIndex}.exercises`,
  });

  const strengthExercises = exercises.filter(ex => ex.type === 'strength');

  return (
    <Card className="bg-muted/50">
        <CardHeader className="flex flex-row items-center justify-between p-4">
            <CardTitle>Strength Session #{sessionIndex + 1}</CardTitle>
            <div className="flex items-center gap-2">
                 <Button type="button" variant={isLinkingMode ? 'default': 'outline'} size="sm" onClick={() => {setIsLinkingMode(!isLinkingMode); setSelectedSets([]);}}>
                    <Link2 className="mr-2 h-4 w-4" /> {isLinkingMode ? 'Done Linking' : 'Link Supersets'}
                </Button>
                <Button type="button" variant="destructive" size="sm" onClick={() => removeSession(sessionIndex)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Remove Session
                </Button>
            </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0">
            {isLinkingMode && <p className="text-sm text-primary text-center p-2 bg-primary/10 rounded-md">Select sets to link or unlink.</p>}
            {fields.map((field, index) => (
                <StrengthExerciseForm
                    key={field.id}
                    sessionIndex={sessionIndex}
                    exerciseIndex={index}
                    removeExercise={remove}
                    strengthExercises={strengthExercises}
                    isLinkingMode={isLinkingMode}
                    selectedSets={selectedSets}
                    toggleSetSelection={toggleSetSelection}
                    supersetLinkColors={supersetLinkColors}
                />
            ))}
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => append({ id: crypto.randomUUID(), exerciseName: "", equipment: "", sets: [{ id: crypto.randomUUID(), weight: 0, reps: 0 }] })}
            >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Exercise to Session
            </Button>
            <FormMessage>{(form.formState.errors as any)?.details?.strengthSessions?.[sessionIndex]?.exercises?.root?.message}</FormMessage>

            {isLinkingMode && selectedSets.length > 0 && (
                <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm p-3 border-t -mx-4 -mb-4 rounded-b-lg flex items-center justify-center gap-2">
                    <Button type="button" size="sm" onClick={handleCreateLink} disabled={selectedSets.length < 2}>
                        Create Link ({selectedSets.length})
                    </Button>
                     <Button type="button" variant="destructive" size="sm" onClick={handleUnlink} disabled={selectedSets.length === 0}>
                        Unlink Selected ({selectedSets.length})
                    </Button>
                </div>
            )}
        </CardContent>
    </Card>
  );
}
