// FlyingButton.jsx
import { useRef, useImperativeHandle, forwardRef } from "react";

const FlyingButton = forwardRef(function FlyingButton({
    targetTop = "6%",
    targetLeft = "80%",
    src="/images/red.png",
    children,
    className = "",
    onClick
}, ref) {
    const btnRef = useRef(null);

    function triggerFly() {
        const btn = btnRef.current;
        if (!btn) return;

        const btnRect = btn.getBoundingClientRect();
        if (btnRect.width === 0 && btnRect.height === 0) {
            onClick?.();
            return;
        }

        const viewW = window.innerWidth;
        const viewH = window.innerHeight;
        const endX = (parseFloat(targetLeft) / 100) * viewW - 24;
        const endY = (parseFloat(targetTop) / 100) * viewH - 24;
        const startX = btnRect.left + btnRect.width / 2 - 24;
        const startY = btnRect.top + btnRect.height / 2 - 24;

        const dot = document.createElement("div");
        dot.style.cssText = `
          position: fixed;
          width: 48px; height: 48px;
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          left: ${startX}px; top: ${startY}px;
          font-size: 28px;
          display: flex; align-items: center; justify-content: center;
        `;

        if (src?.startsWith("http") || src?.startsWith("/")) {
            const img = document.createElement("img");
            img.src = src;
            img.style.cssText = "width:100%;height:100%;object-fit:cover;border-radius:50%;";
            dot.appendChild(img);
        } else {
            dot.textContent = src;
        }

        document.body.appendChild(dot);

        const duration = 700;
        const startTime = performance.now();
        const onClickCallback = onClick;

        function step(now) {
            const t = Math.min((now - startTime) / duration, 1);
            const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            const x = startX + (endX - startX) * ease;
            const y = startY + (endY - startY) * ease;
            const arc = -120 * Math.sin(Math.PI * t);
            dot.style.left = x + "px";
            dot.style.top = y + arc + "px";
            dot.style.opacity = t > 0.85 ? String(1 - (t - 0.85) / 0.15) : "1";
            dot.style.transform = `scale(${1 - t * 0.4})`;
            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                dot.remove();
                onClickCallback?.();
            }
        }

        requestAnimationFrame(step);
    }

    // expose triggerFly ra ngoài để gọi thủ công
    useImperativeHandle(ref, () => ({ triggerFly }));

    return (
        <div ref={btnRef} onClick={triggerFly} style={{ display: "inline-block" }} className={className}>
            {children}
        </div>
    );
});

export default FlyingButton;