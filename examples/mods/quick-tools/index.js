/**
 * Quick Tools — keyboard shortcuts to toggle view options and a fill-layer tool.
 *
 * Demonstrates: ctx.ui.registerShortcut, ctx.editor.viewOptions/setViewOptions,
 *               ctx.menu.registerMenuItem with isChecked,
 *               ctx.map.beginUndoGroup/endUndoGroup, ctx.map.batchWrite.
 */

function toggle(ctx, key) {
  const vo = ctx.editor.viewOptions();
  ctx.editor.setViewOptions({ [key]: !vo[key] });
}

export function activate(ctx) {
  ctx.log.info("Quick Tools mod activated");

  // Shortcuts for view toggles
  ctx.ui.registerShortcut("Ctrl+Shift+G", () => toggle(ctx, "showGrid"));
  ctx.ui.registerShortcut("Ctrl+Shift+C", () => toggle(ctx, "showCollision"));
  ctx.ui.registerShortcut("Ctrl+Shift+E", () => toggle(ctx, "showEvents"));

  // Menu items with check marks
  for (const [key, label, shortcut] of [
    ["showGrid", "Toggle Grid", "Ctrl+Shift+G"],
    ["showCollision", "Toggle Collision", "Ctrl+Shift+C"],
    ["showEvents", "Toggle Events", "Ctrl+Shift+E"],
  ]) {
    ctx.menu.registerMenuItem({
      menu: "View",
      label,
      shortcut,
      handler: () => toggle(ctx, key),
      isChecked: () => ctx.editor.viewOptions()[key],
    });
  }

  // Fill current layer with tile 0
  ctx.menu.registerMenuItem({
    menu: "Mods",
    label: "Fill Layer with Tile 0",
    isEnabled: () => ctx.editor.activeMapId() != null,
    handler: () => {
      const mapId = ctx.editor.activeMapId();
      if (mapId == null) return;
      const info = ctx.map.info(mapId);
      if (!info) return;
      const layer = ctx.editor.activeLayerIndex();

      const tiles = new Map();
      for (let y = 0; y < info.height; y++) {
        for (let x = 0; x < info.width; x++) {
          tiles.set(`${x},${y}`, 0);
        }
      }

      ctx.map.beginUndoGroup(`Fill layer ${layer} with tile 0`);
      ctx.map.batchWrite(mapId, layer, tiles, "fill");
      ctx.map.endUndoGroup();

      ctx.ui.showToast({ message: `Filled layer ${layer} (${info.width}×${info.height})` });
    },
  });
}
