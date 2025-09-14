import { backendManager } from "src/store/BackendManager.ts";

export class BackendStorage<I extends { id: string }> {
  constructor(readonly slug: string) {}

  async getItems() {
    return backendManager.apiRequest<I[]>({
      method: "GET",
      url: `storage/${this.slug}`,
    }).then(resp => resp.data);
  }

  async getItem(id: string) {
    return backendManager.apiRequest<I>({
      method: "GET",
      url: `storage/${this.slug}/${id}`,
    }).then(resp => resp.data);
  }

  async updateItem(value: I) {
    return backendManager.apiRequest<I>({
      method: "POST",
      url: `storage/${this.slug}`,
      data: value,
    }).then(resp => resp.data);
  }

  async removeItem(id: string) {
    return backendManager.apiRequest<I>({
      method: "DELETE",
      url: `storage/${this.slug}/${id}`,
    }).then(resp => resp.data);
  }
}