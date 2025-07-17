import * as React from "react";
import ReactAsyncCreatableSelect from "react-select/async-creatable";
import { selectClassNames } from "./helpers/selectClassNames.ts";

type Props = React.ComponentProps<typeof ReactAsyncCreatableSelect>;

const AsyncCreatableSelect = React.forwardRef<React.ElementRef<typeof ReactAsyncCreatableSelect>, Props>((props, ref) => {
  const { ...restProps } = props;

  return (
    <ReactAsyncCreatableSelect
      ref={ref}
      unstyled
      classNames={selectClassNames}
      menuPortalTarget={document.body}
      {...restProps}
    />
  );
});

export default React.memo(AsyncCreatableSelect) as typeof AsyncCreatableSelect;
