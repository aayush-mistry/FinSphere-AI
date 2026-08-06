import { useState, useEffect } from 'react';
import { getFinancialContext, ContextOptions } from '../engine';
import { FinancialContext } from '../engine/types';

export function useFinancialContext(userId: string, options?: ContextOptions) {
  const [context, setContext] = useState<FinancialContext | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadContext() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getFinancialContext(userId, options);
        if (isMounted) {
          setContext(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load financial context'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadContext();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, options?.isBusinessMode]);

  return { context, isLoading, error };
}
