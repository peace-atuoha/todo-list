import { useEffect, useRef, useState } from "react";
import { CheckIcon, CloseIcon } from "./icons.jsx";

// A text box for changing a task or subtask.
// Press Enter or tap the check mark to save, Escape or the X to cancel.
export default function InlineEdit({ initial, label, onSave, onCancel }) {
  const [value, setValue] = useState(initial);
  const inputRef = useRef(null);

  // Put the cursor in the box straight away, with the old text selected.
  useEffect(() => {
    inputRef.current.focus();
    inputRef.current.select();
  }, []);

  const canSave = value.trim().length > 0;

  function submit(event) {
    event.preventDefault();
    if (canSave) onSave(value.trim());
  }

  return (
    <form className="inline-edit" onSubmit={submit}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        aria-label={label}
        maxLength={200}
        autoComplete="off"
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            onCancel();
          }
        }}
      />
      <button type="submit" className="icon save" disabled={!canSave} aria-label="Save">
        <CheckIcon />
      </button>
      <button type="button" className="icon" onClick={onCancel} aria-label="Cancel">
        <CloseIcon />
      </button>
    </form>
  );
}

// After an edit box closes, put keyboard focus back on the pencil button
// so people using the keyboard don't lose their place.
export function useReturnFocus(editing, buttonRef) {
  const wasEditing = useRef(false);
  useEffect(() => {
    if (wasEditing.current && !editing && buttonRef.current) {
      buttonRef.current.focus();
    }
    wasEditing.current = editing;
  }, [editing, buttonRef]);
}
