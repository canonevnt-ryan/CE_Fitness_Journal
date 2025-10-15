
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import type { Exercise } from '@/lib/data/types';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Exercise name is required.' }),
  type: z.enum(['strength', 'cardio'], {
    required_error: 'You need to select an exercise type.',
  }),
});

type ExerciseFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (exercise: Omit<Exercise, 'id'> | Exercise) => void;
  exerciseToEdit?: Exercise | null;
};

export function ExerciseForm({
  isOpen,
  setIsOpen,
  onSave,
  exerciseToEdit,
}: ExerciseFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: exerciseToEdit
      ? { name: exerciseToEdit.name, type: exerciseToEdit.type }
      : { name: '', type: 'strength' },
  });

  // If exerciseToEdit changes, reset the form
  React.useEffect(() => {
    if (exerciseToEdit) {
      form.reset({ name: exerciseToEdit.name, type: exerciseToEdit.type });
    } else {
      form.reset({ name: '', type: 'strength' });
    }
  }, [exerciseToEdit, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (exerciseToEdit) {
      onSave({ ...exerciseToEdit, ...values });
    } else {
      onSave(values);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {exerciseToEdit ? 'Edit Exercise' : 'Add New Exercise'}
          </DialogTitle>
          <DialogDescription>
            {exerciseToEdit
              ? 'Update the details for this exercise.'
              : 'Add a new exercise to your personal list.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exercise Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Bench Press" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Exercise Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="strength" />
                        </FormControl>
                        <FormLabel className="font-normal">Strength</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="cardio" />
                        </FormControl>
                        <FormLabel className="font-normal">Cardio</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">
                {exerciseToEdit ? 'Save Changes' : 'Add Exercise'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
