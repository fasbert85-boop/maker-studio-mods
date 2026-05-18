/**
 * Hello World — the smallest possible mod.
 *
 * Demonstrates: ctx.log, ctx.ui.showToast, ctx.bus.on, ctx.menu.registerMenuItem,
 *               ctx.ui.registerShortcut.
 */

export function activate(ctx) {
  ctx.log.info("Hello World mod activated");

  ctx.bus.on("map.loaded", (e) => {
    ctx.ui.showToast({
      message: `Hello! Loaded map ${e.mapId} (${e.width} × ${e.height})`,
      level: "info",
    });
  });

  ctx.menu.registerMenuItem({
    menu: "Mods",
    label: "Hello World — Say Hi",
    handler: () => {
      ctx.ui.showToast({ message: "Hi from the Hello World mod!" });
    },
  });

  ctx.ui.registerShortcut("Ctrl+Shift+H", () => {
    ctx.ui.showToast({ message: "Shortcut triggered — Hello!" });
  });
}

export function deactivate() {
  // Disposables registered through ctx are auto-cleaned. Nothing else to do.
}
