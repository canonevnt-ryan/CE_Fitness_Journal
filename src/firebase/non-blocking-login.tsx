
'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth, successCallback: () => void, errorCallback: (error: FirebaseError) => void): void {
  signInAnonymously(authInstance)
    .then(successCallback)
    .catch(errorCallback);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, displayName: string, successCallback: () => void, errorCallback: (error: FirebaseError) => void): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then((userCredential) => {
        if (userCredential.user) {
            return updateProfile(userCredential.user, { displayName });
        }
    })
    .then(successCallback)
    .catch(errorCallback);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, successCallback: () => void, errorCallback: (error: FirebaseError) => void): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .then(successCallback)
    .catch(errorCallback);
}
