import * as React from "react";
import style from "./Sidebar.module.scss";
import { Link, NavLink } from "react-router";
import clsx from "clsx";
import { menu } from "src/menu.ts";

type Props = Record<string, never>;

const Sidebar: React.FC<Props> = () => {
  return (
    <div className={style.container}>
      <Link to="/" className={style.title}>NoassTavern</Link>
      {menu.map(([Icon, title, link]) => (
        <NavLink key={title} to={link} className={({ isActive }) => clsx(style.item, isActive && style.itemActive)}>
          <Icon className={style.icon} />
          {title}
        </NavLink>
      ))}
    </div>
  );
};

export default React.memo(Sidebar) as typeof Sidebar;
