import {
  action,
  autorun,
  IObservableArray,
  observable,
  onBecomeObserved,
  onBecomeUnobserved,
  isObservableArray, runInAction, makeObservable,
} from "mobx";
import { CancelablePromise, isCancelablePromise } from "cancelable-promise";
import { produce } from "immer";
import { isPromise } from "src/helpers/promisify.ts";

export type AsyncStoreStore<D, E> = {
  data: D | undefined | null,
  loading: boolean,
  error: E | null,
}

export type AsyncStoreResetParams = { silent?: boolean };

const STORE_DISPOSED_ERROR = "store disposed";

// ============================================================================

export type RequestContainer<D, E> = {
  store: AsyncStoreStore<D, E>,
  load: (dataLoader: () => Promise<D>, params?: AsyncStoreResetParams) => Promise<D>,
  cancel: () => void,
  reset: (silent?: boolean) => void,
  update: <P extends Promise<any> | undefined>(cb: (data: D) => D, promise: P) => P,
}

export const requestContainer = <D, E>(initialData?: D): RequestContainer<D, E> => {
  const store = makeObservable<AsyncStoreStore<D, E>>({
    data: initialData ?? null,
    loading: false,
    error: null,
  }, {
    data: observable.ref,
    loading: observable,
    error: observable,
  });

  const updateStore = action((
    data: AsyncStoreStore<D, E>["data"],
    loading: AsyncStoreStore<D, E>["loading"],
    error: AsyncStoreStore<D, E>["error"],
  ) => Object.assign(store, {
    data,
    loading,
    error,
  }));
  const setLoading = action(() => store.loading = true);

  let request: Promise<D> | null;

  const cancel: RequestContainer<D, E>["cancel"] = () => {
    if (isCancelablePromise(request)) (request as CancelablePromise).cancel();
  };

  const reset: RequestContainer<D, E>["reset"] = (silent?: boolean) => {
    cancel();
    if (!silent) updateStore(initialData, false, null);
  };

  const load: RequestContainer<D, E>["load"] = (dataLoader, params) => {
    const silent = Boolean(params?.silent);

    reset(silent);
    setLoading();
    request = dataLoader();
    request.then(
      data => updateStore(data, false, null),
      (error) => updateStore(initialData, false, error),
    ).finally(() => {
      request = null;
    });
    return request;
  };

  const update: RequestContainer<D, E>["update"] = (cb, promise) => {
    const previousData = store.data;
    if (previousData) runInAction(() => store.data = produce(previousData, cb));
    cancel();
    if (isPromise(promise)) {
      promise.catch(() => {
        store.data = previousData;
      });
    }
    return promise;
  };

  return { store, load, cancel, reset, update };
};

// ============================================================================

export type AsyncStore<D, E = unknown> = {
  store: AsyncStoreStore<D, E>,
  reset: (params?: AsyncStoreResetParams) => Promise<AsyncStoreStore<D, E>["data"]>,
  cancel: () => void,
  dispose: () => void,
  // Обновляет содержимое стора через immer.
  // Опционально принимает на вход promise и если он реджектится, откатывает изменения
  update: <P extends Promise<any> | undefined>(cb: (data: D) => D, promise: P) => P,
};

export const asyncStore = <D, E>(dataLoader: () => Promise<D>, initialData?: D): AsyncStore<D, E> => {
  const { store, load, cancel, update } = requestContainer<D, E>(initialData);

  let disposed = false;
  let loaded = false;
  let loadParams: AsyncStoreResetParams | undefined = undefined;

  const observed = watchStore(store, () => {
    if (disposed || loaded) return;
    load(dataLoader, loadParams);
    loaded = true;
    loadParams = undefined;
  });

  const reset = (params?: AsyncStoreResetParams): Promise<AsyncStoreStore<D, E>["data"]> => {
    if (disposed) return Promise.reject(new Error(STORE_DISPOSED_ERROR));
    if (observed.o) return load(dataLoader, params);
    cancel();
    loaded = false;
    loadParams = params;
    return Promise.resolve(store.data);
  };

  const dispose = () => {
    cancel();
    disposed = true;
  };

  return {
    store,
    reset: reset,
    cancel: cancel,
    dispose: dispose,
    update: update,
  };
};

// ============================================================================

