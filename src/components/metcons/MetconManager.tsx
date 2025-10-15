
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
import type { Metcon } from '@/lib/data/types';
import { useMetcons } from '@/hooks/use-local-data';
import { useToast } from '@/hooks/use-toast';
import { MetconForm } from './MetconForm';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';

type SortKey = keyof Metcon;

export function MetconManager() {
  const { metcons, addMetcon, updateMetcon, deleteMetcon, isLoading } = useMetcons();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [metconToEdit, setMetconToEdit] = useState<Metcon | null>(null);
  const [metconToDelete, setMetconToDelete] = useState<string | null>(null);
  
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });

  const sortedMetcons = useMemo(() => {
    let sortableItems = [...metcons];
    
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key;
        // Handle undefined for timeCap
        const aValue = a[key] === undefined ? Infinity : a[key];
        const bValue = b[key] === undefined ? Infinity : b[key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableItems;
  }, [metcons, sortConfig]);

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
    setMetconToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (metcon: Metcon) => {
    setMetconToEdit(metcon);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setMetconToDelete(id);
    setIsAlertOpen(true);
  };

  const handleSaveMetcon = (metcon: Omit<Metcon, 'id'> | Metcon) => {
    try {
      if ('id' in metcon) {
        updateMetcon(metcon);
        toast({ title: 'Metcon updated successfully' });
      } else {
        addMetcon(metcon);
        toast({ title: 'Metcon added successfully' });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error saving metcon',
        description: error.message,
      });
    }
  };

  const confirmDelete = () => {
    if (metconToDelete) {
      try {
        deleteMetcon(metconToDelete);
        toast({ title: 'Metcon deleted successfully' });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error deleting metcon',
          description: error.message,
        });
      }
    }
    setIsAlertOpen(false);
    setMetconToDelete(null);
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="p-4 flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
            <Button onClick={handleAddClick}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Metcon
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
                   <TableHead>
                     <Button variant="ghost" onClick={() => requestSort('timeCap')} className="px-0">
                        Time Cap {getSortIcon('timeCap')}
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
                       <TableCell><Skeleton className="h-5 w-1/3" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-5 ml-auto" /></TableCell>
                    </TableRow>
                     <TableRow>
                      <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                       <TableCell><Skeleton className="h-5 w-1/3" /></TableCell>
                       <TableCell><Skeleton className="h-5 w-1/4" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-5 ml-auto" /></TableCell>
                    </TableRow>
                  </>
                ) : sortedMetcons.map((metcon) => (
                  <TableRow key={metcon.id}>
                    <TableCell className="font-medium">{metcon.name}</TableCell>
                    <TableCell><Badge variant="secondary">{metcon.type}</Badge></TableCell>
                    <TableCell>{metcon.timeCap ? `${metcon.timeCap} mins` : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(metcon)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(metcon.id)}
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
             {!isLoading && sortedMetcons.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    No metcons found.
                </div>
             )}
          </div>
        </CardContent>
      </Card>
      
      <MetconForm
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSave={handleSaveMetcon}
        metconToEdit={metconToEdit}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              metcon from your list.
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
