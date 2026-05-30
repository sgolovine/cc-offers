import { liveQuery } from "dexie";
import { useEffect, useRef, useState } from "react";

import {
  getCreditCardOffersDb,
  type CreditCardOffersDb,
} from "../db/credit-card-offers-db";

export interface DexieQueryState<TData> {
  data: TData | undefined;
  error: Error | undefined;
  isLoading: boolean;
}

export function useDexieQuery<TData>(
  query: (db: CreditCardOffersDb) => Promise<TData> | TData,
  deps: readonly unknown[] = [],
): DexieQueryState<TData> {
  const queryRef = useRef(query);
  const [state, setState] = useState<DexieQueryState<TData>>({
    data: undefined,
    error: undefined,
    isLoading: true,
  });

  queryRef.current = query;

  useEffect(() => {
    let isCurrent = true;

    setState((currentState) => ({
      data: currentState.data,
      error: undefined,
      isLoading: true,
    }));

    const subscription = liveQuery(() =>
      queryRef.current(getCreditCardOffersDb()),
    ).subscribe({
      next(data) {
        if (!isCurrent) {
          return;
        }

        setState({
          data,
          error: undefined,
          isLoading: false,
        });
      },
      error(error: unknown) {
        if (!isCurrent) {
          return;
        }

        setState({
          data: undefined,
          error: error instanceof Error ? error : new Error(String(error)),
          isLoading: false,
        });
      },
    });

    return () => {
      isCurrent = false;
      subscription.unsubscribe();
    };
  }, deps);

  return state;
}
