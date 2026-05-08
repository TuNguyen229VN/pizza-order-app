import { useEffect } from 'react';

export function useLockBodyScroll(lock) {
  useEffect(() => {
    if (lock) {
      // Lưu lại style cũ để khôi phục chính xác
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = "hidden";
      // document.body.style.setProperty("overflow", "hidden", "important");
      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [lock]);
}