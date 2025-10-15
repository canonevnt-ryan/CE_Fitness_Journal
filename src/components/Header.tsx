
'use client';
import Link from 'next/link';
import { Dumbbell, Menu, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from './ui/button';
import { useAuth, useUser } from '@/firebase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from './ui/separator';
import { useState } from 'react';


const mainNavLinks = [
  { href: '/log-workout', label: 'Log Workout' },
  { href: '/journal', label: 'Workout Journal' },
  { href: '/bests', label: 'Personal Bests' },
];

const secondaryNavLinks = [
  { href: '/exercises', label: 'Exercises' },
  { href: '/metcons', label: 'Metcons' },
  { href: '/profile', label: 'Profile' },
];

const allNavLinks = [...mainNavLinks, ...secondaryNavLinks];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);


  const handleLogout = async () => {
    if (auth) {
      // Clear the 'visited' cookie on logout
      document.cookie = 'visited=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      await auth.signOut();
      router.push('/login');
    }
  };
  
  if (pathname === '/login') {
    return null; // Don't show header on login page
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center justify-center relative">
        <Link href="/journal" className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold font-headline">FitFlow</span>
        </Link>
        {!isUserLoading && user && (
          <>
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium absolute right-4">
              {allNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'transition-colors hover:text-primary',
                    pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {link.label}
                </Link>
              ))}
               <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <LogOut className="h-5 w-5 text-muted-foreground hover:text-primary" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                      <AlertDialogDescription>
                        You will be returned to the login screen.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleLogout}>Log Out</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </nav>
            <div className="md:hidden absolute right-4">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Menu</SheetTitle>
                    <SheetDescription>
                      Navigate through the application pages.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="p-4">
                  <Link href="/journal" className="flex items-center gap-2 mb-8" onClick={() => setIsSheetOpen(false)}>
                    <Dumbbell className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold font-headline">FitFlow</span>
                  </Link>
                    <div className="mb-4">
                        <h4 className="font-bold text-base text-foreground px-1">Athlete Activity</h4>
                    </div>
                    <nav className="flex flex-col space-y-4">
                      {mainNavLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsSheetOpen(false)}
                          className={cn(
                            'text-lg transition-colors hover:text-primary',
                            pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                          )}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                    <Separator className="my-4" />
                    <div className="mb-4">
                        <h4 className="font-bold text-base text-foreground px-1">Application Management</h4>
                    </div>
                     <nav className="flex flex-col space-y-4">
                      {secondaryNavLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setIsSheetOpen(false)}
                          className={cn(
                            'text-lg transition-colors hover:text-primary',
                            pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                          )}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                    <div className="mt-8 border-t pt-4">
                        <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="w-full">
                                <LogOut className="mr-2 h-4 w-4" />
                                Log Out
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                            <AlertDialogDescription>
                                You will be returned to the login screen.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => { setIsSheetOpen(false); handleLogout(); }}>Log Out</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
