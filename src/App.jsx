import { useEffect, useRef, useState } from "react";
import {
  createSubtask,
  createTask,
  loadTasks,
  loadTrash,
  saveTasks,
  saveTrash,
  trashSubtask,
  trashTask,
} from "./storage.js";
import ConfirmDialog from "./ConfirmDialog.jsx";
import ProgressStrip from "./ProgressStrip.jsx";
import TaskItem from "./TaskItem.jsx";
import Trash from "./Trash.jsx";
import { TrashIcon } from "./icons.jsx";

// Returns a new list with the item at `from` moved to position `to`.
function moveItem(list, from, to) {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// Returns a new list with `item` put in at `index` (or at the end if the list is shorter now).
function insertAt(list, index, item) {
  const next = [...list];
  next.splice(Math.min(index, next.length), 0, item);
  return next;
}

export default function App() {
  // The list of tasks, and the Trash. Both start from what was saved in the browser.
  const [tasks, setTasks] = useState(loadTasks);
  const [trash, setTrash] = useState(loadTrash);
  // Which screen we are on: "tasks" or "trash".
  const [view, setView] = useState("tasks");
  // What the person is typing in the "new task" box.
  const [draft, setDraft] = useState("");
  // Which task is being dragged, and which one it is hovering over.
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  // True if the browser refused to save (e.g. storage is blocked).
  const [saveFailed, setSaveFailed] = useState(false);
  // The delete the person has asked for but not yet confirmed (or null).
  const [pending, setPending] = useState(null);
  // Remembers which arrow button to focus again after a task moves.
  const pendingFocus = useRef(null);

  // Every time the tasks or the trash change, save them to the browser.
  useEffect(() => {
    const tasksSaved = saveTasks(tasks);
    const trashSaved = saveTrash(trash);
    setSaveFailed(!(tasksSaved && trashSaved));
  }, [tasks, trash]);

  // Keep keyboard focus on the arrow the person just used.
  useEffect(() => {
    const target = pendingFocus.current;
    if (!target) return;
    pendingFocus.current = null;
    const row = document.querySelector(`[data-task-id="${target.id}"]`);
    if (!row) return;
    const opposite = target.direction === "up" ? "down" : "up";
    const wanted = row.querySelector(`[data-action="${target.direction}"]`);
    const fallback = row.querySelector(`[data-action="${opposite}"]`);
    const button = wanted && !wanted.disabled ? wanted : fallback;
    if (button) button.focus();
  }, [tasks]);

  // ---------- Tasks ----------

  function addTask(event) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setTasks((current) => [createTask(text), ...current]); // newest at the top
    setDraft("");
  }

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task))
    );
  }

  function editTask(id, text) {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, text } : task)));
  }

  // Deleting doesn't destroy anything: the task (with all its subtasks) moves to the Trash.
  function removeTask(id) {
    const index = tasks.findIndex((task) => task.id === id);
    if (index < 0) return;
    const entry = trashTask(tasks[index], index);
    setTrash((current) => [entry, ...current]);
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  // "Clear completed" also moves things to the Trash, so nothing is lost by accident.
  function clearDone() {
    const entries = [];
    tasks.forEach((task, index) => {
      if (task.done) entries.push(trashTask(task, index));
    });
    if (entries.length === 0) return;
    setTrash((current) => [...entries, ...current]);
    setTasks((current) => current.filter((task) => !task.done));
  }

  function moveTask(id, direction) {
    pendingFocus.current = { id, direction };
    setTasks((current) => {
      const from = current.findIndex((task) => task.id === id);
      const to = direction === "up" ? from - 1 : from + 1;
      if (from < 0 || to < 0 || to >= current.length) return current;
      return moveItem(current, from, to);
    });
  }

  // ---------- Subtasks: every one of these changes the subtasks of a single task ----------

  function changeSubtasks(taskId, change) {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId ? { ...task, subtasks: change(task.subtasks) } : task
      )
    );
  }

  function addSubtask(taskId, text) {
    changeSubtasks(taskId, (subtasks) => [...subtasks, createSubtask(text)]);
  }

  function toggleSubtask(taskId, subId) {
    changeSubtasks(taskId, (subtasks) =>
      subtasks.map((sub) => (sub.id === subId ? { ...sub, done: !sub.done } : sub))
    );
  }

  function editSubtask(taskId, subId, text) {
    changeSubtasks(taskId, (subtasks) =>
      subtasks.map((sub) => (sub.id === subId ? { ...sub, text } : sub))
    );
  }

  // Removing a subtask also sends it to the Trash.
  function removeSubtask(taskId, subId) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    const index = task.subtasks.findIndex((sub) => sub.id === subId);
    if (index < 0) return;
    const entry = trashSubtask(task.subtasks[index], task, index);
    setTrash((current) => [entry, ...current]);
    changeSubtasks(taskId, (subtasks) => subtasks.filter((sub) => sub.id !== subId));
  }

  // ---------- Trash ----------

  function restoreFromTrash(entryId) {
    const entry = trash.find((item) => item.id === entryId);
    if (!entry) return;

    if (entry.kind === "task") {
      setTasks((current) => insertAt(current, entry.index, entry.task));
    } else {
      // A subtask can only go back into a task that is on the list.
      if (!tasks.some((task) => task.id === entry.parentId)) return;
      changeSubtasks(entry.parentId, (subtasks) => insertAt(subtasks, entry.index, entry.subtask));
    }
    setTrash((current) => current.filter((item) => item.id !== entryId));
  }

  function deleteForever(entryId) {
    const entry = trash.find((item) => item.id === entryId);
    if (!entry) return;
    setTrash((current) =>
      current.filter((item) => {
        if (item.id === entryId) return false;
        // Subtasks that belonged to a task which is now gone for good can't be restored any more.
        const orphan =
          entry.kind === "task" && item.kind === "subtask" && item.parentId === entry.task.id;
        return !orphan;
      })
    );
  }

  function emptyTrash() {
    setTrash([]);
  }

  // ---------- Asking "are you sure?" before deleting ----------
  // Delete buttons don't delete straight away. They save what the person wants
  // to delete in `pending`, and the box below asks them to confirm.

  function describePending() {
    if (!pending) return null;
    const plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;

    if (pending.type === "task") {
      const task = tasks.find((item) => item.id === pending.id);
      if (!task) return null;
      const count = task.subtasks.length;
      return {
        title: "Delete this task?",
        message:
          count > 0
            ? `"${task.text}" and its ${plural(count, "subtask")} will move to Trash. You can restore them from there.`
            : `"${task.text}" will move to Trash. You can restore it from there.`,
        confirmLabel: "Delete",
      };
    }

    if (pending.type === "subtask") {
      const task = tasks.find((item) => item.id === pending.taskId);
      const subtask = task && task.subtasks.find((item) => item.id === pending.subId);
      if (!subtask) return null;
      return {
        title: "Delete this subtask?",
        message: `"${subtask.text}" will move to Trash. You can restore it from there.`,
        confirmLabel: "Delete",
      };
    }

    if (pending.type === "completed") {
      return {
        title: `Move ${plural(doneCount, "completed task")} to Trash?`,
        message: "You can restore them from Trash.",
        confirmLabel: "Move to Trash",
      };
    }

    if (pending.type === "forever") {
      const entry = trash.find((item) => item.id === pending.entryId);
      if (!entry) return null;
      let message;
      if (entry.kind === "task") {
        const count = entry.task.subtasks.length;
        const earlier = trash.filter(
          (item) => item.kind === "subtask" && item.parentId === entry.task.id
        ).length;
        message = `"${entry.task.text}"${count > 0 ? ` and its ${plural(count, "subtask")}` : ""} will be deleted forever.`;
        if (earlier > 0) {
          message += ` The ${plural(earlier, "subtask")} you deleted from it earlier will go too.`;
        }
      } else {
        message = `"${entry.subtask.text}" will be deleted forever.`;
      }
      return {
        title: "Delete forever?",
        message: `${message} This can't be undone.`,
        confirmLabel: "Delete forever",
      };
    }

    if (pending.type === "empty") {
      return {
        title: "Empty the Trash?",
        message: `${plural(trash.length, "item")} will be deleted forever. This can't be undone.`,
        confirmLabel: "Delete all",
      };
    }

    return null;
  }

  function confirmPending() {
    const choice = pending;
    setPending(null);
    if (choice.type === "task") removeTask(choice.id);
    if (choice.type === "subtask") removeSubtask(choice.taskId, choice.subId);
    if (choice.type === "completed") clearDone();
    if (choice.type === "forever") deleteForever(choice.entryId);
    if (choice.type === "empty") emptyTrash();
  }

  // ---------- Dragging ----------

  function endDrag() {
    setDragId(null);
    setOverId(null);
  }

  function dropOn(targetId) {
    const movingId = dragId;
    if (movingId && movingId !== targetId) {
      setTasks((current) => {
        const from = current.findIndex((task) => task.id === movingId);
        const to = current.findIndex((task) => task.id === targetId);
        if (from < 0 || to < 0) return current;
        return moveItem(current, from, to);
      });
    }
    endDrag();
  }

  const inTrash = view === "trash";
  const total = tasks.length;
  const doneCount = tasks.filter((task) => task.done).length;
  const dragIndex = tasks.findIndex((task) => task.id === dragId);

  const dialog = describePending();

  let status = "";
  if (total > 0) {
    status = doneCount === total ? "All done. Nice work." : `${doneCount} of ${total} done`;
  }

  return (
    <>
      <main className="app" inert={dialog ? true : undefined}>
        <header>
          <div className="top">
            <h1>{inTrash ? "Trash" : "My tasks"}</h1>
            {inTrash ? (
              <button type="button" className="pill" onClick={() => setView("tasks")}>
                Back to tasks
              </button>
            ) : (
              <button type="button" className="pill" onClick={() => setView("trash")}>
                <TrashIcon /> Trash
                {trash.length > 0 && (
                  <span className="badge">
                    <span aria-hidden="true">{trash.length}</span>
                    <span className="sr-only">{trash.length} items</span>
                  </span>
                )}
              </button>
            )}
          </div>
          {!inTrash && total > 0 && (
            <>
              <ProgressStrip tasks={tasks} />
              <p className="status" aria-live="polite">
                {status}
              </p>
            </>
          )}
        </header>

        {saveFailed && (
          <p className="notice" role="alert">
            Your browser is blocking storage, so these tasks won't be here after you close the page.
          </p>
        )}

        {/* The tasks screen stays on the page (just hidden) while you look at the
            Trash, so open tasks and a half-typed task are still there when you come back. */}
        <div hidden={inTrash}>
          <form className="add" onSubmit={addTask}>
            <label className="sr-only" htmlFor="new-task">
              New task
            </label>
            <input
              id="new-task"
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="What needs doing?"
              maxLength={200}
              autoComplete="off"
            />
            <button type="submit" disabled={!draft.trim()}>
              Add task
            </button>
          </form>

          {total === 0 ? (
            <p className="empty">Your list is empty. Add your first task above, then tap it to add subtasks.</p>
          ) : (
            <ul className="list">
              {tasks.map((task, index) => {
                const isTarget = dragId && overId === task.id && dragId !== task.id;
                const dropEdge = isTarget ? (dragIndex < index ? "below" : "above") : null;
                return (
                  <TaskItem
                    key={task.id}
                    task={task}
                    index={index}
                    total={total}
                    dropEdge={dropEdge}
                    isDragging={dragId === task.id}
                    onToggle={toggleTask}
                    onEdit={editTask}
                    onRemove={(id) => setPending({ type: "task", id })}
                    onMove={moveTask}
                    onAddSubtask={addSubtask}
                    onToggleSubtask={toggleSubtask}
                    onEditSubtask={editSubtask}
                    onRemoveSubtask={(taskId, subId) => setPending({ type: "subtask", taskId, subId })}
                    onDragStart={setDragId}
                    onDragOver={setOverId}
                    onDrop={dropOn}
                    onDragEnd={endDrag}
                  />
                );
              })}
            </ul>
          )}

          {total > 0 && (
            <p className="hint">
              Tap a task to open it, add subtasks, or move it. The pencil edits it. Deleted items go to Trash.
            </p>
          )}

          {doneCount > 0 && (
            <footer>
              <button type="button" className="link" onClick={() => setPending({ type: "completed" })}>
                Move {doneCount} completed to Trash
              </button>
            </footer>
          )}
        </div>

        {inTrash && (
          <Trash
            trash={trash}
            tasks={tasks}
            onRestore={restoreFromTrash}
            onDeleteForever={(entryId) => setPending({ type: "forever", entryId })}
            onEmpty={() => setPending({ type: "empty" })}
          />
        )}
      </main>

      {dialog && (
        <ConfirmDialog
          title={dialog.title}
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          onConfirm={confirmPending}
          onCancel={() => setPending(null)}
        />
      )}
    </>
  );
}
