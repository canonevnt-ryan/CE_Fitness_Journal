
"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StrengthSessionForm, strengthSessionSchema } from "@/components/workouts/StrengthSessionForm";
import { CardioActivityForm, cardioWorkoutSchema } from "@/components/workouts/CardioActivityForm";
import { MetconWorkoutForm, metconWorkoutSchema } from "@/components/workouts/MetconWorkoutForm";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Exercise, StrengthLog, Workout, CardioLog, Metcon } from "@/lib/data/types";
import { useWorkouts, useMetcons } from "@/hooks/use-local-data";
import { format, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, Timer, Sunrise, Sun, Moon, Dumbbell, BookOpen, Trash2, PlusCircle, Heart, HelpCircle, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useSettings } from "@/context/SettingsContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";

const traditionalWorkoutSchema = z.object({
    strengthSessions: z.array(strengthSessionSchema).optional(),
    cardioSessions: z.array(cardioWorkoutSchema).optional(),
    notes: z.string().optional(),
}).refine(data => (data.strengthSessions && data.strengthSessions.length > 0) || (data.cardioSessions && data.cardioSessions.length > 0), {
    message: "At least one strength or cardio session is required.",
    path: ["strengthSessions"],
});


const formSchema = z.discriminatedUnion("workoutType", [
  z.object({
    workoutType: z.literal("traditional"),
    date: z.date({ required_error: "A date is required." }),
    timeOfDay: z.enum(["morning", "day", "night"], { required_error: "Please select a time of day." }),
    bodyWeight: z.coerce.number().positive("Body weight must be a positive number.").optional().or(z.literal('')),
    details: traditionalWorkoutSchema,
  }),
  z.object({
    workoutType: z.literal("metcon"),
    date: z.date({ required_error: "A date is required." }),
    timeOfDay: z.enum(["morning", "day", "night"], { required_error: "Please select a time of day." }),
    bodyWeight: z.coerce.number().positive("Body weight must be a positive number.").optional().or(z.literal('')),
    details: metconWorkoutSchema,
  }),
]);

type LogWorkoutFormProps = {
  exercises: Exercise[];
  workoutId?: string;
  initialData?: Workout;
};

// Helper function to map old strength structure to new session structure
const mapStrengthToSessions = (strength: StrengthLog[] | undefined) => {
    if (!strength || strength.length === 0) {
        return [];
    }
    // Group all old strength exercises into a single session for backward compatibility
    return [{ id: crypto.randomUUID(), exercises: strength }];
}

const mapCardioToSessions = (cardio: CardioLog[] | undefined) => {
    if (!cardio || cardio.length === 0) {
        return [];
    }
    // ensure each cardio item has a unique id
    return cardio.map(c => ({...c, id: c.id || crypto.randomUUID()}));
}

