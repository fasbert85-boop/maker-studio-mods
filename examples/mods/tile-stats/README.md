# Example: Tile Stats

Opens a Dockview panel showing a live histogram of tile usage counts for the
active map's current layer. Updates in real time as you paint. Shows current
view options in the footer.

### What it does

1. Registers a **Tile Stats** panel on activation.
2. The panel reads every tile on the active layer and displays the top 20 tile
   IDs as bar charts, showing the layer name.
3. Subscribes to `map.batch.changed` and `map.loaded` to refresh live as you
   paint.
4. Shows a footer with current view toggle states (Grid, Collision, Events,
   Dim, Dark) via `viewOptions()`.

### Concepts covered

| Concept               | API used                                              |
|-----------------------|-------------------------------------------------------|
| Panel registration    | `ctx.ui.registerPanel({ id, title, render, ... })`    |
| Vanilla DOM rendering | `render(host: HTMLElement)` — no framework required    |
| Live event updates    | `ctx.bus.on("map.batch.changed", ...)`                |
| Map reading           | `ctx.map.readTile(mapId, layer, x, y)`                |
| Layer info            | `ctx.map.layers(mapId)` for layer names               |
| View options          | `ctx.editor.viewOptions()` — reads toggle states      |
| Panel cleanup         | `render()` returns a cleanup function                 |

### Try it

1. Copy this folder into `<gameRoot>/Plugins/MakerStudio/003_Editor/Mods/`.
2. Open the editor, load a map.
3. The **Tile Stats** panel auto-opens on the right.
4. Paint some tiles — watch the histogram update in real time.
5. Toggle Grid/Collision/Events in the toolbar — the footer updates.
