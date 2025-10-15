
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
import { type User, EmailAuthProvider, reauthenticateWithCredential, updateEmail, updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  displayName: z.string().min(1, { message: 'Display name cannot be empty.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required to confirm changes.' }),
});

type EditProfileFormProps = {
  user: User | null;
  onFinished: () => void;
};

export function EditProfileForm({ user, onFinished }: EditProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const auth = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      email: user?.email || '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !auth) {
      setAuthError("User not found. Please log in again.");
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      const credential = EmailAuthProvider.credential(user.email!, values.password);
      await reauthenticateWithCredential(user, credential);
    } catch (error) {
      const firebaseError = error as FirebaseError;
      if (firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/invalid-credential') {
        setAuthError('Incorrect password. Please try again.');
      } else {
        setAuthError('Re-authentication failed. Please try again later.');
      }
      setIsLoading(false);
      return;
    }
    
    try {
      const promises = [];
      if (values.displayName !== user.displayName) {
        promises.push(updateProfile(user, { displayName: values.displayName }));
      }
      if (values.email !== user.email) {
        promises.push(updateEmail(user, values.email));
      }

      await Promise.all(promises);
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
      onFinished();
    } catch (error) {
        const firebaseError = error as FirebaseError;
        if (firebaseError.code === 'auth/email-already-in-use') {
            setAuthError('This email is already in use by another account.');
        } else {
            setAuthError('An error occurred while updating your profile.');
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
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
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
        {authError && <p className="text-sm font-medium text-destructive">{authError}</p>}
        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onFinished} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
