import { action, makeObservable, observable, runInAction } from "mobx";
import _cloneDeep from "lodash/cloneDeep";
import { filesManager } from "src/store/FilesManager.ts";

export interface MediaEditorController {
  mediaFiles: MediaFile[];
  addMediaFile(file: File): Promise<void>;
  removeMediaFile(id: string): void;
  renameMediaFile(id: string, name: string): void;
}

export class MediaEditorState implements MediaEditorController {
  @observable mediaFiles: MediaFile[];
  readonly trackedFileIds = new Set<string>();

  constructor(initial?: MediaFile[]) {
    this.mediaFiles = _cloneDeep(initial || []);
    this.mediaFiles.forEach(file => this.trackedFileIds.add(file.id));
    makeObservable(this);
  }

  @action.bound
  async addMediaFile(file: File) {
    const mimeType = file.type || "application/octet-stream";
    const id = await filesManager.saveBlob(file, file.name, mimeType);
    this.trackedFileIds.add(id);
    runInAction(() => {
      this.mediaFiles.push({
        id,
        name: file.name,
        mimeType,
        size: file.size,
        createdAt: new Date(),
      });
    });
  }

  @action
  removeMediaFile(id: string) {
    this.mediaFiles = this.mediaFiles.filter(file => file.id !== id);
  }

  @action
  renameMediaFile(id: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const index = this.mediaFiles.findIndex(file => file.id === id);
    if (index === -1) return;
    this.mediaFiles.splice(index, 1, { ...this.mediaFiles[index], name: trimmed });
  }
}
