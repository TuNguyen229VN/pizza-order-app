import { useEffect } from "react";

export function useLockBodyScroll(lock) {
  useEffect(() => {
    if (!lock) return;

    const mq = window.matchMedia("(max-width: 767px)");
    if (!mq.matches) return;

    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    const prevOverscroll = html.style.overscrollBehavior;

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    return () => {
      html.style.overflow = prevOverflow;
      html.style.overscrollBehavior = prevOverscroll;
    };
  }, [lock]);
}