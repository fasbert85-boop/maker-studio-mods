# Example: Quick Tools

Keyboard shortcuts for view toggles and a fill-layer tool. Demonstrates menu
checkmarks, undo grouping, and batch tile writes.

### What it does

1. Registers shortcuts **Ctrl+Shift+G** (toggle grid), **Ctrl+Shift+C**
   (toggle collision), **Ctrl+Shift+E** (toggle events) via `registerShortcut`.
2. Adds **View** menu items for each toggle with `isChecked` showing the current
   state.
3. Adds **Mods → Fill Layer with Tile 0** — fills the entire active layer with
   tile 0 as a single undo operation via `beginUndoGroup`/`batchWrite`/`endUndoGroup`.

### Concepts covered

| Concept               | API used                                              |
|-----------------------|-------------------------------------------------------|
| Keyboard shortcuts    | `ctx.ui.registerShortcut("Ctrl+Shift+G", ...)`       |
| View toggles (read)   | `ctx.editor.viewOptions()`                            |
| View toggles (write)  | `ctx.editor.setViewOptions({ showGrid: !vo.showGrid })` |
| Menu checkmarks       | `isChecked: () => ctx.editor.viewOptions().showGrid`  |
| Undo grouping         | `ctx.map.beginUndoGroup(label)` / `ctx.map.endUndoGroup()` |
| Batch tile write      | `ctx.map.batchWrite(mapId, layer, tiles, label)`      |

### Undo grouping pattern

`beginUndoGroup` / `endUndoGroup` wraps multiple tile operations into a single
undo entry. Without grouping, each `batchWrite` would be a separate undo step.

```js
ctx.map.beginUndoGroup("Fill layer with tile 0");
ctx.map.batchWrite(mapId, layer, tiles, "fill");
ctx.map.endUndoGroup();
// User presses Ctrl+Z once → entire fill is undone
```

### Try it

1. Copy this folder into `<gameRoot>/Plugins/MakerStudio/003_Editor/Mods/`.
2. Open the editor and load a map.
3. Press **Ctrl+Shift+G** — grid toggles on/off.
4. Check the **View** menu — Grid/Collision/Events items show checkmarks.
5. Click **Mods → Fill Layer with Tile 0** — entire layer fills. Press **Ctrl+Z** — entire fill undone in one step.
