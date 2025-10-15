
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
  FormDescription,
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
import type { Metcon } from '@/lib/data/types';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Metcon name is required.' }),
  type: z.enum(['For Time', 'AMRAP', 'EMOM', 'Other'], {
    required_error: 'You need to select a metcon type.',
  }),
  description: z.string().min(1, 'Please provide workout details.'),
  timeCap: z.coerce.number().positive().optional(),
});

type MetconFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (metcon: Omit<Metcon, 'id'> | Metcon) => void;
  metconToEdit?: Metcon | null;
};

export function MetconForm({
  isOpen,
  setIsOpen,
  onSave,
  metconToEdit,
}: MetconFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: metconToEdit
      ? {
          name: metconToEdit.name,
          type: metconToEdit.type,
          description: metconToEdit.description,
          timeCap: metconToEdit.timeCap,
        }
      : {
          name: '',
          type: 'For Time',
          description: '',
          timeCap: undefined,
        },
  });

  // If metconToEdit changes, reset the form
  React.useEffect(() => {
    if (metconToEdit) {
      form.reset({
        name: metconToEdit.name,
        type: metconToEdit.type,
        description: metconToEdit.description,
        timeCap: metconToEdit.timeCap,
      });
    } else {
      form.reset({
        name: '',
        type: 'For Time',
        description: '',
        timeCap: undefined,
      });
    }
  }, [metconToEdit, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (metconToEdit) {
      onSave({ ...metconToEdit, ...values });
    } else {
      onSave(values);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {metconToEdit ? 'Edit Metcon' : 'Add New Metcon'}
          </DialogTitle>
          <DialogDescription>
            {metconToEdit
              ? 'Update the details for this metcon.'
              : 'Add a new metcon to your personal list.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metcon Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Murph" {...field} />
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
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="For Time" />
                        </FormControl>
                        <FormLabel className="font-normal">For Time</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="AMRAP" />
                        </FormControl>
                        <FormLabel className="font-normal">AMRAP</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="EMOM" />
                        </FormControl>
                        <FormLabel className="font-normal">EMOM</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Other" />
                        </FormControl>
                        <FormLabel className="font-normal">Other</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 21-15-9 reps of Thrusters and Pull-ups"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the movements, rep schemes, and weights.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="timeCap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Cap (Optional)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 20" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                  </FormControl>
                   <FormDescription>
                    Enter the time limit in minutes.
                   </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4 sticky bottom-0 bg-background">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">
                {metconToEdit ? 'Save Changes' : 'Add Metcon'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
