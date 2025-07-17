import arrayToIdIndex from "./arrayToIdIndex";

export type SelectOption<O> = {
  label: string,
  value: number | string,
  original: O
}

export type DictionatyElement<D extends ReturnType<ReturnType<typeof createGenericDictionary>>> = { [key in keyof D["dict"]]: D["dict"][key] }[keyof D["dict"]]

type Item = { id: number | string, title?: string };

type formatSelectLabelCb<I extends Item> = (item: I) => string;

type Config<I extends Item> = {
  list: I[],
  formatLabel?: formatSelectLabelCb<I>
}

const defaultFormatLabel: formatSelectLabelCb<Item> = item => typeof item.title === "string" ? item.title : "";

const createDictionary = <I extends Item>({ list, formatLabel }: Config<I>) => {
  const dict = arrayToIdIndex(list);

  formatLabel = formatLabel || defaultFormatLabel;

  return {
    list,
    dict,
    getById: (id: typeof list[number]["id"]) => dict[id],
    selectOptions: list.map(item => ({ label: formatLabel(item), value: item.id as I["id"], original: item })),
  };
};

export default createDictionary;

export const createGenericDictionary = <I extends Item>(config: Config<I>) => {
  const { list } = config;

  type AvailableKeys = typeof list[number]["id"];
  type ExtendConfig<EI extends {}> = {
    extend: { [key in AvailableKeys]: EI }
  }

  return <EI extends {}>(extendConfig: ExtendConfig<EI>) => {
    type ExtendValues = typeof extendConfig["extend"][keyof typeof extendConfig["extend"]];

    const finalList = list.map(item => ({
      ...item,
      ...extendConfig.extend[item.id as I["id"]],
    })) as (ExtendValues)[];
    return createDictionary({ ...config, list: finalList } as Config<I & ExtendValues>);
  };
};
