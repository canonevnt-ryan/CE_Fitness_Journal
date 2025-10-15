'use client';

import { useUser } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isUserLoading) return; // Wait for user status to be resolved

    const hasVisited = document.cookie.includes('visited=true');

    if (user) {
      if (pathname === '/login') {
        router.push('/');
      } else if (pathname === '/' && !hasVisited) {
        // Stay on home to show welcome
      } else if (pathname !== '/' && hasVisited && !pathname.startsWith('/_next')) {
        // Allow navigation to other pages if visited
      }
    } else if (pathname !== '/login') {
      router.push('/login');
    }
  }, [user, isUserLoading, router, pathname]);

  // Show a loading skeleton if we are still checking for a user,
  // but not on the login page itself or the initial welcome screen.
  const showSkeleton = (isUserLoading || !user) && pathname !== '/login';

  if (showSkeleton) {
    return (
       <div className="space-y-12">
        <Skeleton className="h-[148px] w-full" />
        <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-36" />
                <Skeleton className="h-36" />
                <Skeleton className="h-36" />
                <Skeleton className="h-36" />
            </div>
        </div>
         <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="space-y-4">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
            </div>
        </div>
       </div>
    );
  }
  
  // If the user is logged in, or they are on the login page, show the content.
  if (user || pathname === '/login') {
    return <>{children}</>;
  }

  // Fallback for edge cases, though useEffect should handle redirects.
  return null;
}
