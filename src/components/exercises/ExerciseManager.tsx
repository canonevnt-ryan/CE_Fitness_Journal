
'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal, PlusCircle, ArrowUp, ArrowDown } from 'lucide-react';
import type { Exercise } from '@/lib/data/types';
import { useExercises } from '@/hooks/use-local-data';
import { useToast } from '@/hooks/use-toast';
import { ExerciseForm } from './ExerciseForm';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

type SortKey = keyof Exercise;

export function ExerciseManager() {
  const { exercises, addExercise, updateExercise, deleteExercise, isLoading } = useExercises();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);
  const [exerciseToDelete, setExerciseToDelete] = useState<string | null>(null);
  
  const [filter, setFilter] = useState<'all' | 'strength' | 'cardio'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });


  const filteredAndSortedExercises = useMemo(() => {
    let sortableItems = [...exercises];

    if (filter !== 'all') {
      sortableItems = sortableItems.filter(exercise => exercise.type === filter);
    }
    
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableItems;
  }, [exercises, filter, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };


  const handleAddClick = () => {
    setExerciseToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (exercise: Exercise) => {
    setExerciseToEdit(exercise);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setExerciseToDelete(id);
    setIsAlertOpen(true);
  };

  const handleSaveExercise = (exercise: Omit<Exercise, 'id'> | Exercise) => {
    try {
      if ('id' in exercise) {
        updateExercise(exercise);
        toast({ title: 'Exercise updated successfully' });
      } else {
        addExercise(exercise);
        toast({ title: 'Exercise added successfully' });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error saving exercise',
        description: error.message,
      });
    }
  };

  const confirmDelete = () => {
    if (exerciseToDelete) {
      try {
        deleteExercise(exerciseToDelete);
        toast({ title: 'Exercise deleted successfully' });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error deleting exercise',
          description: error.message,
        });
      }
    }
    setIsAlertOpen(false);
    setExerciseToDelete(null);
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
                <Button variant={filter === 'all' ? 'secondary' : 'outline'} size="sm" onClick={() => setFilter('all')}>All</Button>
                <Button variant={filter === 'strength' ? 'secondary' : 'outline'} size="sm" onClick={() => setFilter('strength')}>Strength</Button>
                <Button variant={filter === 'cardio' ? 'secondary' : 'outline'} size="sm" onClick={() => setFilter('cardio')}>Cardio</Button>
            </div>
            <Button onClick={handleAddClick}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Exercise
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                     <Button variant="ghost" onClick={() => requestSort('name')} className="px-0">
                        Name {getSortIcon('name')}
                     </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => requestSort('type')} className="px-0">
                        Type {getSortIcon('type')}
                     </Button>
                  </TableHead>
                  <TableHead className="text-right w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <>
                    <TableRow>
                      <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-5 ml-auto" /></TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-1/3" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-5 ml-auto" /></TableCell>
                    </TableRow>
                  </>
                ) : filteredAndSortedExercises.map((exercise) => (
                  <TableRow key={exercise.id}>
                    <TableCell className="font-medium">{exercise.name}</TableCell>
                    <TableCell className="capitalize">{exercise.type}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(exercise)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(exercise.id)}
                            className="text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
             {!isLoading && filteredAndSortedExercises.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    No exercises match the current filter.
                </div>
             )}
          </div>
        </CardContent>
      </Card>
      
      <ExerciseForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSave={handleSaveExercise}
        exerciseToEdit={exerciseToEdit}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              exercise from your list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
