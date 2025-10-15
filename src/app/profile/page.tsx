
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Ruler, Moon, Sun, Palette, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/context/SettingsContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Palette as PaletteType } from "@/context/SettingsContext";
import { useUser } from "@/firebase";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EditProfileForm } from "@/components/auth/EditProfileForm";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";

export default function ProfilePage() {
  const { weightUnit, setWeightUnit, distanceUnit, setDistanceUnit, theme, setTheme, palette, setPalette, isLoading } = useSettings();
  const { user, isUserLoading } = useUser();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  const isLoadingProfile = isLoading || isUserLoading;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <User className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold font-headline">
          User Profile
        </h1>
      </div>

      <Card>
        <CardHeader>
          {isLoadingProfile ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} data-ai-hint="profile picture" />
                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.displayName || 'User'}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </CardDescription>
              </div>
            </div>
          ) : (
            <CardTitle>No user logged in</CardTitle>
          )}
        </CardHeader>
        <CardContent className="flex items-center gap-2">
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isLoadingProfile || !user}>Edit Profile</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                            Update your account information.
                        </DialogDescription>
                    </DialogHeader>
                    <EditProfileForm user={user} onFinished={() => setIsEditDialogOpen(false)} />
                </DialogContent>
            </Dialog>
            <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isLoadingProfile || !user}>Change Password</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                            Enter your current password and a new password.
                        </DialogDescription>
                    </DialogHeader>
                    <ChangePasswordForm user={user} onFinished={() => setIsChangePasswordOpen(false)} />
                </DialogContent>
            </Dialog>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Units of Measure
            </CardTitle>
            <CardDescription>Choose your preferred units for weight and distance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {isLoading ? (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            ) : (
                <>
                    <div className="space-y-2">
                        <Label>Weight</Label>
                        <RadioGroup
                            value={weightUnit}
                            onValueChange={(value) => setWeightUnit(value as 'kg' | 'lbs')}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="kg" id="kg" />
                                <Label htmlFor="kg" className="font-normal">Kilograms (kg)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="lbs" id="lbs" />
                                <Label htmlFor="lbs" className="font-normal">Pounds (lbs)</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <div className="space-y-2">
                        <Label>Distance</Label>
                        <RadioGroup
                            value={distanceUnit}
                            onValueChange={(value) => setDistanceUnit(value as 'km' | 'mi')}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="km" id="km" />
                                <Label htmlFor="km" className="font-normal">Kilometers (km)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="mi" id="mi" />
                                <Label htmlFor="mi" className="font-normal">Miles (mi)</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </>
            )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
             <div className="space-y-2">
                <Label>Theme</Label>
                 <Select value={palette} onValueChange={(value) => setPalette(value as PaletteType)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="miami-vice">Miami Vice</SelectItem>
                    </SelectContent>
                </Select>
            </div>
           <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
                <Label htmlFor="dark-mode-switch" className="font-medium flex items-center gap-2">
                    {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">Toggle between light and dark themes.</p>
            </div>
            <Switch 
                id="dark-mode-switch"
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
             />
          </div>
        </CardContent>
      </Card>

       <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <p className="text-sm text-muted-foreground">These actions are permanent and cannot be undone.</p>
           <Button variant="destructive">Delete Account</Button>
        </CardContent>
      </Card>

    </div>
  );
}
