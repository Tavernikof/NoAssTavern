import { filesManager } from "src/store/FilesManager.ts";
import { imagesManager } from "src/store/ImagesManager.ts";

export type MediaSnapshot = { files: Set<string>; images: Set<string> };

type WithMedia = { mediaFiles?: { id: string }[] | null };
type PromptLike = WithMedia;
type FlowLike = WithMedia & { prompts?: PromptLike[] | null };
type CharacterLike = WithMedia & { imageId?: string | null };
type ChatLike = WithMedia & {
  characters?: { character: CharacterLike }[] | null;
  flow?: FlowLike | null;
};

export function createMediaSnapshot(): MediaSnapshot {
  return { files: new Set(), images: new Set() };
}

function addFiles(list: { id: string }[] | null | undefined, out: Set<string>) {
  if (!list) return;
  for (const file of list) {
    if (file?.id) out.add(file.id);
  }
}

export function collectPromptMedia(prompt: PromptLike | null | undefined, out: MediaSnapshot = createMediaSnapshot()): MediaSnapshot {
  if (!prompt) return out;
  addFiles(prompt.mediaFiles, out.files);
  return out;
}

export function collectFlowMedia(flow: FlowLike | null | undefined, out: MediaSnapshot = createMediaSnapshot()): MediaSnapshot {
  if (!flow) return out;
  addFiles(flow.mediaFiles, out.files);
  flow.prompts?.forEach(prompt => collectPromptMedia(prompt, out));
  return out;
}

export function collectCharacterMedia(character: CharacterLike | null | undefined, out: MediaSnapshot = createMediaSnapshot()): MediaSnapshot {
  if (!character) return out;
  addFiles(character.mediaFiles, out.files);
  if (character.imageId) out.images.add(character.imageId);
  return out;
}

export function collectChatMedia(chat: ChatLike | null | undefined, out: MediaSnapshot = createMediaSnapshot()): MediaSnapshot {
  if (!chat) return out;
  addFiles(chat.mediaFiles, out.files);
  chat.characters?.forEach(({ character }) => collectCharacterMedia(character, out));
  collectFlowMedia(chat.flow, out);
  return out;
}

export function diffSnapshots(before: MediaSnapshot, after: MediaSnapshot): MediaSnapshot {
  const result = createMediaSnapshot();
  before.files.forEach(id => { if (!after.files.has(id)) result.files.add(id); });
  before.images.forEach(id => { if (!after.images.has(id)) result.images.add(id); });
  return result;
}

export async function deleteSnapshot(snapshot: MediaSnapshot): Promise<void> {
  await Promise.all([
    ...Array.from(snapshot.files).map(id => filesManager.removeItem(id).catch(() => null)),
    ...Array.from(snapshot.images).map(id => imagesManager.removeItem(id).catch(() => null)),
  ]);
}

export type MediaTrackerExtras = {
  getFiles?: () => Iterable<string>;
  getImages?: () => Iterable<string>;
};

export class MediaSnapshotTracker {
  private initial: MediaSnapshot;
  private collect: () => MediaSnapshot;
  private extras?: MediaTrackerExtras;

  constructor(collect: () => MediaSnapshot, extras?: MediaTrackerExtras) {
    this.collect = collect;
    this.extras = extras;
    this.initial = collect();
  }

  async commit(): Promise<void> {
    const candidates = createMediaSnapshot();
    this.initial.files.forEach(id => candidates.files.add(id));
    this.initial.images.forEach(id => candidates.images.add(id));
    if (this.extras?.getFiles) {
      for (const id of this.extras.getFiles()) candidates.files.add(id);
    }
    if (this.extras?.getImages) {
      for (const id of this.extras.getImages()) candidates.images.add(id);
    }
    const after = this.collect();
    await deleteSnapshot(diffSnapshots(candidates, after));
  }
}
