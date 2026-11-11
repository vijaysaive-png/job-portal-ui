import { cloneElement, useId, useLayoutEffect, useRef, useState } from "react";

// Minimum gap (px) kept between the tooltip and the viewport edge.
const VIEWPORT_MARGIN = 12;

/**
 * Accessible tooltip that opens above its trigger.
 *
 * - Shows on hover and on keyboard focus (and on tap, since tapping focuses).
 * - Dismisses on mouse leave, blur, or Escape.
 * - Shifts horizontally to stay inside the viewport; the arrow stays on the trigger.
 *
 * `children` must be a single focusable element (e.g. a <button>); it receives
 * `aria-describedby` pointing at the tooltip.
 */
export const Tooltip = ({ title, content, children }) => {
  const [open, setOpen] = useState(false);
  const tooltipRef = useRef(null);
  const tooltipId = useId();

  // Keep the bubble on-screen (e.g. the first footer link on narrow phones).
  useLayoutEffect(() => {
    const el = tooltipRef.current;
    if (!open || !el) return;

    el.style.left = "50%";
    const rect = el.getBoundingClientRect();
    const overflowLeft = VIEWPORT_MARGIN - rect.left;
    const overflowRight = rect.right - (window.innerWidth - VIEWPORT_MARGIN);

    let shift = 0;
    if (overflowLeft > 0) shift = overflowLeft;
    else if (overflowRight > 0) shift = -overflowRight;

    el.style.left = `calc(50% + ${shift}px)`;
  }, [open]);

  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  const visibility = open
    ? "visible opacity-100 translate-y-0"
    : "invisible opacity-0 translate-y-1";

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={(e) => {
        if (e.key === "Escape") hide();
      }}
    >
      {cloneElement(children, { "aria-describedby": tooltipId })}

      <span
        ref={tooltipRef}
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute bottom-full left-1/2 z-30 mb-3 w-64 max-w-[calc(100vw-1.5rem)] -translate-x-1/2 overflow-hidden rounded-xl border border-white/10 bg-gray-900 px-4 py-3 text-left shadow-2xl shadow-black/50 transition-all duration-300 ${visibility}`}
      >
        <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary-400 via-purple-400 to-primary-600" />
        {title && (
          <span className="mb-1 block text-sm font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
            {title}
          </span>
        )}
        <span className="block text-xs leading-relaxed text-gray-300">
          {content}
        </span>
      </span>

      {/* Arrow — kept centered on the trigger even when the bubble shifts */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-white/10 bg-gray-900 transition-all duration-300 ${visibility}`}
      />
    </span>
  );
};
