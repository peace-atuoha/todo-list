// Small icons used around the app. They are plain SVG drawings,
// so there is nothing extra to install.

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function GripIcon() {
  return (
    <svg width="14" height="20" viewBox="0 0 14 20" aria-hidden="true">
      <g fill="currentColor">
        <circle cx="4" cy="4" r="1.6" />
        <circle cx="10" cy="4" r="1.6" />
        <circle cx="4" cy="10" r="1.6" />
        <circle cx="10" cy="10" r="1.6" />
        <circle cx="4" cy="16" r="1.6" />
        <circle cx="10" cy="16" r="1.6" />
      </g>
    </svg>
  );
}

export function ArrowIcon({ direction }) {
  const d = direction === "up" ? "M4 10.5 8 6.5l4 4" : "M4 5.5 8 9.5l4-4";
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" {...line}>
      <path d={d} />
    </svg>
  );
}

export function ChevronIcon() {
  return (
    <svg className="chev" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" {...line}>
      <path d="m4 6 4 4 4-4" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" {...line}>
      <path d="m4 4 8 8M12 4l-8 8" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" {...line} strokeWidth="2.2">
      <path d="m3.5 8.5 3 3 6-6.5" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" {...line} strokeWidth="2">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

export function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" {...line}>
      <path d="m10.5 3 2.5 2.5L5.5 13H3v-2.5L10.5 3Z" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" {...line}>
      <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5" />
    </svg>
  );
}