export function LogWorkoutForm({ exercises, workoutId, initialData }: LogWorkoutFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { addWorkout, updateWorkout, deleteWorkout } = useWorkouts();
  const { metcons } = useMetcons();
  const { weightUnit } = useSettings();
  const [workoutType, setWorkoutType] = useState<"traditional" | "metcon">(initialData?.type || "traditional");
  
  const isEditMode = !!initialData;

  const parseDateString = (dateStr: string) => {
    // The date is stored as "yyyy-MM-dd". We parse it into a local Date object.
    // The `parse` function from date-fns is great for this, as it avoids timezone pitfalls.
    return parse(dateStr, 'yyyy-MM-dd', new Date());
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
        ...initialData,
        date: parseDateString(initialData.date),
        workoutType: initialData.type as "traditional" | "metcon",
        bodyWeight: initialData.bodyWeight || '',
        details: initialData.type === 'traditional' ? {
            strengthSessions: mapStrengthToSessions(initialData.strength),
            cardioSessions: mapCardioToSessions(initialData.cardio),
            notes: initialData.notes || '',
        } : {
            workoutName: initialData.workoutName,
            scoreValue: initialData.score.value,
            scoreType: initialData.score.type,
            notes: initialData.notes || '',
        }
    } : {
      workoutType: "traditional",
      date: new Date(),
      bodyWeight: '',
      timeOfDay: 'day',
      details: {
        strengthSessions: [],
        cardioSessions: [],
        notes: '',
      },
    },
  });

  const { fields: strengthFields, append: appendStrength, remove: removeStrength } = useFieldArray({
    control: form.control,
    name: "details.strengthSessions",
  });

  const { fields: cardioFields, append: appendCardio, remove: removeCardio } = useFieldArray({
    control: form.control,
    name: "details.cardioSessions",
  });

  useEffect(() => {
    if (initialData) {
        setWorkoutType(initialData.type as "traditional" | "metcon");
        form.reset({
             workoutType: initialData.type as "traditional" | "metcon",
             date: parseDateString(initialData.date),
             timeOfDay: initialData.timeOfDay,
             bodyWeight: initialData.bodyWeight || '',
             details: initialData.type === 'traditional' ? {
                strengthSessions: mapStrengthToSessions(initialData.strength),
                cardioSessions: mapCardioToSessions(initialData.cardio),
                notes: initialData.notes || '',
             } : {
                workoutName: initialData.workoutName,
                scoreValue: initialData.score.value,
                scoreType: initialData.score.type,
                notes: initialData.notes || '',
             }
        });
    }
  }, [initialData, form]);

  const handleTabChange = (value: string) => {
    if (isEditMode) return; // Prevent changing type in edit mode
    const newWorkoutType = value as "traditional" | "metcon";
    setWorkoutType(newWorkoutType);
    form.setValue("workoutType", newWorkoutType);

    // Get common values before reset
    const commonValues = {
        date: form.getValues('date'),
        timeOfDay: form.getValues('timeOfDay'),
        bodyWeight: form.getValues('bodyWeight'),
    }

    if (newWorkoutType === "traditional") {
      form.reset({
        ...commonValues,
        workoutType: "traditional",
        details: {
          strengthSessions: [],
          cardioSessions: [],
          notes: '',
        },
      });
    } else {
      form.reset({
        ...commonValues,
        workoutType: "metcon",
        details: {
          workoutName: "",
          scoreValue: "",
          notes: "",
        },
      });
    }
  };

  const handleDelete = async () => {
    if (!workoutId) return;
    try {
        deleteWorkout(workoutId);
        toast({
            title: "Workout Deleted",
            description: "The workout has been removed from your journal.",
        });
        router.push('/journal');
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error.message || "Failed to delete workout."
        })
    }
  }

  const getScoreTypeFromMetconType = (metconType: Metcon['type']): 'time' | 'rounds' | 'reps' => {
      switch (metconType) {
        case 'For Time':
          return 'time';
        case 'AMRAP':
          return 'rounds';
        case 'EMOM': // EMOMs can be scored different ways, but reps is a common one if it's for total reps
        case 'Other':
        default:
          return 'reps';
      }
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      let workoutData: any;
      
      const bodyWeight = values.bodyWeight ? Number(values.bodyWeight) : undefined;

      if (values.workoutType === 'traditional') {
        const details = values.details as z.infer<typeof traditionalWorkoutSchema>;
        const strength = details.strengthSessions?.flatMap(session => session.exercises).filter(ex => ex.exerciseName);
        const cardio = details.cardioSessions?.filter(c => c.exerciseName);
        workoutData = {
          type: 'traditional',
          date: values.date,
          timeOfDay: values.timeOfDay,
          bodyWeight,
          strength: strength,
          cardio: cardio,
          notes: details.notes,
        };
      } else {
         const details = values.details as z.infer<typeof metconWorkoutSchema>;
         const selectedMetcon = metcons.find(m => m.name === details.workoutName);
         if (!selectedMetcon) {
            toast({
                variant: 'destructive',
                title: 'Invalid Metcon',
                description: 'Please select a valid Metcon workout.',
            });
            return;
         }

         workoutData = {
          type: 'metcon',
          date: values.date,
          timeOfDay: values.timeOfDay,
          bodyWeight,
          workoutName: details.workoutName,
          score: {
            type: getScoreTypeFromMetconType(selectedMetcon.type),
            value: details.scoreValue,
          },
          notes: details.notes,
        };
      }

      if (isEditMode && workoutId) {
        updateWorkout(workoutId, workoutData);
        toast({
          title: "Workout Updated!",
          description: `Your workout for ${format(values.date, "PPP")} has been saved.`,
        });
      } else {
        addWorkout(workoutData);
        toast({
          title: "Workout Logged!",
          description: `Your workout for ${format(values.date, "PPP")} has been saved.`,
        });
      }
      
      router.push('/journal');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: error.message || "Failed to save workout.",
      });
    }
  }

  return (
    <div className="max-w-2xl mx-auto relative pb-24">
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-2xl font-headline">{isEditMode ? 'Edit' : 'Log a'} Workout</CardTitle>
                    <CardDescription>{isEditMode ? 'Update the details for your session.' : 'Fill in the date, time, and details for your session.'}</CardDescription>
                </div>
                {isEditMode && (
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
                            <AlertDialogAction onClick={handleDelete}>
                                Continue
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeOfDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time of Day</FormLabel>
                    <FormControl>
                        <div className="grid grid-cols-3 gap-2 pt-2">
                            <Button
                                type="button"
                                variant={field.value === 'morning' ? 'default' : 'outline'}
                                onClick={() => field.onChange('morning')}
                                className="flex flex-col h-auto py-2"
                            >
                                <Sunrise className="h-5 w-5 mb-1" />
                                <span>Morning</span>
                            </Button>
                             <Button
                                type="button"
                                variant={field.value === 'day' ? 'default' : 'outline'}
                                onClick={() => field.onChange('day')}
                                className="flex flex-col h-auto py-2"
                            >
                                <Sun className="h-5 w-5 mb-1" />
                                <span>Day</span>
                            </Button>
                             <Button
                                type="button"
                                variant={field.value === 'night' ? 'default' : 'outline'}
                                onClick={() => field.onChange('night')}
                                className="flex flex-col h-auto py-2"
                            >
                                <Moon className="h-5 w-5 mb-1" />
                                <span>Night</span>
                            </Button>
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          
            <FormField
              control={form.control}
              name="bodyWeight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Body Weight (Optional)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type="number" placeholder="Enter your body weight" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.valueAsNumber || '')} />
                       <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                        {weightUnit}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Tabs value={workoutType} onValueChange={handleTabChange} className="w-full">
              <TabsList className={cn("grid w-full grid-cols-2", isEditMode && "hidden")}>
                <TabsTrigger value="traditional" disabled={isEditMode}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Traditional
                </TabsTrigger>
                <TabsTrigger value="metcon" disabled={isEditMode}>
                  <Timer className="mr-2 h-4 w-4" />
                  Metcon
                </TabsTrigger>
              </TabsList>
              <TabsContent value="traditional" className="mt-6">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <CardHeader className="p-0 mb-4">
                        <CardTitle className="flex items-center"><Dumbbell className="mr-2 h-5 w-5" /> Strength</CardTitle>
                        <CardDescription>Log your strength training for the day. You can add multiple sessions.</CardDescription>
                    </CardHeader>
                    {strengthFields.map((field, index) => (
                        <StrengthSessionForm
                            key={field.id}
                            exercises={exercises}
                            sessionIndex={index}
                            removeSession={removeStrength}
                        />
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => appendStrength({ id: crypto.randomUUID(), exercises: [{ id: crypto.randomUUID(), exerciseName: "", equipment: "", sets: [{ id: crypto.randomUUID(), weight: 0, reps: 0 }] }] })}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Strength Session
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <CardHeader className="p-0 mb-4">
                        <CardTitle className="flex items-center"><Heart className="mr-2 h-5 w-5" /> Cardio</CardTitle>
                        <CardDescription>Log your cardio training. You can add multiple sessions.</CardDescription>
                    </CardHeader>
                     {cardioFields.map((field, index) => (
                        <CardioActivityForm
                            key={field.id}
                            exercises={exercises}
                            sessionIndex={index}
                            removeSession={removeCardio}
                        />
                    ))}
                     <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => appendCardio({ id: crypto.randomUUID(), exerciseName: "", duration: 0, distance: 0 })}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Cardio Session
                    </Button>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="details.notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workout Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="General notes about your whole workout..." {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormMessage>{(form.formState.errors as any)?.details?.strengthSessions?.root?.message}</FormMessage>
                </div>
              </TabsContent>
              <TabsContent value="metcon" className="mt-6">
                <MetconWorkoutForm />
              </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
      
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t md:relative md:p-0 md:bg-transparent md:border-0">
             <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (isEditMode ? "Updating..." : "Logging...") : (isEditMode ? "Update Workout" : "Log Workout")}
            </Button>
        </div>
      </form>
    </Form>

    <Dialog>
        <DialogTrigger asChild>
            <Button variant="outline" className="fixed bottom-24 right-8 h-12 w-12 rounded-full shadow-lg md:bottom-8" size="icon">
                <HelpCircle className="h-6 w-6" />
                <span className="sr-only">Help</span>
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Workout Logger Help</DialogTitle>
                <DialogDescription>
                    Here's a quick guide to logging your workouts effectively.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm text-muted-foreground max-h-[60vh] overflow-y-auto pr-4">
                <h3 className="font-semibold text-foreground">Workout Types</h3>
                <p><strong className="text-primary">Traditional:</strong> Use this for classic strength and cardio training. You can log individual exercises with sets, reps, and weight, as well as separate cardio sessions like running or cycling.</p>
                <p><strong className="text-primary">Metcon:</strong> Stands for Metabolic Conditioning. Use this for workouts where the score is based on time, total rounds, or reps (e.g., CrossFit WODs like 'Fran' or 'Cindy').</p>

                <h3 className="font-semibold text-foreground">Creating a Superset</h3>
                <p>A superset is when you perform two or more exercises back-to-back with minimal rest. Our logger lets you group sets from different exercises together.</p>
                <ol className="list-decimal list-inside space-y-2">
                    <li>Inside a "Strength Session", click the <strong className="text-primary">Link Supersets</strong> button. This enters linking mode.</li>
                    <li>Checkboxes will appear next to each set. Select all the sets across different exercises that you want to group together.</li>
                    <li>Click the <strong className="text-primary">Create Link</strong> button that appears at the bottom of the session.</li>
                    <li>The selected sets will be highlighted with a matching color. You can create multiple, differently-colored superset groups within a single session.</li>
                    <li>To remove a link, enter linking mode again, select the sets you want to unlink, and click <strong className="text-destructive">Unlink Selected</strong>.</li>
                </ol>

                <h3 className="font-semibold text-foreground">Sessions</h3>
                <p>You can organize your Traditional workout into multiple Strength or Cardio "sessions". This is useful if you take a long break between different parts of your workout (e.g., morning strength, afternoon cardio) or if you want to group exercises logically.</p>
            </div>
        </DialogContent>
    </Dialog>
    </div>
  );
}
