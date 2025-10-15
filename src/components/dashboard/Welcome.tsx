
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, PlusSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Helper to set a cookie
const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

export default function Welcome() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This check is to prevent flash of content
    const visited = document.cookie.includes('visited=true');
    if (visited) {
      router.refresh();
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleNavigation = (path: string) => {
    setCookie('visited', 'true', 7); // Set a cookie for 7 days
    router.push(path);
  };
  
  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <h1 className="text-3xl font-bold font-headline mb-2 text-foreground">What would you like to do?</h1>
          <p className="text-muted-foreground mb-8">Choose one of the options to continue.</p>
          <div className="flex flex-col space-y-4">
            <Button
              size="lg"
              className="w-full justify-start text-left py-8"
              onClick={() => handleNavigation('/log-workout')}
            >
              <PlusSquare className="mr-4 h-6 w-6" />
              <div className="flex flex-col">
                <span className="font-semibold text-lg">Log New Workout</span>
                <span className="font-normal text-sm text-primary-foreground/80">Enter your sets, reps, and more.</span>
              </div>
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="w-full justify-start text-left py-8"
              onClick={() => handleNavigation('/journal')}
            >
              <BookOpen className="mr-4 h-6 w-6" />
               <div className="flex flex-col">
                <span className="font-semibold text-lg">View Workout Journal</span>
                <span className="font-normal text-sm text-secondary-foreground/80">Review your past workouts.</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
