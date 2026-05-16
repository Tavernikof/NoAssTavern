import * as React from "react";
import { useModalContext } from "src/components/Modals";
import { observer } from "mobx-react-lite";
import { Character } from "src/store/Character.ts";
import Tabs, { TabItem } from "src/components/Tabs";
import LoreBookForm from "src/components/LoreBookModal/components/LoreBookForm";
import CharacterForm from "src/components/CharacterModal/components/CharacterForm";
import Button from "src/components/Button";
import { Plus } from "lucide-react";
import MediaGallery, { MediaEditorState, MediaGalleryCounter } from "src/components/MediaGallery";
import { MediaSnapshotTracker, collectCharacterMedia } from "src/helpers/collectMediaIds.ts";

type Props = {
  character: Character;
  local?: boolean;
};

const CharacterModal: React.FC<Props> = (props) => {
  const { character } = props;
  const { resolve } = useModalContext();
  const media = React.useMemo(() => new MediaEditorState(character.mediaFiles), [character]);
  const mediaTracker = React.useMemo(() => new MediaSnapshotTracker(
    () => collectCharacterMedia(character),
    { getFiles: () => media.trackedFileIds },
  ), [character, media]);

  const items = React.useMemo<TabItem[]>(() => ([
    {
      key: "character",
      title: "Info",
      content: () => <CharacterForm character={character} media={media} onMediaCommit={() => mediaTracker.commit()} onSubmit={resolve} />,
    },
    {
      key: "loreBook",
      title: "Lorebook",
      content: () => (
        <>
          {character.loreBook
            ? <LoreBookForm loreBook={character.loreBook} onSubmit={resolve} />
            : <Button iconBefore={Plus} onClick={character.initLoreBook}>Create lorebook</Button>
          }
        </>
      ),
    },
    {
      key: "media",
      title: <>Media <MediaGalleryCounter controller={media} /></>,
      content: () => <MediaGallery controller={media} />,
    },
  ]), [character.loreBook, media, mediaTracker]);

  return <Tabs items={items} />;
};

export default observer(CharacterModal) as typeof CharacterModal;
