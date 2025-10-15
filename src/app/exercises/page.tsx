
import { List } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { ExerciseManager } from "@/components/exercises/ExerciseManager";

export default function ExercisesPage() {
  return (
    <AuthGuard>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <List className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline">
            Manage Exercises
          </h1>
        </div>
        <ExerciseManager />
      </div>
    </AuthGuard>
  );
}
