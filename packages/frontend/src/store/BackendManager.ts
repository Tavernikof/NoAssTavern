import axios, { AxiosRequestConfig } from "axios";
import { action, makeObservable, observable } from "mobx";

class BackendManager {
  @observable isConnected: boolean = true;
  baseUrl: string;
  useProxy = false;
  socks5: string;

  constructor() {
    makeObservable(this);

    setInterval(() => this.refreshIsConnected(), 5000);
  }

  refreshIsConnected() {
    return this.getBaseInfo().then(
      action(() => {
        this.isConnected = true;
      }),
      action(() => {
        this.isConnected = false;
      }),
    );
  }

  getBaseInfo(baseUrl?: string) {
    return backendManager.apiRequest({
      method: "GET",
      url: "base/info",
      baseURL: baseUrl ?? this.baseUrl,
    });
  }

  apiRequest<R>(config: AxiosRequestConfig) {
    if (!config.baseURL) config.baseURL = this.baseUrl;
    config.baseURL += "/api/";
    return axios<R>(config);
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setUseProxy(useProxy: boolean) {
    this.useProxy = useProxy;
  }

  setSocks5(socks5: string) {
    this.socks5 = socks5;
  }

  externalRequest<R>(config: AxiosRequestConfig) {
    if (this.useProxy) {
      return axios<R>({
        ...config,
        method: "POST",
        baseURL: this.baseUrl,
        url: "/api/proxy",
        headers: {
          "x-proxy-url": config.url,
          "x-proxy-method": config.method,
          "x-proxy-sock5": this.socks5 || undefined,
          ...config.headers,
        },
      });
    } else {
      return axios<R>(config);
    }
  }
}

export const backendManager = new BackendManager();