
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import type { Exercise, PersonalBest, Workout, Metcon } from '@/lib/data/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, writeBatch, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { exercises as standardExercises, metcons as standardMetcons } from '@/lib/data/data';


export function useExercises() {
    const { user } = useUser();
    const firestore = useFirestore();

    const exercisesCollection = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `users/${user.uid}/exercises`);
    }, [user, firestore]);

    const { data: exercises, isLoading } = useCollection<Exercise>(exercisesCollection);

    const addExercise = useCallback((exercise: Omit<Exercise, 'id'>) => {
        if (!exercisesCollection) return;
        addDoc(exercisesCollection, exercise)
            .catch(error => {
                 errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: exercisesCollection.path,
                        operation: 'create',
                        requestResourceData: exercise,
                    })
                )
            });
    }, [exercisesCollection]);

    const updateExercise = useCallback((updatedExercise: Exercise) => {
         if (!user || !firestore) return;
        const exerciseRef = doc(firestore, `users/${user.uid}/exercises`, updatedExercise.id);
        updateDoc(exerciseRef, { ...updatedExercise })
             .catch(error => {
                 errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: exerciseRef.path,
                        operation: 'update',
                        requestResourceData: updatedExercise,
                    })
                )
            });
    }, [user, firestore]);

    const deleteExercise = useCallback((id: string) => {
        if (!user || !firestore) return;
        const exerciseRef = doc(firestore, `users/${user.uid}/exercises`, id);
        deleteDoc(exerciseRef)
            .catch(error => {
                 errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: exerciseRef.path,
                        operation: 'delete',
                    })
                )
            });
    }, [user, firestore]);

    return { exercises: exercises || [], addExercise, updateExercise, deleteExercise, isLoading };
}

export function useMetcons() {
    const { user } = useUser();
    const firestore = useFirestore();

     const metconsCollection = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `users/${user.uid}/metcons`);
    }, [user, firestore]);

    const { data: metcons, isLoading } = useCollection<Metcon>(metconsCollection);


    const addMetcon = useCallback((metcon: Omit<Metcon, 'id'>) => {
        if (!metconsCollection) return;
        addDoc(metconsCollection, metcon)
            .catch(error => {
                errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: metconsCollection.path,
                        operation: 'create',
                        requestResourceData: metcon,
                    })
                )
            });
    }, [metconsCollection]);

    const updateMetcon = useCallback((updatedMetcon: Metcon) => {
        if (!user || !firestore) return;
        const metconRef = doc(firestore, `users/${user.uid}/metcons`, updatedMetcon.id);
        updateDoc(metconRef, { ...updatedMetcon })
            .catch(error => {
                errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: metconRef.path,
                        operation: 'update',
                        requestResourceData: updatedMetcon,
                    })
                )
            });
    }, [user, firestore]);

    const deleteMetcon = useCallback((id: string) => {
       if (!user || !firestore) return;
        const metconRef = doc(firestore, `users/${user.uid}/metcons`, id);
        deleteDoc(metconRef)
            .catch(error => {
                errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: metconRef.path,
                        operation: 'delete',
                    })
                )
            });
    }, [user, firestore]);

    return { metcons: metcons || [], addMetcon, updateMetcon, deleteMetcon, isLoading };
}

export function useWorkouts() {
    const { user } = useUser();
    const firestore = useFirestore();

    const workoutsCollection = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, `users/${user.uid}/workouts`);
    }, [user, firestore]);
    
    const { data: workouts, isLoading } = useCollection<Workout>(workoutsCollection);

    const sortedWorkouts = useMemo(() => {
        if (!workouts) return [];
        return workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [workouts]);
    
    const getWorkoutById = useCallback((id: string) => {
        return workouts?.find(w => w.id === id);
    }, [workouts]);
    
    const addWorkout = useCallback((workout: Omit<Workout, 'id'>) => {
        if (!workoutsCollection) return;
        const formattedDate = workout.date instanceof Date ? format(workout.date, "yyyy-MM-dd") : workout.date;
        const newWorkout = { ...workout, date: formattedDate };
        addDoc(workoutsCollection, newWorkout)
            .catch(error => {
                errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: workoutsCollection.path,
                        operation: 'create',
                        requestResourceData: newWorkout,
                    })
                )
            });
    }, [workoutsCollection]);

    const updateWorkout = useCallback((id: string, workout: Omit<Workout, 'id'>) => {
        if (!user || !firestore) return;
        const workoutRef = doc(firestore, `users/${user.uid}/workouts`, id);
        const formattedDate = workout.date instanceof Date ? format(workout.date, "yyyy-MM-dd") : workout.date;
        const updatedWorkout = { ...workout, date: formattedDate };
        updateDoc(workoutRef, updatedWorkout)
            .catch(error => {
                errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: workoutRef.path,
                        operation: 'update',
                        requestResourceData: updatedWorkout,
                    })
                )
            });
    }, [user, firestore]);

    const deleteWorkout = useCallback((id: string) => {
        if (!user || !firestore) return;
        const workoutRef = doc(firestore, `users/${user.uid}/workouts`, id);
        deleteDoc(workoutRef)
            .catch(error => {
                errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: workoutRef.path,
                        operation: 'delete',
                    })
                )
            });
    }, [user, firestore]);

    return { workouts: sortedWorkouts, getWorkoutById, addWorkout, updateWorkout, deleteWorkout, isLoading };
}


