
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAuth } from '@/firebase';
import { FirebaseError } from 'firebase/app';
import { type User, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required.' }),
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters.' }),
});

type ChangePasswordFormProps = {
  user: User | null;
  onFinished: () => void;
};

export function ChangePasswordForm({ user, onFinished }: ChangePasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      setAuthError("User not found. Please log in again.");
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      // Re-authenticate the user with their current password
      const credential = EmailAuthProvider.credential(user.email!, values.currentPassword);
      await reauthenticateWithCredential(user, credential);

      // If re-authentication is successful, update the password
      await updatePassword(user, values.newPassword);
      
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });
      onFinished();

    } catch (error) {
        const firebaseError = error as FirebaseError;
        if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
            setAuthError('Incorrect current password. Please try again.');
        } else {
            setAuthError('An error occurred. Please try again later.');
            console.error(error);
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {authError && <p className="text-sm font-medium text-destructive">{authError}</p>}
        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onFinished} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Change Password'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
