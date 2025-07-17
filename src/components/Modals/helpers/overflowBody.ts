import _isEmpty from "lodash/isEmpty";

const body = document.documentElement;
const CSS_VARIABLE_SIDEBAR_WIDTH = '--app-sidebar-width';
const CSS_VARIABLE_BODY_TOP = '--app-body-top';
const ACTIVE_CLASS = 'modal-active';
const DEVELOPMENT_CLASS = 'development';

if (import.meta.env.MODE === "development") {
  body.classList.add(DEVELOPMENT_CLASS);
}

const scrollbarWidth = (() => {
  const scrollDiv = document.createElement('div')
  scrollDiv.style.cssText = 'position: absolute;top: -9999px;width: 50px;height: 50px;overflow: scroll;';
  document.body.appendChild(scrollDiv)
  const scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth
  document.body.removeChild(scrollDiv)
  return scrollbarWidth;
})()

const isBodyOverflow = () => {
  const rect = document.body.getBoundingClientRect();
  return Math.round(rect.left + rect.right) < window.innerWidth;
}

const activeHandlers: Record<string, boolean> = {};
let active = false;

export const activate = (key: string | number) => {
  if (activeHandlers[key]) console.warn('Modal already active. Key: ', key);
  activeHandlers[key] = true;

  if (!active) {
    if (isBodyOverflow()) {
      const width = scrollbarWidth + 'px'
      // body.style.paddingRight = width;
      body.style.setProperty(CSS_VARIABLE_SIDEBAR_WIDTH, width);
    }
    body.style.setProperty(CSS_VARIABLE_BODY_TOP, `${window.scrollY}px`);
    body.classList.add(ACTIVE_CLASS);
    active = true;
  }
}

export const deactivate = (key: string | number) => {
  if (!activeHandlers[key]) console.warn('Modal not found. Key: ', key);
  delete activeHandlers[key];

  if (_isEmpty(activeHandlers)) {
    const scrollY = body.style.getPropertyValue(CSS_VARIABLE_BODY_TOP);
    body.style.removeProperty(CSS_VARIABLE_SIDEBAR_WIDTH);
    body.style.removeProperty(CSS_VARIABLE_BODY_TOP);
    body.classList.remove(ACTIVE_CLASS);
    window.scrollTo(0, parseInt(scrollY || '0'));
    active = false;
  }
}
