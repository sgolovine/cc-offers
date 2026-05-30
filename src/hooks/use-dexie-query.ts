import { liveQuery } from "dexie";
import { useEffect, useReducer, useRef } from "react";

import {
  getCreditCardOffersDb,
  type CreditCardOffersDb,
} from "../db/credit-card-offers-db";

export interface DexieQueryState<TData> {
  data: TData | undefined;
  error: Error | undefined;
  isLoading: boolean;
}

type DexieQueryAction<TData> =
  | { type: "loading" }
  | { type: "success"; data: TData }
  | { type: "error"; error: Error };

function dexieQueryReducer<TData>(
  state: DexieQueryState<TData>,
  action: DexieQueryAction<TData>,
): DexieQueryState<TData> {
  switch (action.type) {
    case "loading":
      return {
        data: state.data,
        error: undefined,
        isLoading: true,
      };
    case "success":
      return {
        data: action.data,
        error: undefined,
        isLoading: false,
      };
    case "error":
      return {
        data: undefined,
        error: action.error,
        isLoading: false,
      };
  }
}

export function useDexieQuery<TData>(
  query: (db: CreditCardOffersDb) => Promise<TData> | TData,
  dependencyKey: unknown = undefined,
): DexieQueryState<TData> {
  const queryRef = useRef(query);
  const [state, dispatch] = useReducer(dexieQueryReducer<TData>, {
    data: undefined,
    error: undefined,
    isLoading: true,
  });

  queryRef.current = query;

  useEffect(() => {
    let isCurrent = true;

    dispatch({ type: "loading" });

    const subscription = liveQuery(() =>
      queryRef.current(getCreditCardOffersDb()),
    ).subscribe({
      next(data) {
        if (!isCurrent) {
          return;
        }

        dispatch({ type: "success", data });
      },
      error(error: unknown) {
        if (!isCurrent) {
          return;
        }

        dispatch({
          type: "error",
          error: error instanceof Error ? error : new Error(String(error)),
        });
      },
    });

    return () => {
      isCurrent = false;
      subscription.unsubscribe();
    };
  }, [dependencyKey]);

  return state;
}
