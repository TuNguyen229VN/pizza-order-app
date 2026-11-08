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

    let startY = 0;

    const onTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };

    const onTouchMove = (e) => {
      const scroller = e.target.closest?.("[data-scrollable]");

      // Ngoài menu: chặn hẳn, trang nền không cuộn
      if (!scroller) {
        e.preventDefault();
        return;
      }

      // Trong menu: chặn khi đã chạm đỉnh/đáy (iOS cũ sẽ cuộn xuyên)
      const dy = e.touches[0].clientY - startY;
      const atTop = scroller.scrollTop <= 0;
      const atBottom =
        scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;

      if ((atTop && dy > 0) || (atBottom && dy < 0)) {
        e.preventDefault();
      }
    };

    // document.addEventListener("touchstart", onTouchStart, { passive: true });
    // document.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      html.style.overflow = prevOverflow;
      html.style.overscrollBehavior = prevOverscroll;
      // document.removeEventListener("touchstart", onTouchStart);
      // document.removeEventListener("touchmove", onTouchMove);
    };
  }, [lock]);
}