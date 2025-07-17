import * as React from "react";
import ReactSelect from "react-select";
import { selectClassNames } from "./helpers/selectClassNames.ts";

type Props = React.ComponentProps<typeof ReactSelect>;

const Select = React.forwardRef<React.ElementRef<typeof ReactSelect>, Props>((props, ref) => {
  const { ...restProps } = props;

  return (
    <ReactSelect
      ref={ref}
      unstyled
      classNames={selectClassNames}
      menuPortalTarget={document.body}
      {...restProps}
    />
  );
});

export default React.memo(Select) as typeof Select;