export type AsyncAccumulateStore<I, E = unknown> = {
  items: IObservableArray<I>;
  loadNext: () => Promise<IObservableArray<I>>; // добавляет данные в конец
  loadPrev: () => Promise<IObservableArray<I>>; // добавляет данные в начало
  nextStore: AsyncStoreStore<I[], E>;
  prevStore: AsyncStoreStore<I[], E> | undefined;
  reset: (params?: AsyncStoreResetParams) => Promise<IObservableArray<I>>;
  cancel: () => void,
  dispose: () => void,
};

export const asyncAccumulateStore = <I, E>(nextDataLoader: () => Promise<I[]>, prevDataLoader?: () => Promise<I[]>): AsyncAccumulateStore<I, E> => {
  const nextContainer = requestContainer<I[], E>();
  const prevContainer = prevDataLoader ? requestContainer<I[], E>() : null;

  const items = observable<I>([], { deep: false });

  const createLoader = (
    container: RequestContainer<I[], E> | null,
    dataLoader: (() => Promise<I[]>) | undefined,
    thenAction: (items: I[]) => IObservableArray<I>,
    setLoaded: (loaded: boolean) => void,
  ) => {
    return () => {
      if (disposed) return Promise.reject(new Error(STORE_DISPOSED_ERROR));
      if (!container || !dataLoader || container.store.loading) return Promise.resolve(items);
      if (!observed.o) {
        setLoaded(false);
        return Promise.resolve(items);
      }
      const request = container.load(dataLoader, reloadParams);
      return request.then(action(thenAction));
    };
  };

  const loadNext = createLoader(nextContainer, nextDataLoader, (data) => {
    items.push(...data);
    return items;
  }, (loaded) => nextLoaded = loaded);

  const loadPrev = createLoader(prevContainer, prevDataLoader, (data) => {
    items.unshift(...data);
    return items;
  }, (loaded) => prevLoaded = loaded);

  let disposed = false;
  let reloadParams: AsyncStoreResetParams | undefined = undefined;
  let nextLoaded = false;
  let prevLoaded = true;

  const observed = watchStore(items, () => {
    if (disposed) return;
    if (!nextLoaded) loadNext();
    if (!prevLoaded) loadPrev();
    nextLoaded = true;
    prevLoaded = true;
    reloadParams = undefined;
  });


  const reset = (params?: AsyncStoreResetParams) => {
    if (disposed) return Promise.reject(new Error(STORE_DISPOSED_ERROR));
    if (observed.o) return loadNext();
    cancel();
    nextLoaded = false;
    prevLoaded = true;
    reloadParams = params;
    return Promise.resolve(items);
  };

  const cancel = () => {
    nextContainer.cancel();
    prevContainer?.cancel();
  };

  const dispose = () => {
    cancel();
    disposed = true;
  };

  return {
    items,
    loadNext,
    loadPrev,
    nextStore: nextContainer.store,
    prevStore: prevContainer?.store,
    reset: reset,
    cancel: cancel,
    dispose: dispose,
  };
};

// ============================================================================

function watchStore(
  store: object | IObservableArray,
  onStart: () => any,
) {
  const observedKeys: Record<string, boolean> = {};
  const observed = { o: false };
  let cancelAutorun: ReturnType<typeof autorun>;

  const startObserved = () => {
    if (observed.o || !someTrue(observedKeys)) return;
    observed.o = true;
    cancelAutorun = autorun(() => {
      requestAnimationFrame(onStart);
    });
  };
  const stopObserved = () => {
    if (!observed.o || someTrue(observedKeys)) return;
    observed.o = false;
    if (cancelAutorun) cancelAutorun();
  };

  if (isObservableArray(store)) {
    onBecomeObserved(store, () => {
      observedKeys["array"] = true;
      startObserved();
    });
    onBecomeUnobserved(store, () => {
      observedKeys["array"] = false;
      stopObserved();
    });
  } else {
    for (const key in store) {
      onBecomeObserved(store, key, () => {
        observedKeys[key] = true;
        startObserved();
      });
      onBecomeUnobserved(store, key, () => {
        observedKeys[key] = false;
        stopObserved();
      });
    }
  }

  return observed;
}

function someTrue(obj: Record<string, boolean>): boolean {
  for (const key in obj) {
    if (obj[key]) return true;
  }
  return false;
}
