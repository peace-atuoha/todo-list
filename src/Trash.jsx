// "Oct 5, 6:30 PM" style text for when something was deleted.
function formatWhen(milliseconds) {
  try {
    return new Date(milliseconds).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function TrashRow({ entry, parent, onRestore, onDeleteForever }) {
  const isTask = entry.kind === "task";
  const name = isTask ? entry.task.text : entry.subtask.text;
  const subtaskCount = isTask ? entry.task.subtasks.length : 0;

  let detail = "Task";
  if (isTask && subtaskCount > 0) {
    detail = `Task with ${subtaskCount} subtask${subtaskCount === 1 ? "" : "s"}`;
  }
  if (!isTask) {
    detail = `Subtask of "${parent ? parent.text : entry.parentText}"`;
  }

  // A subtask can only come back into a task that is on your list.
  const canRestore = isTask || Boolean(parent);

  return (
    <li className="trash-row">
      <div className="trash-info">
        <span className="text">{name}</span>
        <span className="meta">{detail}</span>
        <span className="meta">Deleted {formatWhen(entry.deletedAt)}</span>
        {!canRestore && <span className="meta warn">Restore its task first.</span>}
      </div>

      <div className="trash-actions">
        <button
          type="button"
          className="tool"
          onClick={() => onRestore(entry.id)}
          disabled={!canRestore}
          aria-label={`Restore "${name}"`}
        >
          Restore
        </button>
        <button
          type="button"
          className="tool danger"
          onClick={() => onDeleteForever(entry.id)}
          aria-label={`Delete "${name}" forever`}
        >
          Delete forever
        </button>
      </div>
    </li>
  );
}

// The Trash screen: everything you deleted, newest first.
export default function Trash({ trash, tasks, onRestore, onDeleteForever, onEmpty }) {
  if (trash.length === 0) {
    return <p className="empty">Trash is empty. Deleted tasks and subtasks will show up here.</p>;
  }

  return (
    <section className="trash">
      <p className="hint">Deleted items stay here until you delete them forever.</p>

      <ul className="list">
        {trash.map((entry) => (
          <TrashRow
            key={entry.id}
            entry={entry}
            parent={entry.kind === "subtask" ? tasks.find((task) => task.id === entry.parentId) : null}
            onRestore={onRestore}
            onDeleteForever={onDeleteForever}
          />
        ))}
      </ul>

      <footer>
        <button type="button" className="tool danger" onClick={onEmpty}>
          Empty trash
        </button>
      </footer>
    </section>
  );
}
