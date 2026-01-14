import * as React from "react";
import style from "./Tabs.module.scss";
import clsx from "clsx";

export type TabItem = {
  key: string,
  title: React.ReactNode,
  content: () => React.ReactNode,
}

type Props = {
  items: TabItem[],
  containerClassName?: string,
  contentClassName?: string,
  value?: string,
  onChange?: (value: string) => void,
};

const Tabs: React.FC<Props> = (props) => {
  const { items, containerClassName, contentClassName, value, onChange } = props;
  const isControlled = value !== undefined;
  const [internalActiveItem, setInternalActiveItem] = React.useState<string | null>();

  const activeItem = isControlled ? value : internalActiveItem;
  const setActiveItem = (key: string) => {
    if (isControlled) {
      onChange?.(key);
    } else {
      setInternalActiveItem(key);
    }
  };

  React.useEffect(() => {
    if (!isControlled && !internalActiveItem && items?.length) setInternalActiveItem(items[0].key);
  }, [items, internalActiveItem, isControlled]);

  return (
    <div className={clsx(style.container, containerClassName)}>
      <div className={style.heads}>
        {items.map(item => (
          <button
            key={item.key}
            className={clsx(style.head, activeItem === item.key && style.headActive)}
            type="button"
            onClick={() => setActiveItem(item.key)}
          >
            {item.title}
          </button>
        ))}
      </div>
      <div className={clsx(style.content, contentClassName)}>
        {items.find(item => item.key === activeItem)?.content()}
      </div>
    </div>
  );
};

export default React.memo(Tabs) as typeof Tabs;
