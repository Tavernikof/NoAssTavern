import * as React from "react";
import { connectionProxiesManager } from "src/store/ConnectionProxiesManager.ts";
import { BaseBackendProvider } from "src/helpers/backends/BaseBackendProvider.ts";

export const useModelsLoader = (backendProvider: BaseBackendProvider | undefined, connectionProxyId: string | undefined) => {
  const [data, setData] = React.useState<{ label: string, value: string }[]>();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [i, setI] = React.useState(0);

  React.useEffect(() => {
    setError(null);

    if (!backendProvider) {
      setData([]);
      return;
    }

    const connectionProxy = connectionProxyId ? connectionProxiesManager.proxiesDict[connectionProxyId] : undefined;
    const cachedModels = connectionProxy?.models;
    if (cachedModels) {
      setData(cachedModels.map(model => ({ label: model, value: model })));
      return;
    }
    setLoading(true);
    backendProvider.getModelsOptions(connectionProxy)
      .then(
        (data) => {
          if (connectionProxy) connectionProxy.update({ models: data.map(m => m.value) });
          setData(data);
          setError(null);
        },
        (error) => {
          setData([]);
          setError(error);
        },
      )
      .finally(() => setLoading(false));
  }, [backendProvider, connectionProxyId, i]);

  const reload = React.useCallback(() => {
    const connectionProxy = connectionProxyId ? connectionProxiesManager.proxiesDict[connectionProxyId] : undefined;
    if (connectionProxy) connectionProxy.update({ models: null });
    setI(i => i + 1);
  }, [connectionProxyId]);

  return { data, loading, error, reload };
};