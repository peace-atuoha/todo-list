import { useRef, useState } from "react";
import InlineEdit, { useReturnFocus } from "./InlineEdit.jsx";
import { AddSubtask, SubtaskRow } from "./Subtasks.jsx";
import { ArrowIcon, ChevronIcon, GripIcon, PencilIcon, TrashIcon } from "./icons.jsx";

// One task in the list. Tap its title to open a panel underneath with
// its subtasks, plus buttons to move or delete the task.
export default function TaskItem({
  task,
  index,
  total,
  dropEdge,
  isDragging,
  onToggle,
  onEdit,
  onRemove,
  onMove,
  onAddSubtask,
  onToggleSubtask,
  onEditSubtask,
  onRemoveSubtask,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  const [open, setOpen] = useState(false); // is the panel showing?
  const [editing, setEditing] = useState(false); // is the title being edited?
  const editButton = useRef(null);
  useReturnFocus(editing, editButton);

  const panelId = `panel-${task.id}`;
  const subtaskCount = task.subtasks.length;
  const subtasksDone = task.subtasks.filter((sub) => sub.done).length;

  return (
    <li
      className="row"
      data-task-id={task.id}
      data-done={task.done}
      data-open={open || undefined}
      data-drop={dropEdge || undefined}
      data-dragging={isDragging || undefined}
      onDragOver={(event) => {
        event.preventDefault(); // lets this row accept a drop
        event.dataTransfer.dropEffect = "move";
        onDragOver(task.id);
      }}
      onDrop={(event) => {
        event.preventDefault();
        onDrop(task.id);
      }}
    >
      <div className="row-main">
        {/* Only the handle can be dragged, so typing in boxes still works normally. */}
        <span
          className="grip"
          aria-hidden="true"
          draggable={!editing}
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", task.id); // Firefox needs this
            if (event.dataTransfer.setDragImage) {
              event.dataTransfer.setDragImage(event.currentTarget.closest("li"), 24, 24);
            }
            onDragStart(task.id);
          }}
          onDragEnd={onDragEnd}
        >
          <GripIcon />
        </span>

        <label className="tick">
          <input
            type="checkbox"
            checked={task.done}
            onChange={() => onToggle(task.id)}
            aria-label={`Mark "${task.text}" as done`}
          />
        </label>

        {editing ? (
          <InlineEdit
            initial={task.text}
            label="Edit task"
            onSave={(text) => {
              onEdit(task.id, text);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <button
              type="button"
              className="title"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((isOpen) => !isOpen)}
            >
              <span className="text">{task.text}</span>
              {subtaskCount > 0 && (
                <span className="count">
                  <span aria-hidden="true">
                    {subtasksDone}/{subtaskCount}
                  </span>
                  <span className="sr-only">
                    {subtasksDone} of {subtaskCount} subtasks done
                  </span>
                </span>
              )}
              <ChevronIcon />
            </button>
            <button
              ref={editButton}
              type="button"
              className="icon"
              onClick={() => setEditing(true)}
              aria-label={`Edit "${task.text}"`}
            >
              <PencilIcon />
            </button>
          </>
        )}
      </div>

      {open && (
        <div className="panel" id={panelId}>
          <div className="toolbar" role="group" aria-label={`Options for "${task.text}"`}>
            <button
              type="button"
              className="tool"
              data-action="up"
              onClick={() => onMove(task.id, "up")}
              disabled={index === 0}
            >
              <ArrowIcon direction="up" /> Move up
            </button>
            <button
              type="button"
              className="tool"
              data-action="down"
              onClick={() => onMove(task.id, "down")}
              disabled={index === total - 1}
            >
              <ArrowIcon direction="down" /> Move down
            </button>
            <button type="button" className="tool danger" onClick={() => onRemove(task.id)}>
              <TrashIcon /> Delete
            </button>
          </div>

          {subtaskCount > 0 && (
            <ul className="subs">
              {task.subtasks.map((subtask) => (
                <SubtaskRow
                  key={subtask.id}
                  subtask={subtask}
                  onToggle={(subId) => onToggleSubtask(task.id, subId)}
                  onEdit={(subId, text) => onEditSubtask(task.id, subId, text)}
                  onRemove={(subId) => onRemoveSubtask(task.id, subId)}
                />
              ))}
            </ul>
          )}

          <AddSubtask onAdd={(text) => onAddSubtask(task.id, text)} />
        </div>
      )}
    </li>
  );
}
