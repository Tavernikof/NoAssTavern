import { ClassNamesConfig } from "react-select";
import style from "src/components/Form/components/Select/Select.module.scss";
import clsx from "clsx";

export const selectClassNames: ClassNamesConfig = {
  clearIndicator: () => style.clearIndicator,
  container: () => style.container,
  control: () => style.control,
  dropdownIndicator: () => style.dropdownIndicator,
  group: () => style.group,
  groupHeading: () => style.groupHeading,
  indicatorsContainer: () => style.indicatorsContainer,
  indicatorSeparator: () => style.indicatorSeparator,
  input: () => style.input,
  loadingIndicator: () => style.loadingIndicator,
  loadingMessage: () => style.loadingMessage,
  menu: () => style.menu,
  menuList: () => style.menuList,
  menuPortal: () => style.menuPortal,
  multiValue: () => style.multiValue,
  multiValueLabel: () => style.multiValueLabel,
  multiValueRemove: () => style.multiValueRemove,
  noOptionsMessage: () => style.noOptionsMessage,
  option: (props) => clsx(style.option, props.isFocused && style.optionFocused, props.isSelected && style.optionSelected),
  placeholder: () => style.placeholder,
  singleValue: () => style.singleValue,
  valueContainer: () => style.valueContainer,
};