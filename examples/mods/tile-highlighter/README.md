# Example: Tile Highlighter

Right-click tiles to place colored highlight overlays. Right-click again to
clear all highlights. Demonstrates custom Canvas2D rendering on the map canvas.

### What it does

1. Registers a canvas overlay that draws colored rectangles at highlighted tile
   positions. Highlights cycle through a 6-color palette.
2. Adds a **map-tile context menu** item "Highlight This Tile" — adds a highlight
   at the right-clicked position.
3. Adds a **map-tile context menu** item "Clear All Highlights" — removes all
   highlights.

### Concepts covered

| Concept               | API used                                              |
|-----------------------|-------------------------------------------------------|
| Overlay rendering     | `ctx.ui.registerOverlay({ id, render(ctx, info), zOrder })` |
| Context menu (map-tile) | `ctx.ui.registerContextMenuItem({ context: "map-tile", ... })` |
| Canvas2D drawing      | `ctx.fillRect`, `ctx.strokeRect` in overlay render    |
| Viewport math         | `(tile * tileSize - viewport) * zoom` for screen coords |
| Module-level state    | plain `Map` outside `activate()` — persists across renders |

### Viewport coordinate formula

Overlay rendering receives `info.viewportX`, `info.viewportY`, `info.zoom`,
`info.tileSize`. To convert tile grid coords to canvas pixels:

```js
const px = (tileX * info.tileSize - info.viewportX) * info.zoom;
const py = (tileY * info.tileSize - info.viewportY) * info.zoom;
const size = info.tileSize * info.zoom;
```

### Try it

1. Copy this folder into `<gameRoot>/Plugins/MakerStudio/003_Editor/Mods/`.
2. Open the editor and load a map.
3. Right-click a tile → **Highlight This Tile** — a colored square appears.
4. Right-click more tiles — colors cycle through the palette.
5. Right-click → **Clear All Highlights** — all highlights removed.
