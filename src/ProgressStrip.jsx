// A row of small pills, one for each task, in the same order as the list.
// A pill fills in when its task is checked off. For very long lists
// it switches to one simple bar so the pills don't get too tiny.

const MAX_SEGMENTS = 40;

export default function ProgressStrip({ tasks }) {
  const doneCount = tasks.filter((task) => task.done).length;
  const label = `${doneCount} of ${tasks.length} tasks done`;

  if (tasks.length > MAX_SEGMENTS) {
    const percent = (doneCount / tasks.length) * 100;
    return (
      <div className="strip strip-solid" role="img" aria-label={label}>
        <div className="strip-fill" style={{ width: `${percent}%` }} />
      </div>
    );
  }

  return (
    <div className="strip" role="img" aria-label={label}>
      {tasks.map((task) => (
        <span key={task.id} className="seg" data-done={task.done} />
      ))}
    </div>
  );
}
