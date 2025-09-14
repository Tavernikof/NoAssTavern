import * as React from "react";
import style from "./Tooltip.module.scss";
import Popover, { DropdownChildrenRenderProps } from "src/components/Popover";
import { createPopoverBackend } from "src/components/Popover/helpers/createPopoverBackend.ts";
import { Placement } from "@floating-ui/react";

type Props = {
  content: () => React.ReactNode,
  children: (props: DropdownChildrenRenderProps) => React.ReactNode,
  placement?: Placement,
  hover?: boolean,
};

const Tooltip: React.FC<Props> = (props) => {
  const { content, children, placement = "top", hover } = props;

  return (
    <Popover
      renderDropdown={() => (
        <div className={style.content}>
          {content()}
        </div>
      )}
      arrowClassName={style.arrow}
      useBackend={React.useMemo(() => createPopoverBackend({ placement, hover }), [placement, hover])}
    >
      {children}
    </Popover>
  );
};

export default React.memo(Tooltip) as typeof Tooltip;
