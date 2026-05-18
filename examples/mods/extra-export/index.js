/**
 * Extra Export — adds "Export Map > Export as Plain Text..." to the Import & Export Maps submenu
 * and a nested context-menu item inside "Export Map…" when right-clicking a map in the map tree.
 *
 * Demonstrates: ctx.menu.registerMenuItem (submenu targeting), ctx.map, ctx.editor,
 *               Tauri dialog save, ctx.commands.register,
 *               ctx.ui.registerContextMenuItem with parentMenu.
 */

export function activate(ctx) {
  ctx.log.info("Extra Export mod activated");

  function tauriInvoke(cmd, args) {
    return window.__TAURI__.core.invoke(cmd, args);
  }

  async function doExportForMap(mapId) {
    if (mapId == null) {
      ctx.ui.showToast({ message: "No map specified.", level: "warn" });
      return;
    }
    const info = ctx.map.info(mapId);
    if (!info) return;

    const lines = [];
    lines.push(`Map: ${info.name} (id=${info.id})`);
    lines.push(`Size: ${info.width} x ${info.height}`);
    lines.push(`Tileset: ${info.tilesetId}`);
    lines.push("");

    for (const layer of ctx.map.layers(mapId)) {
      if (layer.kind === "shadow") continue;
      lines.push(`--- Layer ${layer.index}: ${layer.name} (${layer.kind}) ---`);
      for (let y = 0; y < info.height; y++) {
        const row = [];
        for (let x = 0; x < info.width; x++) {
          const id = ctx.map.readTile(mapId, layer.index, x, y);
          row.push(String(id).padStart(5));
        }
        lines.push(row.join(" "));
      }
      lines.push("");
    }

    const defaultName = `Map${String(info.id).padStart(3, "0")}_export.txt`;
    try {
      const path = await tauriInvoke("plugin:dialog|save", {
        options: {
          defaultPath: defaultName,
          filters: [{ name: "Text", extensions: ["txt"] }],
        },
      });
      if (!path) return;
      await tauriInvoke("write_text_file", { path, content: lines.join("\n") });
      ctx.ui.showToast({ message: `Exported to ${path}`, level: "info" });
    } catch (err) {
      ctx.log.error("export failed:", err);
      ctx.ui.showToast({ message: `Export failed: ${err}`, level: "error" });
    }
  }

  function exportPlainText() {
    return doExportForMap(ctx.editor.activeMapId());
  }

  ctx.menu.registerMenuItem({
    menu: "Import & Export Maps",
    label: "Export Map as Plain Text...",
    handler: exportPlainText,
    isEnabled: () => ctx.editor.activeMapId() != null,
  });

  // Nested inside the existing "Export Map…" submenu in map-tree right-click
  ctx.ui.registerContextMenuItem({
    context: "map-tree",
    label: "Export as Plain Text…",
    parentMenu: "Export Map…",
    handler: (info) => doExportForMap(info.mapId),
  });

  ctx.commands.register("extra-export.export-text", exportPlainText);
}
