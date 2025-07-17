import * as React from "react";
import { observer } from "mobx-react-lite";
import ChatMessage from "../ChatMessage";
import { useChatControllerContext } from "../../helpers/ChatControllerContext.ts";
import _throttle from "lodash/throttle";
import style from "./ChatMessages.module.scss";

const observeConfig: MutationObserverInit = { childList: true, subtree: true };
const getScrollBottom = (el: HTMLDivElement) => el.scrollHeight - el.scrollTop - el.clientHeight;

type Props = Record<string, never>;

const ChatMessages: React.FC<Props> = () => {
  const chatController = useChatControllerContext();

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const lastScrollBottomRef = React.useRef<number | null>(null);
  const observerRef = React.useRef<MutationObserver | null>(null);

  React.useEffect(() => {
    const observer = new MutationObserver(_throttle(() => {
      const currentEl = containerRef.current;
      const lastScrollBottom = lastScrollBottomRef.current;
      if (!currentEl || typeof lastScrollBottom !== "number") return;
      currentEl.scrollTop = currentEl.scrollHeight - currentEl.clientHeight - lastScrollBottom;
    }, 300));
    observerRef.current = observer;
    const currentEl = containerRef.current;
    if (currentEl) {
      observer.observe(currentEl, observeConfig);
      // const el = document.documentElement;
      // el.scrollTo(0, el.scrollHeight);
    }
    return () => {
      observer.disconnect();
    };
  }, []);

  // React.useEffect(() => {
  //   when(() => Boolean(chatController.messages)).then(() => {
  //     const el = document.documentElement;
  //     el.scrollTo(0, el.scrollHeight);
  //   });
  // });

  const setContainerRef = (el: HTMLDivElement) => {
    const currentEl = containerRef.current;
    const observer = observerRef.current;
    if (currentEl) lastScrollBottomRef.current = getScrollBottom(currentEl);
    if (observer && el && currentEl !== el) {
      observer.observe(el, observeConfig);
    }
    containerRef.current = el;
  };

  const messages = [];
  if (chatController.messages) {
    for (let i = chatController.messages.length - 1; i >= 0; i--) {
      const message = chatController.messages[i];
      messages.push(<ChatMessage key={message.id} chatMessage={message} />);
    }
  }

  if (!chatController.flow) return <div>Flow not found</div>;
  return (
    <div
      ref={setContainerRef}
      className={style.container}
      onScroll={(e) => {
        lastScrollBottomRef.current = getScrollBottom(e.currentTarget);
      }}
    >
      <div className={style.content}>
        {messages}
      </div>
    </div>
  );
};

export default observer(ChatMessages) as typeof ChatMessages;
