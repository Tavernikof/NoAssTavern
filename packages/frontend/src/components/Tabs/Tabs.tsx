import * as React from "react";
import style from "./Tabs.module.scss";
import clsx from "clsx";

export type TabItem = {
  key: string,
  title: React.ReactNode,
  content: () => React.ReactNode,
}

type Props = {
  items: TabItem[]
};

const Tabs: React.FC<Props> = (props) => {
  const { items } = props;
  const [activeItem, setActiveItem] = React.useState<string | null>();

  React.useEffect(() => {
    if (!activeItem && items?.length) setActiveItem(items[0].key);
  }, [items, activeItem]);

  return (
    <div className={style.container}>
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
      <div className={style.content}>{items.find(item => item.key === activeItem)?.content()}</div>
    </div>
  );
};

export default React.memo(Tabs) as typeof Tabs;
