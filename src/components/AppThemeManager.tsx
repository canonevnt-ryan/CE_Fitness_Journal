
'use client';

import { useEffect } from 'react';
import { useSettings } from '@/context/SettingsContext';

/**
 * This component is a client-side-only manager for applying theme-related classes.
 * It runs after the initial server render and client-side hydration,
 * safely manipulating the DOM to apply user's theme settings.
 */
export function AppThemeManager() {
  const { theme, palette, isLoading } = useSettings();

  useEffect(() => {
    if (isLoading) return;

    const root = document.documentElement; // <html> tag
    const body = document.body;

    // Apply theme and palette classes to the root <html> element
    // This controls the CSS variables for colors.
    root.className = ''; // Clear all previous classes
    root.classList.add(theme); // 'dark' or 'light'
    root.classList.add(`theme-${palette}`); // 'theme-default', 'theme-miami-vice', etc.

    // Apply the base background and text color to the <body> element.
    // This happens only on the client after settings are loaded, avoiding hydration mismatch.
    body.classList.add('bg-background', 'text-foreground');

  }, [theme, palette, isLoading]);

  // This component renders nothing to the DOM itself.
  return null;
}
