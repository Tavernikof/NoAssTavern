import { connectionProxiesStorage, ConnectionProxyStorageItem } from "src/storages/ConnectionProxiesStorage.ts";
import { ConnectionProxy } from "src/store/ConnectionProxy.ts";
import { AbstractManager } from "src/helpers/AbstractManager.ts";

class ConnectionProxiesManager extends AbstractManager<ConnectionProxy, ConnectionProxyStorageItem> {
  constructor() {
    super(connectionProxiesStorage, ConnectionProxy);
  }

  getLabel(entity: ConnectionProxy): string {
    return entity.name || entity.baseUrl;
  }
}

export const connectionProxiesManager = new ConnectionProxiesManager();
