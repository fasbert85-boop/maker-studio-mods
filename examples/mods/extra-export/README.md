# Example: Extra Export

Adds an "Export Map as Plain Text..." menu item and a nested context-menu entry
inside the existing "Export Map…" submenu when right-clicking a map in the map
tree. Exports the active (or selected) map's tile data as a human-readable text
grid.

### What it does

1. Registers a menu item under **Import & Export Maps** that is enabled only when
   a map is open.
2. On click, iterates every non-shadow layer, reads tile IDs via `ctx.map.readTile`,
   and saves a `.txt` file via the native save dialog.
3. Registers a **nested map-tree context menu item** using `parentMenu: "Export Map…"`
   — right-click any map in the tree and find "Export as Plain Text…" inside the
   existing Export Map submenu, alongside JSON/PNG/GIF.
4. Also registers a command `extra-export.export-text` so other mods can trigger
   the export programmatically.

### Concepts covered

| Concept               | API used                                      |
|-----------------------|-----------------------------------------------|
| Menu item (disabled state) | `isEnabled: () => ctx.editor.activeMapId() != null` |
| Map iteration         | `ctx.map.info`, `ctx.map.layers`, `ctx.map.readTile` |
| File write (project)  | Tauri `write_text_file` via `window.__TAURI__` |
| Commands              | `ctx.commands.register(...)`, `ctx.commands.execute(...)` |
| Error handling        | `ctx.log.error(...)`, toast on failure        |
| Context menu (map-tree) | `ctx.ui.registerContextMenuItem({ context: "map-tree", ... })` |
| Nested context menu   | `parentMenu: "Export Map…"` — item appears inside existing submenu |

### Try it

1. Copy this folder into `<gameRoot>/Plugins/MakerStudio/003_Editor/Mods/`.
2. Open the editor and load a map.
3. Click **Import & Export Maps → Export Map as Plain Text...** and pick a save location.
4. Or right-click any map in the map tree → hover **Export Map…** → click **Export as Plain Text…**.
