
import { Timer } from "lucide-react";
import AuthGuard from "@/components/auth/AuthGuard";
import { MetconManager } from "@/components/metcons/MetconManager";

export default function MetconsPage() {
  return (
    <AuthGuard>
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Timer className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline">
            Manage Metcons
          </h1>
        </div>
        <MetconManager />
      </div>
    </AuthGuard>
  );
}
