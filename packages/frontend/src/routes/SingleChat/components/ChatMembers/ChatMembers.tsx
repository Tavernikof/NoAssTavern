import * as React from "react";
import style from "./ChatMembers.module.scss";
import { useChatControllerContext } from "src/routes/SingleChat/helpers/ChatControllerContext.ts";
import CharacterAvatar from "src/components/CharacterAvatar/CharacterAvatar.tsx";
import { Checkbox, CreatableSelect, FormInput } from "src/components/Form";
import { Book, Pen } from "lucide-react";
import { openPromptEditorModal } from "src/components/PromptEditorModal";
import MessageActionButton from "src/routes/SingleChat/components/MessageActionButton/MessageActionButton.tsx";
import { openCharacterModal } from "src/components/CharacterModal";
import { GitBranch, User } from "lucide-react";
import { openFlowEditorModal } from "src/components/FlowEditorModal";
import { openChatFormModal } from "src/components/ChatFormModal";
import { observer } from "mobx-react-lite";
import Tooltip from "src/components/Tooltip";
import { openLoreBookModal } from "src/components/LoreBookModal";

type Props = Record<string, never>;

const ChatMembers: React.FC<Props> = () => {
  const { chat, characters, persona, personaId, flow, loreBooks } = useChatControllerContext();

  const impersonateOptions = React.useMemo(() => {
    const options = characters.map(c => ({
      value: c.character.name,
      label: c.character.name,
    }));
    options.push({ value: "GM", label: "GM" });
    options.push({ value: "System", label: "System" });
    return options;
  }, []);

  const impersonateValue = React.useMemo(() => chat.impersonate ? ({
    label: chat.impersonate,
    value: chat.impersonate,
  }) : null, [chat.impersonate]);

  return (
    <div className={style.container}>
      <div className={style.row}>
        <div className={style.nameChat}>{chat.name}</div>
        <MessageActionButton icon={Pen} onClick={() => openChatFormModal({ chat })} />
      </div>

      <hr className={style.separator} />

      {characters.map(({ character, active }) => {
        return (
          <div key={character.id} className={style.row}>
            <div>
              <CharacterAvatar name={character.name} imageId={character.imageId} size={20} />
            </div>

            <div className={style.name}>{character.name}</div>

            {character.id === personaId
              ? (
                <Tooltip content={() => "Current persona"} hover>
                  {({ elementRef, getReferenceProps }) => (
                    <div ref={elementRef} {...getReferenceProps()} className={style.persona}><User /></div>
                  )}
                </Tooltip>
              ) : (
                <Checkbox
                  checked={active}
                  onChange={(e) => chat.updateCharacterActive(character.id, e.currentTarget.checked)}
                />
              )}

            <MessageActionButton icon={Pen} onClick={() => openCharacterModal({ character })} />
          </div>
        );
      })}

      <hr className={style.separator} />

      <div className={style.prompts}>
        <div className={style.row}>
          <div className={style.icon}>
            <GitBranch className={style.icon} />
          </div>
          <div className={style.name}>{flow.name}</div>
          <MessageActionButton icon={Pen} onClick={() => openFlowEditorModal({ flow })} />
        </div>
        {flow.prompts.map(prompt => {
          return (
            <div key={prompt.id} className={style.row}>
              <div className={style.icon} />
              <div className={style.nameSmall}>{prompt.name}</div>
              <MessageActionButton icon={Pen} onClick={() => openPromptEditorModal({ prompt })} />
            </div>
          );
        })}
      </div>

      <hr className={style.separator} />

      {Boolean(loreBooks.length) && (
        <>
          {loreBooks.map((item, index) => (
            <div key={item.loreBook.id} className={style.row}>
              <div className={style.icon}>
                {index === 0 && <Book />}
              </div>
              <div className={style.nameSmall}>{item.loreBook.name}</div>
              <MessageActionButton icon={Pen} onClick={() => openLoreBookModal({ loreBook: item.loreBook })} />
            </div>
          ))}

          <hr className={style.separator} />
        </>
      )}

      <FormInput label="Impersonate:">
        <CreatableSelect
          value={impersonateValue}
          onChange={(value) => chat.updateImpersonate((value as { value: string })?.value || null)}
          options={impersonateOptions}
          placeholder={persona?.character?.name}
          isClearable
        />
      </FormInput>
    </div>

  );
};

export default observer(ChatMembers) as typeof ChatMembers;
