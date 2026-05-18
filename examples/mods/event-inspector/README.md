# Example: Event Inspector

Right-click events on the map to inspect their page details or clone them.
Demonstrates full event CRUD with page data.

### What it does

1. Adds a **map-event context menu** item "Inspect Event" — reads the full event
   data via `getFull()` and shows a toast with page details (trigger type,
   graphic, move speed/frequency).
2. Adds a **map-event context menu** item "Clone Event" — copies the full event
   with all pages to a new event at the same position.

### Concepts covered

| Concept               | API used                                              |
|-----------------------|-------------------------------------------------------|
| Context menu (map-event) | `ctx.ui.registerContextMenuItem({ context: "map-event", ... })` |
| Full event read       | `ctx.events.getFull(mapId, eventId)` — returns pages  |
| Event creation        | `ctx.events.create(mapId, x, y, name)` — returns ID   |
| Event update          | `ctx.events.update(mapId, fullEvent)` — writes pages  |
| Trigger name mapping  | `["Action","Player Touch","Event Touch","Autorun","Parallel"]` |

### Context menu info for map-event

When `context: "map-event"`, the `info` object provides:

```ts
{
  mapId: number;      // current map
  eventId: number;    // clicked event
  tileX: number;      // event tile X
  tileY: number;      // event tile Y
  layerIndex: number; // current layer
}
```

### Try it

1. Copy this folder into `<gameRoot>/Plugins/MakerStudio/003_Editor/Mods/`.
2. Open the editor and load a map that has events.
3. Right-click an event on the map → **Inspect Event** — toast shows page details.
4. Right-click an event → **Clone Event** — a copy appears at the same position.
