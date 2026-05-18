/**
 * Tile Stats — opens a panel that shows a live histogram of tile IDs on the
 * active map's current layer. Updates in real time as you paint.
 *
 * Demonstrates: ctx.ui.registerPanel, ctx.ui.openPanel, ctx.bus.on("map.batch.changed"),
 *               ctx.map.readTile, ctx.map.layers, ctx.editor,
 *               ctx.editor.viewOptions.
 */

export function activate(ctx) {
  ctx.log.info("Tile Stats mod activated");

  ctx.ui.registerPanel({
    id: "tile-stats",
    title: "Tile Stats",
    defaultPosition: "right",
    render(host) {
      const style = document.createElement("style");
      style.textContent = `
        .ts-root { padding: 8px; font-size: 12px; font-family: system-ui, sans-serif; color: var(--text-primary, #e0e0e0); }
        .ts-root h3 { margin: 0 0 6px; font-size: 13px; }
        .ts-bar-row { display: flex; align-items: center; gap: 6px; margin: 2px 0; }
        .ts-bar-label { width: 50px; text-align: right; font-variant-numeric: tabular-nums; }
        .ts-bar-track { flex: 1; background: var(--bg-secondary, #333); border-radius: 2px; height: 14px; position: relative; }
        .ts-bar-fill { background: var(--accent, #4f9cff); height: 100%; border-radius: 2px; }
        .ts-bar-count { position: absolute; right: 4px; top: 0; font-size: 10px; line-height: 14px; color: var(--text-primary, #fff); }
        .ts-empty { color: var(--text-secondary, #888); }
        .ts-footer { margin-top: 8px; padding-top: 6px; border-top: 1px solid var(--border, #444); font-size: 11px; color: var(--text-secondary, #999); }
      `;
      host.appendChild(style);

      const root = document.createElement("div");
      root.className = "ts-root";
      host.appendChild(root);

      function refresh() {
        const mapId = ctx.editor.activeMapId();
        if (mapId == null) {
          root.innerHTML = '<p class="ts-empty">No map open.</p>';
          return;
        }
        const info = ctx.map.info(mapId);
        if (!info) { root.innerHTML = '<p class="ts-empty">No map data.</p>'; return; }
        const layerIdx = ctx.editor.activeLayerIndex();
        const layers = ctx.map.layers(mapId);
        const layerName = layers[layerIdx]?.name ?? `Layer ${layerIdx}`;

        const counts = new Map();
        for (let y = 0; y < info.height; y++) {
          for (let x = 0; x < info.width; x++) {
            const id = ctx.map.readTile(mapId, layerIdx, x, y);
            counts.set(id, (counts.get(id) || 0) + 1);
          }
        }

        const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
        const max = sorted.length > 0 ? sorted[0][1] : 1;

        root.innerHTML = `<h3>${layerName} — ${sorted.length} unique tiles</h3>`;
        const show = sorted.slice(0, 20);
        for (const [id, count] of show) {
          const pct = Math.round((count / max) * 100);
          const row = document.createElement("div");
          row.className = "ts-bar-row";
          row.innerHTML = `
            <span class="ts-bar-label">${id}</span>
            <div class="ts-bar-track">
              <div class="ts-bar-fill" style="width:${pct}%"></div>
              <span class="ts-bar-count">${count}</span>
            </div>`;
          root.appendChild(row);
        }
        if (sorted.length > 20) {
          const more = document.createElement("p");
          more.className = "ts-empty";
          more.textContent = `…and ${sorted.length - 20} more`;
          root.appendChild(more);
        }

        const vo = ctx.editor.viewOptions();
        const flags = [];
        if (vo.showGrid) flags.push("Grid");
        if (vo.showCollision) flags.push("Collision");
        if (vo.showEvents) flags.push("Events");
        if (vo.showDim) flags.push("Dim");
        if (vo.darkMode) flags.push("Dark");
        const footer = document.createElement("div");
        footer.className = "ts-footer";
        footer.textContent = flags.length ? `View: ${flags.join(" | ")}` : "View: defaults";
        root.appendChild(footer);
      }

      refresh();

      const sub = ctx.bus.on("map.batch.changed", () => refresh());
      const sub2 = ctx.bus.on("map.loaded", () => refresh());

      return () => {
        sub.dispose();
        sub2.dispose();
      };
    },
  });

}
