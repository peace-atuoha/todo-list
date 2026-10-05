// ---------------------------------------------------------------
// storage.js — the "data layer" of the app, written in plain JavaScript.
//
// Your tasks and your trash are saved in the browser's localStorage
// (a small key/value box that every browser gives each website).
// It works like a tiny database that lives on the visitor's own device:
//   - it survives refreshing the page and closing the browser
//   - it is NOT shared between devices or between different browsers
//   - clearing the browser's site data erases it
// ---------------------------------------------------------------

const TASKS_KEY = "simple-todo:tasks:v1";
const TRASH_KEY = "simple-todo:trash:v1";

// Make a unique id for a new item so we can always tell items apart.
function makeId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// ----- Creating things -----

// A brand-new task. Every task starts with an empty list of subtasks.
export function createTask(text) {
  return { id: makeId(), text, done: false, subtasks: [] };
}

// A brand-new subtask (a small step inside a task).
export function createSubtask(text) {
  return { id: makeId(), text, done: false };
}

// A Trash entry for a deleted task. We remember where it was in the list
// so that "Restore" can put it back in the same spot.
export function trashTask(task, index) {
  return { id: makeId(), kind: "task", deletedAt: Date.now(), index, task };
}

// A Trash entry for a deleted subtask. We remember which task it belonged to.
export function trashSubtask(subtask, parent, index) {
  return {
    id: makeId(),
    kind: "subtask",
    deletedAt: Date.now(),
    index,
    parentId: parent.id,
    parentText: parent.text,
    subtask,
  };
}

// ----- Cleaning up saved data (so a damaged save can never crash the app) -----

// A saved item is only usable if it has a text and an id.
function isValidItem(item) {
  return item && typeof item.id === "string" && typeof item.text === "string";
}

function cleanSubtask(sub) {
  return { id: sub.id, text: sub.text, done: Boolean(sub.done) };
}

function cleanTask(task) {
  return {
    id: task.id,
    text: task.text,
    done: Boolean(task.done),
    // Lists saved by the first version have no subtasks; start them empty.
    subtasks: Array.isArray(task.subtasks) ? task.subtasks.filter(isValidItem).map(cleanSubtask) : [],
  };
}

function isValidEntry(entry) {
  if (!entry || typeof entry.id !== "string" || typeof entry.deletedAt !== "number") return false;
  if (entry.kind === "task") return isValidItem(entry.task);
  if (entry.kind === "subtask") {
    return isValidItem(entry.subtask) && typeof entry.parentId === "string";
  }
  return false;
}

function cleanEntry(entry) {
  const index = Number.isInteger(entry.index) && entry.index >= 0 ? entry.index : 0;
  if (entry.kind === "task") {
    return { id: entry.id, kind: "task", deletedAt: entry.deletedAt, index, task: cleanTask(entry.task) };
  }
  return {
    id: entry.id,
    kind: "subtask",
    deletedAt: entry.deletedAt,
    index,
    parentId: entry.parentId,
    parentText: typeof entry.parentText === "string" ? entry.parentText : "",
    subtask: cleanSubtask(entry.subtask),
  };
}

// ----- Loading and saving -----

// Read a saved list. If nothing is saved yet (or the data is damaged,
// or storage is blocked), we quietly start with an empty list.
function loadList(key, isValid, clean) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValid).map(clean);
  } catch {
    return [];
  }
}

// Save a list. Returns true if it worked, false if the browser refused
// (for example in a private window with storage turned off).
function saveList(key, list) {
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function loadTasks() {
  return loadList(TASKS_KEY, isValidItem, cleanTask);
}

export function saveTasks(tasks) {
  return saveList(TASKS_KEY, tasks);
}

export function loadTrash() {
  return loadList(TRASH_KEY, isValidEntry, cleanEntry);
}

export function saveTrash(trash) {
  return saveList(TRASH_KEY, trash);
}
