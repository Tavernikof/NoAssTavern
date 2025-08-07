import { action, computed, makeObservable, observable } from "mobx";
import { connectionProxiesStorage } from "src/storages/ConnectionProxiesStorage.ts";
import { ConnectionProxy } from "src/store/ConnectionProxy.ts";

class ConnectionProxiesManager {
  @observable proxies: string[];
  @observable proxiesDict: Record<string, ConnectionProxy>;
  @observable ready = false;

  constructor() {
    makeObservable(this);

    connectionProxiesStorage.getItems().then(action((data) => {
      const list: string[] = [];
      const dict: Record<string, ConnectionProxy> = {};
      data.forEach(item => {
        list.push(item.id);
        dict[item.id] = new ConnectionProxy(item);
      });
      this.proxies = list;
      this.proxiesDict = dict;
      this.ready = true;
    }));
  }

  @computed
  get selectOptions() {
    return this.proxies.map((connectionProxyId) => ({
      value: connectionProxyId,
      label: this.proxiesDict[connectionProxyId].name || this.proxiesDict[connectionProxyId].baseUrl,
    }));
  }

  @action
  add(connectionProxy: ConnectionProxy) {
    this.proxiesDict[connectionProxy.id] = connectionProxy;
    this.proxies.push(connectionProxy.id);
    connectionProxy.save();
  }

  @action.bound
  remove(connectionProxy: ConnectionProxy) {
    this.proxies = this.proxies.filter(connectionProxyId => connectionProxyId !== connectionProxy.id);
    delete this.proxiesDict[connectionProxy.id];
    connectionProxiesStorage.removeItem(connectionProxy.id);
  }
}

export const connectionProxiesManager = new ConnectionProxiesManager();
