import { useEffect, useRef } from "react";

let activeSwipe = null;
let listenersAttached = false;

function setupDocumentListeners() {
  if (listenersAttached) return;
  listenersAttached = true;

  const onMove = (e) => {
    if (!activeSwipe) return;
    const dx = e.touches[0].clientX - activeSwipe.startX;
    const dy = e.touches[0].clientY - activeSwipe.startY;

    if (!activeSwipe.decided) {
      if (Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
      if (Math.abs(dy) >= Math.abs(dx)) {
        activeSwipe = null;
        return;
      }
      activeSwipe.decided = true;
    }

    e.preventDefault();
    const delta = Math.min(0, dx);
    activeSwipe.currentX = delta;
    if (activeSwipe.itemEl) activeSwipe.itemEl.style.transform = `translateX(${delta}px)`;
    if (activeSwipe.bgEl) activeSwipe.bgEl.style.opacity = String(Math.min(1, Math.abs(delta) / activeSwipe.threshold));
  };

  const onEnd = () => {
    if (!activeSwipe) return;
    const { itemEl, bgEl, currentX, threshold, onDelete } = activeSwipe;
    activeSwipe = null;

    if (!itemEl) return;
    itemEl.style.transition = 'transform 0.25s ease';

    if (Math.abs(currentX) >= threshold) {
      itemEl.style.transform = 'translateX(-100%)';
      setTimeout(onDelete, 250);
    } else {
      itemEl.style.transform = 'translateX(0)';
      if (bgEl) {
        bgEl.style.transition = 'opacity 0.25s ease';
        bgEl.style.opacity = '0';
      }
    }
  };

  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('touchend', onEnd);
  document.addEventListener('touchcancel', onEnd);
}

export function useSwipeDelete(onDelete, threshold = 80) {
  const wrapperRef = useRef(null);
  const itemRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    // Chỉ chạy ở client, tránh SSR error
    setupDocumentListeners();

    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const onStart = (e) => {
      if (window.innerWidth >= 768) return;
      if (activeSwipe) return;

      activeSwipe = {
        wrapper,
        itemEl: itemRef.current,
        bgEl: bgRef.current,
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        currentX: 0,
        decided: false,
        onDelete,
        threshold,
      };

      if (itemRef.current) itemRef.current.style.transition = 'none';
      if (bgRef.current) bgRef.current.style.transition = 'none';
    };

    wrapper.addEventListener('touchstart', onStart, { passive: true });

    return () => {
      wrapper.removeEventListener('touchstart', onStart);
      if (activeSwipe?.wrapper === wrapper) activeSwipe = null;
    };
  }, [onDelete, threshold]);

  return { wrapperRef, itemRef, bgRef };
}