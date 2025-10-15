
'use client';

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePersonalBests } from "@/hooks/use-local-data";
import { Trophy, Search, Dumbbell, Heart, Timer } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PersonalBest } from "@/lib/data/types";
import { useSettings } from "@/context/SettingsContext";

export default function PersonalBestsPage() {
  const { bests, isLoading: isLoadingBests } = usePersonalBests();
  const { weightUnit, distanceUnit, isLoading: isLoadingSettings } = useSettings();
  const isLoading = isLoadingBests || isLoadingSettings;
  
  const [filter, setFilter] = useState<'all' | 'strength' | 'cardio' | 'metcon'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBests = useMemo(() => {
    return bests
      .filter((pb) => {
        if (filter === 'all') return true;
        return pb.type === filter;
      })
      .filter((pb) => {
        return pb.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [bests, filter, searchTerm]);

  const renderBest = (pb: PersonalBest) => {
    switch (pb.type) {
      case 'strength':
        return `${pb.best.weight} ${weightUnit} × ${pb.best.reps}`;
      case 'cardio':
        if ('distance' in pb.best) {
          return `${pb.best.distance} ${distanceUnit} in ${pb.best.time}m`;
        }
        return `${pb.best.value} in ${pb.best.unit}`;
      case 'metcon':
        return pb.best.value;
      default:
        return `${pb.best.value} ${pb.best.unit}`;
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Trophy className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold font-headline">
          Personal Bests
        </h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Records</CardTitle>
          <CardDescription>A list of your best performances, automatically updated from your workout journal.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search records..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant={filter === 'all' ? 'secondary' : 'outline'} onClick={() => setFilter('all')}>All</Button>
                    <Button variant={filter === 'strength' ? 'secondary' : 'outline'} onClick={() => setFilter('strength')}>
                        <Dumbbell className="mr-2 h-4 w-4" />Strength
                    </Button>
                    <Button variant={filter === 'cardio' ? 'secondary' : 'outline'} onClick={() => setFilter('cardio')}>
                        <Heart className="mr-2 h-4 w-4" />Cardio
                    </Button>
                    <Button variant={filter === 'metcon' ? 'secondary' : 'outline'} onClick={() => setFilter('metcon')}>
                         <Timer className="mr-2 h-4 w-4" />Metcon
                    </Button>
                </div>
            </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Record</TableHead>
                <TableHead>Personal Best</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Date Achieved</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <>
                  <TableRow>
                    <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                     <TableCell><Skeleton className="h-5 w-1/4" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-1/3 ml-auto" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-1/3" /></TableCell>
                     <TableCell><Skeleton className="h-5 w-1/4" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-1/4 ml-auto" /></TableCell>
                  </TableRow>
                </>
              )}
              {!isLoading && filteredBests.length > 0 && filteredBests.map((pb) => (
                <TableRow key={`${pb.name}-${pb.type}`}>
                  <TableCell className="font-medium">{pb.name}</TableCell>
                  <TableCell className="font-semibold text-primary">{renderBest(pb)}</TableCell>
                  <TableCell className="capitalize text-muted-foreground">{pb.type}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{format(parseISO(pb.date), "MMM d, yyyy")}</TableCell>
                </TableRow>
              ))}
               {!isLoading && filteredBests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No personal bests recorded for this filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
