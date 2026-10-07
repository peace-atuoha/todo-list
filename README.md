# My tasks — a simple to-do list

A small to-do app built with **React** and plain **JavaScript**.

- Add tasks, check them off, edit them (pencil, then the check mark to save), delete them
- Tap a task to open it. Inside you can keep adding **subtasks**, and check, edit or remove each one
- Move tasks around: drag them by the handle, or open a task and use "Move up" / "Move down"
- Every delete asks "are you sure?" in a confirmation box first (Cancel is selected by default)
- Deleting never destroys anything: deleted tasks and subtasks go to **Trash**, where you can see them, **restore** them, or **delete them forever** (or empty the whole Trash)
- A row of pills at the top fills in as you finish tasks
- Tasks are saved in your browser (`localStorage`), so they're still there tomorrow
- Light and dark colours follow your device

## How your data is stored

There is no server and no online database. Your tasks (and the Trash) live in your own browser,
in a small storage box that every website gets. This means:

- they stay after you refresh or close the page
- they are **not** shared between devices or between different browsers
- clearing your browser's site data erases them

All the saving and loading code is in `src/storage.js`.

## Run it on your computer

1. Install **Node.js** (version 22 or newer) from https://nodejs.org
2. Open a terminal in this folder and run:

   ```
   npm install
   npm run dev
   ```

3. Open the address it prints (usually http://localhost:5173) in your browser.

Press `Ctrl + C` in the terminal to stop it.

## Put it on GitHub and get a web address

1. On https://github.com click **New repository**, give it a name, and create it
   (leave "Add a README" unticked).
2. In the terminal, inside this folder, run these one at a time
   (replace the address with the one GitHub shows you):

   ```
   git init
   git add .
   git commit -m "First version of my to-do app"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

3. On the repository page go to **Settings → Pages**. Under **Build and deployment**,
   set **Source** to **GitHub Actions**.
4. Open the **Actions** tab. Wait for "Deploy to GitHub Pages" to finish (about a minute).
   If it failed because Pages wasn't switched on yet, click the run and choose **Re-run all jobs**.
5. Your app is now live at `https://YOUR-USERNAME.github.io/YOUR-REPO/`.

From then on, every time you push a change to `main`, the site updates by itself.

## Put it on Netlify instead

Netlify needs the **built** app, not the source files. The file `netlify.toml` already tells it how.

**Easiest way (stays up to date by itself):**
1. On https://app.netlify.com choose **Add new site → Import an existing project** and pick your GitHub repository.
2. Check the settings show **Build command** `npm run build` and **Publish directory** `dist` (they are filled in for you), then click **Deploy**.

**Drag-and-drop way:**
1. On your computer run `npm install` and then `npm run build`. This creates a folder called `dist`.
2. Drag **the `dist` folder** (not the whole project folder) onto the Netlify drop area.

**If the page is blank:** you almost certainly published the project folder instead of `dist`.
Fix the publish directory (or drag `dist` again). If the build itself fails with a Node version
message, add an environment variable `NODE_VERSION` = `22` in Site configuration.

## What's in the folder

| File | What it does |
| --- | --- |
| `src/App.jsx` | The main screen and all the list actions (add, check, move, delete) |
| `src/TaskItem.jsx` | One task, and the panel that opens under it |
| `src/ConfirmDialog.jsx` | The "are you sure?" box used before every delete |
| `src/Trash.jsx` | The Trash screen: restore, delete forever, empty trash |
| `src/Subtasks.jsx` | A subtask row, and the box for adding subtasks |
| `src/InlineEdit.jsx` | The edit box with the check mark (save) and X (cancel) |
| `src/icons.jsx` | The small icons |
| `src/ProgressStrip.jsx` | The row of pills at the top |
| `src/storage.js` | Saving and loading tasks and Trash in the browser |
| `src/styles.css` | Colours and layout |
| `.github/workflows/deploy.yml` | Publishes the site to GitHub Pages |
| `netlify.toml` | Tells Netlify how to build and publish the site |
