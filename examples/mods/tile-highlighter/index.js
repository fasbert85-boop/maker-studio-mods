/**
 * Tile Highlighter — right-click a tile to place a colored highlight overlay.
 * Right-click again to clear all highlights.
 *
 * Demonstrates: ctx.ui.registerOverlay, ctx.ui.registerContextMenuItem (map-tile),
 *               Canvas2D overlay rendering with viewport math.
 */

const PALETTE = [
  "rgba(255, 80, 80, 0.45)",
  "rgba(80, 200, 255, 0.45)",
  "rgba(80, 255, 120, 0.45)",
  "rgba(255, 220, 60, 0.45)",
  "rgba(200, 120, 255, 0.45)",
  "rgba(255, 160, 60, 0.45)",
];

const highlights = new Map(); // "mapId,x,y" → { mapId, x, y, color }
let colorIdx = 0;

function key(mapId, x, y) {
  return `${mapId},${x},${y}`;
}

export function activate(ctx) {
  ctx.log.info("Tile Highlighter mod activated");

  // Overlay: draw colored rectangles at highlighted positions
  ctx.ui.registerOverlay({
    id: "tile-highlighter",
    zOrder: 10,
    render(c2d, info) {
      for (const h of highlights.values()) {
        if (h.mapId !== info.mapId) continue;
        const px = (h.x * info.tileSize - info.viewportX) * info.zoom;
        const py = (h.y * info.tileSize - info.viewportY) * info.zoom;
        const size = info.tileSize * info.zoom;
        c2d.fillStyle = h.color;
        c2d.fillRect(px, py, size, size);
        c2d.strokeStyle = "rgba(255,255,255,0.6)";
        c2d.lineWidth = 1;
        c2d.strokeRect(px, py, size, size);
      }
    },
  });

  // Context menu: highlight clicked tile
  ctx.ui.registerContextMenuItem({
    context: "map-tile",
    label: "Highlight This Tile",
    handler: (info) => {
      const k = key(info.mapId, info.tileX, info.tileY);
      if (highlights.has(k)) return; // already highlighted
      highlights.set(k, {
        mapId: info.mapId,
        x: info.tileX,
        y: info.tileY,
        color: PALETTE[colorIdx % PALETTE.length],
      });
      colorIdx++;
      ctx.ui.showToast({ message: `Highlighted tile (${info.tileX}, ${info.tileY})` });
    },
  });

  // Context menu: clear all highlights
  ctx.ui.registerContextMenuItem({
    context: "map-tile",
    label: "Clear All Highlights",
    handler: () => {
      const count = highlights.size;
      highlights.clear();
      colorIdx = 0;
      ctx.ui.showToast({ message: `Cleared ${count} highlight(s)` });
    },
  });
}
