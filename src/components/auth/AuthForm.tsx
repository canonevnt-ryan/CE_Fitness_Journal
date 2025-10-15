
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { seedInitialData } from '@/hooks/use-local-data';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const signupSchema = z.object({
    displayName: z.string().min(1, { message: 'Display name is required.' }),
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const forgotPasswordSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email.' }),
});

type AuthMode = 'login' | 'signup' | 'forgotPassword';


export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();

  const currentSchema = mode === 'login' ? loginSchema : mode === 'signup' ? signupSchema : forgotPasswordSchema;

  const form = useForm<z.infer<typeof currentSchema>>({
    // @ts-ignore
    resolver: zodResolver(currentSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
  });

  const handleAuthError = (error: FirebaseError) => {
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        setAuthError('Invalid email or password. Please try again.');
        break;
      case 'auth/email-already-in-use':
        setAuthError('This email address is already in use by another account.');
        break;
      default:
        setAuthError('An unexpected error occurred. Please try again.');
        break;
    }
    setIsLoading(false);
  };

  const handleAuthSuccess = () => {
    setAuthError(null);
    setIsLoading(false);
    // Navigation is handled by the useUser hook on auth state change
  };


  const onSubmit = (values: z.infer<typeof currentSchema>) => {
    setIsLoading(true);
    setAuthError(null);
    if (!auth || !firestore) return;

    if (mode === 'login') {
      const { email, password } = values as z.infer<typeof loginSchema>;
      signInWithEmailAndPassword(auth, email, password)
        .then(handleAuthSuccess)
        .catch(handleAuthError);
    } else if (mode === 'signup') {
      const { email, password, displayName } = values as z.infer<typeof signupSchema>;
      createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            if (userCredential.user) {
                await updateProfile(userCredential.user, { displayName });
                // Seed initial data for new user
                await seedInitialData(firestore, userCredential.user.uid);
            }
        })
        .then(handleAuthSuccess)
        .catch(handleAuthError);
    } else if (mode === 'forgotPassword') {
        const { email } = values as z.infer<typeof forgotPasswordSchema>;
        sendPasswordResetEmail(auth, email)
            .then(() => {
                setIsLoading(false);
                setMode('login');
                toast({
                    title: "Password Reset Email Sent",
                    description: `If an account exists for ${email}, a password reset link has been sent.`,
                });
            })
            .catch((error) => {
                setIsLoading(false);
                setAuthError("Failed to send reset email. Please check the address and try again.");
            });
    }
  };

  const toggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    setAuthError(null);
    form.reset();
  }

  const renderContent = () => {
    switch (mode) {
        case 'forgotPassword':
            return {
                title: 'Reset Password',
                description: "Enter your email to receive a password reset link.",
                buttonText: 'Send Reset Link',
                fields: (
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
                ),
                footer: (
                    <div className="mt-4 text-center text-sm">
                        Remember your password?
                        <Button variant="link" onClick={() => toggleMode('login')} className="pl-1">
                            Log in
                        </Button>
                    </div>
                )
            }
        case 'signup':
             return {
                title: 'Create an Account',
                description: "Get started with tracking your workouts.",
                buttonText: 'Sign Up',
                fields: (
                    <>
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
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                ),
                footer: (
                     <div className="mt-4 text-center text-sm">
                        Already have an account?
                        <Button variant="link" onClick={() => toggleMode('login')} className="pl-1">
                            Log in
                        </Button>
                    </div>
                )
            }
        case 'login':
        default:
             return {
                title: 'Welcome Back!',
                description: 'Sign in to continue your fitness journey.',
                buttonText: 'Log In',
                fields: (
                     <>
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
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="••••••" {...field} />
                                </FormControl>
                                 <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                ),
                footer: (
                    <>
                        <div className="mt-4 text-center text-sm">
                            <Button variant="link" size="sm" onClick={() => toggleMode('forgotPassword')} className="px-0">
                                Forgot Password?
                            </Button>
                        </div>
                        <div className="mt-1 text-center text-sm">
                            Don't have an account?
                            <Button variant="link" onClick={() => toggleMode('signup')} className="pl-1">
                                Sign up
                            </Button>
                        </div>
                    </>
                )
            }
    }
  }
  
  const { title, description, buttonText, fields, footer } = renderContent();

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-4">
            <Dumbbell className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-headline">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {fields}
             {authError && <p className="text-sm font-medium text-destructive">{authError}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Processing...' : buttonText}
            </Button>
          </form>
        </Form>
        {footer}
      </CardContent>
    </Card>
  );
}
