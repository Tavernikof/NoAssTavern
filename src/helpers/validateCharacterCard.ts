import Joi from "joi";
import loreBooks from "src/routes/LoreBooks";

// https://github.com/malfoyslastname/character-card-spec-v2?tab=readme-ov-file
export type CharacterCardV2 = {
  spec: "chara_card_v2"
  spec_version: "2.0" // May 8th addition
  data: {
    name: string
    description: string
    personality: string
    scenario: string
    first_mes: string
    mes_example: string

    // New fields start here
    creator_notes: string
    system_prompt: string
    post_history_instructions: string
    alternate_greetings: Array<string>
    character_book?: CharacterBook

    // May 8th additions
    tags: Array<string>
    creator: string
    character_version: string
    extensions: Record<string, any> // see details for explanation
  }
}

export type CharacterBook = {
  name?: string
  description?: string
  scan_depth?: number // agnai: "Memory: Chat History Depth"
  token_budget?: number // agnai: "Memory: Context Limit"
  recursive_scanning?: boolean // no agnai equivalent. whether entry content can trigger other entries
  extensions: Record<string, any>
  entries: Array<{
    keys: Array<string>
    content: string
    extensions: Record<string, any>
    enabled: boolean
    insertion_order: number // if two entries inserted, lower "insertion order" = inserted higher
    case_sensitive?: boolean

    // FIELDS WITH NO CURRENT EQUIVALENT IN SILLY
    name?: string // not used in prompt engineering
    priority?: number // if token budget reached, lower priority value = discarded first

    // FIELDS WITH NO CURRENT EQUIVALENT IN AGNAI
    id?: number // not used in prompt engineering
    comment?: string // not used in prompt engineering
    selective?: boolean // if `true`, require a key from both `keys` and `secondary_keys` to trigger the entry
    secondary_keys?: Array<string> // see field `selective`. ignored if selective == false
    constant?: boolean // if true, always inserted in the prompt (within budget limit)
    position?: "before_char" | "after_char" // whether the entry is placed before or after the character defs
  }>
}

export type SillytavernLoreBookEntry = {
  key: string[];
  keysecondary: string[];
  comment: string;
  content: string;
  constant: boolean;
  "selective": boolean;
  "selectiveLogic"?: 0 | 1 | 2 | 3;
  "addMemo": boolean;
  "order": number;
  "position": 0 | 1 | 2 | 3 | 4 | 5 | 6;
  "disable": boolean;
  "excludeRecursion": boolean;
  "probability": number | null;
  "useProbability": boolean;
  "depth": number;
  "group": string;
  "scanDepth": number;
  "caseSensitive": boolean;
  "matchWholeWords": boolean;
  "automationId": string;
  "role": 0 | 1 | 2;
  "uid": number;
  "preventRecursion": boolean;
  "displayIndex": number;
  "groupOverride": boolean;
  "groupWeight": number;
  "vectorized": boolean;
  "delayUntilRecursion": boolean;
  "useGroupScoring": boolean;
  "sticky": number;
  "cooldown": number;
  "delay": number;
}

const characterSchema = Joi.object({
  spec: Joi.string(),
  spec_version: Joi.string(),
  data: Joi.object({
    name: Joi.string(),
    description: Joi.string().allow(""),
    personality: Joi.string().allow(""),
    scenario: Joi.string().allow(""),
    first_mes: Joi.string().allow(""),
    mes_example: Joi.string().allow(""),

    creator_notes: Joi.string().allow(""),
    system_prompt: Joi.string().allow(""),
    post_history_instructions: Joi.string().allow(""),
    alternate_greetings: Joi.array().items(Joi.string().allow("")),
    // character_book?: CharacterBook

    tags: Joi.array().items(Joi.string().allow("")),
    creator: Joi.string().allow(""),
    character_version: Joi.string().allow(""),
    extensions: Joi.object().optional(),
  }),
});

const characterBookSchema = Joi.object({
  name: Joi.string().optional().allow(""),
  scan_depth: Joi.number().optional().allow(""),
});

export const validateCharacterCard = (card: Record<string, unknown>): card is CharacterCardV2 => {
  const result = characterSchema.validate(card, { abortEarly: false, allowUnknown: true });
  if (result.error) throw result.error;
  return true;
};

export const validateCharacterBook = (characterBook: Record<string, unknown>): characterBook is CharacterBook => {
  const result = characterBookSchema.validate(characterBook, { abortEarly: false, allowUnknown: true });
  if (result.error) throw result.error;
  return true;
};