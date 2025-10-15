
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

type WeightUnit = 'kg' | 'lbs';
type DistanceUnit = 'km' | 'mi';
type Theme = 'light' | 'dark';
export type Palette = 'default' | 'miami-vice';

interface SettingsContextType {
  weightUnit: WeightUnit;
  setWeightUnit: (unit: WeightUnit) => void;
  distanceUnit: DistanceUnit;
  setDistanceUnit: (unit: DistanceUnit) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  palette: Palette;
  setPalette: (palette: Palette) => void;
  displayWeight: (value: number) => string;
  displayDistance: (value: number) => string;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { storedValue: weightUnit, setValue: setWeightUnit, isLoading: isLoadingWeight } = useLocalStorage<WeightUnit>('weightUnit', 'kg');
  const { storedValue: distanceUnit, setValue: setDistanceUnit, isLoading: isLoadingDistance } = useLocalStorage<DistanceUnit>('distanceUnit', 'km');
  const { storedValue: theme, setValue: setTheme, isLoading: isLoadingTheme } = useLocalStorage<Theme>('theme', 'dark');
  const { storedValue: palette, setValue: setPalette, isLoading: isLoadingPalette } = useLocalStorage<Palette>('palette', 'default');


  const isLoading = isLoadingWeight || isLoadingDistance || isLoadingTheme || isLoadingPalette;

  const displayWeight = useCallback((value: number) => {
    return value.toString();
  }, []);
  
  const displayDistance = useCallback((value: number) => {
    return value.toString();
  }, []);


  return (
    <SettingsContext.Provider value={{ 
        weightUnit, 
        setWeightUnit, 
        distanceUnit, 
        setDistanceUnit,
        theme,
        setTheme,
        palette,
        setPalette,
        displayWeight,
        displayDistance,
        isLoading,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
