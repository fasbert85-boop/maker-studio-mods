# Example: Hello World

The simplest possible mod — a toast on map load, a menu item, and a keyboard
shortcut.

### What it does

1. Logs `"Hello World mod activated"` to the mod log.
2. Subscribes to `map.loaded` and shows a toast with the map's id and dimensions.
3. Adds a **Mods → Hello World — Say Hi** menu item that shows another toast.
4. Registers **Ctrl+Shift+H** shortcut that shows a toast.

### Concepts covered

| Concept               | API used                                  |
|-----------------------|-------------------------------------------|
| Logging               | `ctx.log.info(...)`                       |
| Toast notifications   | `ctx.ui.showToast(...)`                   |
| Event subscription    | `ctx.bus.on("map.loaded", ...)`           |
| Menu items            | `ctx.menu.registerMenuItem(...)`          |
| Keyboard shortcuts    | `ctx.ui.registerShortcut("Ctrl+Shift+H", ...)` |
| Auto-dispose          | (implicit — disposables from ctx APIs)    |

### Try it

1. Copy this folder into `<gameRoot>/Plugins/MakerStudio/003_Editor/Mods/`.
2. Open the project in the editor.
3. Open any map — a toast should appear.
4. Press **Ctrl+Shift+H** — another toast appears.
