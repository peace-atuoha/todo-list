import { useRef, useState } from "react";
import InlineEdit, { useReturnFocus } from "./InlineEdit.jsx";
import { CloseIcon, PencilIcon, PlusIcon } from "./icons.jsx";

// One subtask: tick it, edit it, or remove it.
export function SubtaskRow({ subtask, onToggle, onEdit, onRemove }) {
  const [editing, setEditing] = useState(false);
  const editButton = useRef(null);
  useReturnFocus(editing, editButton);

  if (editing) {
    return (
      <li className="sub" data-done={subtask.done}>
        <InlineEdit
          initial={subtask.text}
          label="Edit subtask"
          onSave={(text) => {
            onEdit(subtask.id, text);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <li className="sub" data-done={subtask.done}>
      <label className="check">
        <input type="checkbox" checked={subtask.done} onChange={() => onToggle(subtask.id)} />
        <span className="text">{subtask.text}</span>
      </label>
      <button
        ref={editButton}
        type="button"
        className="icon"
        onClick={() => setEditing(true)}
        aria-label={`Edit subtask "${subtask.text}"`}
      >
        <PencilIcon />
      </button>
      <button
        type="button"
        className="icon remove"
        onClick={() => onRemove(subtask.id)}
        aria-label={`Remove subtask "${subtask.text}"`}
      >
        <CloseIcon />
      </button>
    </li>
  );
}

// The box at the bottom of an open task for adding another subtask.
// The list can keep growing: add as many as you like.
export function AddSubtask({ onAdd }) {
  const [text, setText] = useState("");

  function submit(event) {
    event.preventDefault();
    const clean = text.trim();
    if (!clean) return;
    onAdd(clean);
    setText("");
  }

  return (
    <form className="add-sub" onSubmit={submit}>
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Add a subtask"
        aria-label="New subtask"
        maxLength={200}
        autoComplete="off"
      />
      <button type="submit" className="icon save" disabled={!text.trim()} aria-label="Add subtask">
        <PlusIcon />
      </button>
    </form>
  );
}
