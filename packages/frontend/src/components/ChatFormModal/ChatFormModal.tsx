import * as React from "react";
import Form, { FormFields, FormInput, SelectControlled } from "src/components/Form";
import Button from "src/components/Button";
import { observer } from "mobx-react-lite";
import { charactersManager } from "src/store/CharactersManager.ts";
import Joi from "joi";
import { flowsManager } from "src/store/FlowsManager.ts";
import { Chat, ChatUpdateDto } from "src/store/Chat.ts";
import { useModalContext } from "src/components/Modals";
import ChatFormName from "src/components/ChatFormModal/components/ChatFormName";
import ChatFormScenario from "src/components/ChatFormModal/components/ChatFormScenario";
import ChatFormCharacters from "src/components/ChatFormModal/components/ChatFormCharacters";
import style from "./ChatFormModal.module.scss";
import FormError from "src/components/Form/components/FormError";
import { ChatFormContext } from "src/components/ChatFormModal/components/helpers/ChatFormContext.ts";
import { ChatFormContextStore } from "src/components/ChatFormModal/components/helpers/ChatFormContextStore.ts";
import { useLatest } from "react-use";
import { Book, GitBranch } from "lucide-react";
import { loreBookManager } from "src/store/LoreBookManager.ts";

export type SelectOption = {
  value: string;
  label: string;
}

const validation = Joi.object({
  name: Joi.string().allow(""),
  scenario: Joi.string().allow(""),
  characters: Joi.array().min(1).items(Joi.object({
    id: Joi.string(),
    character: Joi.string(),
    active: Joi.boolean(),
  }).unknown(true)),
  persona: Joi.string().allow(null),
  impersonate: Joi.string().allow(null),
  flow: Joi.object({
    value: Joi.string(),
  }).unknown(true),
  loreBooks: Joi.array().items(Joi.object({
    value: Joi.string(),
  }).unknown(true)),
});

export type ChatFormFields = {
  name: string,
  scenario: string,
  characters: {
    character: string;
    name: string;
    active: boolean;
  }[];
  persona: string | null;
  impersonate: string | null;
  flow: SelectOption | null;
  loreBooks: SelectOption[];
}

type Props = {
  chat?: Chat,
};

const ChatFormModal: React.FC<Props> = (props) => {
  const { chat } = props;
  const { resolve, onBeforeClose } = useModalContext();
  const store = React.useMemo(() => new ChatFormContextStore(chat), [chat]);
  const storeRef = useLatest(store);

  React.useEffect(() => {
    return onBeforeClose?.(() => {
      storeRef.current.dispose();
    });
  }, []);

  return (
    <ChatFormContext.Provider value={store}>
      <Form<ChatFormFields>
        initialValue={React.useMemo<ChatFormFields>(() => ({
          name: chat?.name ?? "",
          scenario: store.scenario,
          characters: chat?.characters.map(({ character, active }) => ({
            character: character.id,
            name: `${character.name} (current)`,
            active,
          })) ?? [],
          persona: chat?.persona || null,
          impersonate: chat?.impersonate || null,
          flow: chat?.flow ? { value: chat.flow.id, label: `${chat.flow.name} (current)` } : null,
          loreBooks: chat?.loreBooks ? chat.loreBooks.map(loreBook => ({
            value: loreBook.loreBook.id,
            label: `${loreBook.loreBook.name} (current)`,
          })) : [],
        }), [chat])}
        validationSchema={validation}
        onSubmit={React.useCallback((data: ChatFormFields) => {
          const dto: Partial<ChatUpdateDto> = {};

          const characters: ChatUpdateDto["characters"] = [];
          if (chat) {
            chat.characters.forEach(({ character, active }) => {
              if (data.characters.find(c => c.character === character.id)) {
                characters.push({ character: character, active });
              }
            });
          }
          data.characters.forEach(({ character: characterId, active }) => {
            if (!characters.find(({ character }) => character.id === characterId)) {
              const character = charactersManager.dict[characterId];
              const localCharacter = character.clone(true);
              if (characterId === data.persona) data.persona = localCharacter.id;
              characters.push({ character: localCharacter, active });
            }
          });
          dto.characters = characters;

          const loreBooks: ChatUpdateDto["loreBooks"] = [];
          if (chat) {
            chat.loreBooks.forEach(({ loreBook, active }) => {
              if (data.loreBooks.find(item => item.value === loreBook.id)) {
                loreBooks.push({ loreBook, active });
              }
            });
          }
          data.loreBooks.forEach(({ value: loreBookId }) => {
            if (!loreBooks.find(({ loreBook }) => loreBook.id === loreBookId)) {
              const loreBook = loreBookManager.dict[loreBookId];
              const localLoreBook = loreBook.clone(true);
              loreBooks.push({ loreBook: localLoreBook, active: true });
            }
          });
          dto.loreBooks = loreBooks;

          const flowId = data.flow?.value;
          if (flowId !== chat?.flow?.id) {
            const flow = flowId ? flowsManager.dict[flowId] : null;
            if (flow) dto.flow = flow.clone(true);
          }

          dto.persona = data.persona || null;
          dto.name = data.name || characters.map(({ character }) => character.name).join(", ");
          dto.scenario = data.scenario || "";

          if (chat) {
            chat.update(dto as ChatUpdateDto);
            resolve(chat);
          } else {
            if (!dto.characters.length || !dto.flow) return;
            const newChat = Chat.createEmpty(dto as ChatUpdateDto);
            resolve(newChat);
          }
        }, [chat])}
      >
        <FormFields>
          <ChatFormCharacters chat={chat} />

          <FormInput icon={GitBranch} label="Flow:" name="flow">
            <SelectControlled
              name="flow"
              options={store.flowsOptions}
            />
          </FormInput>

          <FormInput icon={Book} label="Lorebooks:" name="loreBooks">
            <SelectControlled
              name="loreBooks"
              options={store.loreBookOptions}
              isMulti
            />
          </FormInput>

          <ChatFormName />

          <ChatFormScenario />

          <div className={style.footer}>
            <FormError name="" />
            <Button block>{chat ? "Save" : "Create"}</Button>
          </div>
        </FormFields>
      </Form>
    </ChatFormContext.Provider>
  );
};

export default observer(ChatFormModal) as typeof ChatFormModal;
