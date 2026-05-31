import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

function readLocalStorageValue<T>(key: string, initialValue: T): T {
  if (typeof window === "undefined") {
    return initialValue;
  }

  try {
    const storedValue = window.localStorage.getItem(key);

    return storedValue === null ? initialValue : (JSON.parse(storedValue) as T);
  } catch {
    return initialValue;
  }
}

export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() =>
    readLocalStorageValue(key, initialValue),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore localStorage failures so table controls still work in-memory.
    }
  }, [key, value]);

  return [value, setValue];
}
