# Example: Achievements

A stats-driven achievement system that unlocks milestones as you use the editor.

### What it does

1. Defines 14 achievements based on built-in stats (tiles placed, undos, saves, time, sessions).
2. Checks achievement conditions on stats updates, tile edits, undo/redo, and save events.
3. Shows a toast when an achievement is unlocked.
4. Provides a dockable **Achievements** panel showing locked/unlocked status with dates.
5. Uses custom stats (`achievements_unlocked`, `achievements_checked`) via `ctx.stats`.
6. Adds a **Mods → Open Achievements Panel** menu item.

### Achievements

| Achievement        | Condition                              | Scope   |
|--------------------|----------------------------------------|---------|
| First Tile         | Place 1 tile                           | Project |
| Centurion          | Place 100 tiles                        | Project |
| Tile Master        | Place 1,000 tiles                      | Project |
| Tile Legend         | Place 10,000 tiles                     | Project |
| World Builder      | Place 10,000 tiles globally            | Global  |
| Second Thoughts    | Undo 50 times                          | Project |
| Safety First       | Save 10 times                          | Project |
| Persistent          | Save 100 times                         | Project |
| Regular            | Open same project 10 times             | Project |
| Getting Started    | Spend 1 hour on a project              | Project |
| Dedicated           | Spend 10 hours on a project            | Project |
| Marathon           | Spend 24 hours total in editor         | Global  |
| Chrono Mapper      | Undo 500 times globally                | Global  |
| Cartographer       | Create 5 maps in a project             | Project |

### Concepts covered

| Concept               | API used                                                      |
|-----------------------|---------------------------------------------------------------|
| Stats snapshot        | `ctx.stats.all()`, `ctx.stats.global()`, `ctx.stats.project()` |
| Single-stat getter    | `ctx.stats.getGlobalStat("totalTilesPlaced")`                 |
| Custom stats (read)   | `ctx.stats.getCustomGlobal("achievements_unlocked")`          |
| Custom stats (write)  | `ctx.stats.setCustomGlobal(...)`, `ctx.stats.incrementCustomProject(...)` |
| Stats subscription    | `ctx.stats.onStatsChanged(...)`                               |
| Tile edit events      | `ctx.bus.on("map.batch.changed", ...)`                        |
| Dockable panel         | `ctx.ui.registerPanel(...)`                                   |
| Persistent storage    | `ctx.storage.set(...)` / `ctx.storage.get(...)`               |
| Menu items            | `ctx.menu.registerMenuItem(...)`                              |

### Try it

1. Copy this folder into `<gameRoot>/Plugins/MakerStudio/003_Editor/Mods/`.
2. Open the project in the editor.
3. Place a tile — the "First Tile" achievement should unlock with a toast.
4. Open the Achievements panel via **Mods → Open Achievements Panel**.
