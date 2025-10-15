
'use client';

import { useState, useEffect, useCallback } from 'react';

const isServer = typeof window === 'undefined';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isServer) {
        setIsLoading(false);
        return;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      } else {
        window.localStorage.setItem(key, JSON.stringify(initialValue));
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.error(error);
      setStoredValue(initialValue);
    } finally {
        setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);


  const setValue = useCallback((value: T | ((val: T) => T)) => {
    if (isServer) {
        return;
    }
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return { storedValue, setValue, isLoading };
}
