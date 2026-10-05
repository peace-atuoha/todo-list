import { useEffect, useRef } from "react";

// A box that appears over the page asking "are you sure?".
// - "Cancel" is selected first, so pressing Enter by accident keeps your data safe
// - Escape, or tapping the dark area outside the box, also cancels
export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }) {
  const cancelButton = useRef(null);
  const confirmButton = useRef(null);

  // When the box opens, move focus into it. When it closes, give focus back
  // to whatever the person was on before (if that button still exists).
  useEffect(() => {
    const before = document.activeElement;
    cancelButton.current.focus();
    return () => {
      if (before && before.isConnected && before.focus) before.focus();
    };
  }, []);

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
      return;
    }
    // Keep Tab inside the box by looping between its two buttons.
    if (event.key === "Tab") {
      const first = cancelButton.current;
      const last = confirmButton.current;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  return (
    <div
      className="scrim"
      onKeyDown={handleKeyDown}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        className="dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-message"
      >
        <h2 id="dialog-title">{title}</h2>
        <p id="dialog-message">{message}</p>
        <div className="dialog-actions">
          <button ref={cancelButton} type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button ref={confirmButton} type="button" className="btn danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
