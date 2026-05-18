/**
 * Event Inspector — right-click an event to inspect its pages or clone it.
 *
 * Demonstrates: ctx.ui.registerContextMenuItem (map-event), ctx.events.getFull,
 *               ctx.events.create, ctx.events.update.
 */

const TRIGGER_NAMES = ["Action", "Player Touch", "Event Touch", "Autorun", "Parallel"];

export function activate(ctx) {
  ctx.log.info("Event Inspector mod activated");

  // Inspect: show page details in a toast
  ctx.ui.registerContextMenuItem({
    context: "map-event",
    label: "Inspect Event",
    handler: (info) => {
      const full = ctx.events.getFull(info.mapId, info.eventId);
      if (!full) {
        ctx.ui.showToast({ message: `Event ${info.eventId} not found`, level: "warn" });
        return;
      }
      const lines = [];
      lines.push(`"${full.name}" (${full.pages.length} page${full.pages.length !== 1 ? "s" : ""})`);
      for (let i = 0; i < full.pages.length; i++) {
        const p = full.pages[i];
        const trig = TRIGGER_NAMES[p.trigger] ?? `#${p.trigger}`;
        const gfx = p.graphic.character_name || "(none)";
        const move = `speed=${p.move_speed} freq=${p.move_frequency}`;
        lines.push(`  P${i}: ${trig} | ${gfx} | ${move}`);
      }
      ctx.ui.showToast({ message: lines.join("\n") });
    },
  });

  // Clone: copy full event data to a new event at same position
  ctx.ui.registerContextMenuItem({
    context: "map-event",
    label: "Clone Event",
    handler: (info) => {
      const full = ctx.events.getFull(info.mapId, info.eventId);
      if (!full) {
        ctx.ui.showToast({ message: `Event ${info.eventId} not found`, level: "warn" });
        return;
      }
      const newId = ctx.events.create(info.mapId, full.x, full.y, `${full.name} (copy)`);
      if (newId == null) {
        ctx.ui.showToast({ message: "Failed to create event", level: "error" });
        return;
      }
      const clone = {
        ...full,
        id: newId,
        name: `${full.name} (copy)`,
      };
      ctx.events.update(info.mapId, clone);
      ctx.ui.showToast({ message: `Cloned as event ${newId}` });
    },
  });
}
