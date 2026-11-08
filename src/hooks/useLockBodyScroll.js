import { useEffect } from 'react';

export function useLockBodyScroll(lock) {
  useEffect(() => {
    if (!lock) return;

    const mq = window.matchMedia("(max-width: 767px)");
    let cleanup = null;

    const apply = () => {
      cleanup?.();
      cleanup = null;
      if (!mq.matches) return;

      const scrollY = window.scrollY;
      const { style: bodyStyle } = document.body;
      const prev = {
        overflow: bodyStyle.overflow,
        position: bodyStyle.position,
        top: bodyStyle.top,
        width: bodyStyle.width,
      };

      bodyStyle.overflow = "hidden";
      bodyStyle.position = "fixed";   // chặn cuộn trên iOS
      bodyStyle.top = `-${scrollY}px`;
      bodyStyle.width = "100%";

      cleanup = () => {
        Object.assign(bodyStyle, prev);
        window.scrollTo(0, scrollY);  // trả lại vị trí cuộn
      };
    };

    apply();
    mq.addEventListener("change", apply);

    return () => {
      mq.removeEventListener("change", apply);
      cleanup?.();
    };
  }, [lock]);
}