export function usePersonalBests() {
    const { workouts, isLoading: isLoadingWorkouts } = useWorkouts();
    
    const bests = useMemo(() => {
        const calculatedBests: Record<string, PersonalBest> = {};
        if (!workouts) return [];

        workouts.forEach(workout => {
            if (workout.type === 'traditional') {
                // Calculate strength PBs (heaviest weight for any rep count)
                workout.strength?.forEach(sLog => {
                    const bestSet = sLog.sets.reduce((best, current) => (current.weight > best.weight ? current : best), { weight: 0, reps: 0, id: '' });
                    if (bestSet.weight > 0) {
                        const key = `strength-${sLog.exerciseName}`;
                        const existingBest = calculatedBests[key];
                        if (!existingBest || bestSet.weight > existingBest.best.weight) {
                            calculatedBests[key] = {
                                name: sLog.exerciseName,
                                type: 'strength',
                                date: workout.date,
                                best: { weight: bestSet.weight, reps: bestSet.reps },
                            };
                        }
                    }
                });

                 // Calculate cardio PBs (fastest time for a given distance)
                workout.cardio?.forEach(cLog => {
                    if (cLog.distance && cLog.distance > 0 && cLog.duration > 0) {
                        const key = `cardio-${cLog.exerciseName}-${cLog.distance}km`;
                        const existingBest = calculatedBests[key];

                        if (!existingBest || cLog.duration < existingBest.best.time) {
                             calculatedBests[key] = {
                                name: `${cLog.exerciseName} (${cLog.distance} km)`,
                                type: 'cardio',
                                date: workout.date,
                                best: { time: cLog.duration, distance: cLog.distance }
                            };
                        }
                    }
                });

            } else if (workout.type === 'metcon') {
                const key = `metcon-${workout.workoutName}`;
                const existingBest = calculatedBests[key];

                if (!existingBest) {
                    calculatedBests[key] = {
                        name: workout.workoutName,
                        type: 'metcon',
                        date: workout.date,
                        best: { value: workout.score.value, type: workout.score.type }
                    };
                } else {
                    const isNewBest = (workout.score.type === 'time' && workout.score.value < existingBest.best.value) ||
                                      (workout.score.type !== 'time' && parseFloat(workout.score.value) > parseFloat(existingBest.best.value));
                    
                    if (isNewBest) {
                         calculatedBests[key] = {
                            name: workout.workoutName,
                            type: 'metcon',
                            date: workout.date,
                            best: { value: workout.score.value, type: workout.score.type }
                        };
                    }
                }
            }
        });

        return Object.values(calculatedBests).sort((a,b) => a.name.localeCompare(b.name));
    }, [workouts]);

    return { bests, isLoading: isLoadingWorkouts };
}

export const seedInitialData = async (firestore: Firestore, userId: string) => {
    try {
        const batch = writeBatch(firestore);

        // Seed Exercises
        const exercisesCollectionRef = collection(firestore, `users/${userId}/exercises`);
        standardExercises.forEach(exercise => {
            const docRef = doc(exercisesCollectionRef);
            // We can omit the 'id' field as Firestore will generate it.
            const { id, ...exerciseData } = exercise;
            batch.set(docRef, exerciseData);
        });

        // Seed Metcons
        const metconsCollectionRef = collection(firestore, `users/${userId}/metcons`);
        standardMetcons.forEach(metcon => {
            const docRef = doc(metconsCollectionRef);
            const { id, ...metconData } = metcon;
            batch.set(docRef, metconData);
        });

        await batch.commit();
        console.log("Initial data seeded successfully for user:", userId);
    } catch (error) {
        console.error("Error seeding initial data:", error);
        // Optionally, re-throw or handle the error as needed.
        // For example, you could emit a global error event.
    }
};
