import * as React from "react";
import ReactCreatableSelect from "react-select/creatable";
import { selectClassNames } from "./helpers/selectClassNames.ts";

type Props = React.ComponentProps<typeof ReactCreatableSelect>;

const CreatableSelect = React.forwardRef<React.ElementRef<typeof ReactCreatableSelect>, Props>((props, ref) => {
  const { ...restProps } = props;

  return (
    <ReactCreatableSelect
      ref={ref}
      unstyled
      classNames={selectClassNames}
      menuPortalTarget={document.body}
      {...restProps}
    />
  );
});

export default React.memo(CreatableSelect) as typeof CreatableSelect;
