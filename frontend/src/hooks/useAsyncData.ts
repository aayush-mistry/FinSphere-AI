"use client";

import { useEffect, useState } from "react";

type AsyncState<T> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
};

export function useAsyncData<T>(load: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function run() {
      setState((current) => ({ ...current, error: null, isLoading: true }));

      try {
        const data = await load();
        if (isMounted) {
          setState({ data, error: null, isLoading: false });
        }
      } catch (error: unknown) {
        if (isMounted) {
          setState({
            data: null,
            error: error instanceof Error ? error.message : "Something went wrong.",
            isLoading: false,
          });
        }
      }
    }

    void run();

    return () => {
      isMounted = false;
    };
  }, [load]);

  return state;
}
