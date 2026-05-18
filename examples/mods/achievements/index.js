/**
 * Achievements — tracks milestones using ctx.stats.
 *
 * Demonstrates:
 *   ctx.stats.global() / .project() / .all() — snapshot getters
 *   ctx.stats.getGlobalStat() / .getProjectStat() — single-stat getters
 *   ctx.stats.getCustomGlobal() / .getCustomProject() — read custom stats
 *   ctx.stats.setCustomGlobal() / .setCustomProject() — write custom stats
 *   ctx.stats.incrementCustomGlobal() / .incrementCustomProject() — increment
 *   ctx.stats.onStatsChanged() — subscribe to periodic updates
 *   ctx.bus.on("map.batch.changed") — react to tile edits
 *   ctx.ui.registerPanel — dockable panel showing unlocked achievements
 */

const ACHIEVEMENTS = [
  { id: "first_tile",     name: "First Tile",       desc: "Place your first tile",                check: (s) => s.project && s.project.tilesPlaced >= 1 },
  { id: "tile_100",       name: "Centurion",         desc: "Place 100 tiles on a project",         check: (s) => s.project && s.project.tilesPlaced >= 100 },
  { id: "tile_1000",      name: "Tile Master",       desc: "Place 1,000 tiles on a project",        check: (s) => s.project && s.project.tilesPlaced >= 1000 },
  { id: "tile_10000",     name: "Tile Legend",        desc: "Place 10,000 tiles on a project",       check: (s) => s.project && s.project.tilesPlaced >= 10000 },
  { id: "global_10k",     name: "World Builder",     desc: "Place 10,000 tiles globally",           check: (s) => s.global.totalTilesPlaced >= 10000 },
  { id: "undo_50",        name: "Second Thoughts",   desc: "Undo 50 times on a project",            check: (s) => s.project && s.project.undoCount >= 50 },
  { id: "save_10",        name: "Safety First",      desc: "Save a project 10 times",               check: (s) => s.project && s.project.mapsSaved >= 10 },
  { id: "save_100",       name: "Persistent",         desc: "Save a project 100 times",              check: (s) => s.project && s.project.mapsSaved >= 100 },
  { id: "session_10",     name: "Regular",            desc: "Open the same project 10 times",        check: (s) => s.project && s.project.sessionCount >= 10 },
  { id: "hour_1",         name: "Getting Started",   desc: "Spend 1 hour on a project",             check: (s) => s.project && s.project.activeMinutes >= 60 },
  { id: "hour_10",        name: "Dedicated",          desc: "Spend 10 hours on a project",           check: (s) => s.project && s.project.activeMinutes >= 600 },
  { id: "global_hour_24", name: "Marathon",           desc: "Spend 24 hours total in the editor",    check: (s) => s.global.totalActiveMinutes >= 1440 },
  { id: "global_undo_500",name: "Chrono Mapper",     desc: "Undo 500 times globally",               check: (s) => s.global.totalUndoCount >= 500 },
  { id: "map_created_5",  name: "Cartographer",       desc: "Create 5 maps in a project",            check: (s) => s.project && s.project.mapsCreated >= 5 },
];

const STORAGE_KEY = "achievements_unlocked";

export function activate(ctx) {
  ctx.log.info("Achievements mod activated");

  // --- Register stat metadata ---
  ctx.stats.registerStat({
    id: "achievements_unlocked",
    name: "Achievements Unlocked",
    description: "Total achievements unlocked across all projects",
    category: "Achievements",
    scope: "global",
  });
  ctx.stats.registerStat({
    id: "achievements_checked",
    name: "Achievement Checks",
    description: "Times achievement conditions were evaluated",
    category: "Achievements",
    scope: "project",
  });

  // --- Helpers ---

  async function getUnlocked() {
    const raw = await ctx.storage.get(STORAGE_KEY);
    if (!raw) return {};
    if (typeof raw === "string") { try { return JSON.parse(raw); } catch { return {}; } }
    return raw;
  }

  async function saveUnlocked(obj) {
    await ctx.storage.set(STORAGE_KEY, obj);
  }

  let unlockedCache = null;

  async function checkAll() {
    const all = ctx.stats.all();
    if (!unlockedCache) unlockedCache = await getUnlocked();
    const unlocked = unlockedCache;
    let anyNew = false;

    for (const a of ACHIEVEMENTS) {
      if (unlocked[a.id]) continue;
      if (a.check(all)) {
        unlocked[a.id] = { name: a.name, at: new Date().toISOString() };
        anyNew = true;
        ctx.ui.showToast({
          message: "Achievement Unlocked: " + a.name,
          level: "info",
        });
        ctx.log.info("Achievement unlocked: " + a.name);
      }
    }

    if (anyNew) {
      await saveUnlocked(unlocked);
      const total = ACHIEVEMENTS.filter((a) => unlocked[a.id]).length;
      ctx.stats.setCustomGlobal("achievements_unlocked", total);
      if (all.project) {
        ctx.stats.incrementCustomProject("achievements_checked");
      }
      refreshPanel();
    }
  }

  // --- Panel ---

  let panelContainer = null;

  async function renderPanel(container) {
    panelContainer = container;
    container.innerHTML = "";
    const unlocked = await getUnlocked();

    const style = document.createElement("style");
    style.textContent = `
      .ach-list { display: flex; flex-direction: column; gap: 6px; padding: 8px; overflow-y: auto; height: 100%; }
      .ach-item { padding: 8px 10px; border-radius: 6px; border: 1px solid var(--border, #333); background: var(--bg-secondary, #1e1e2e); }
      .ach-item.unlocked { border-color: var(--accent, #4caf50); }
      .ach-name { font-weight: 600; font-size: 13px; color: var(--text-primary, #eee); }
      .ach-desc { font-size: 11px; color: var(--text-secondary, #aaa); margin-top: 2px; }
      .ach-date { font-size: 10px; color: var(--text-muted, #777); margin-top: 2px; }
      .ach-progress { font-size: 11px; color: var(--accent, #4caf50); margin-top: 4px; }
    `;
    container.appendChild(style);

    const list = document.createElement("div");
    list.className = "ach-list";

    const total = ACHIEVEMENTS.length;
    const done = ACHIEVEMENTS.filter((a) => unlocked[a.id]).length;

    const progress = document.createElement("div");
    progress.className = "ach-progress";
    progress.textContent = done + " / " + total + " unlocked";
    list.appendChild(progress);

    for (const a of ACHIEVEMENTS) {
      const item = document.createElement("div");
      item.className = "ach-item" + (unlocked[a.id] ? " unlocked" : "");
      const name = document.createElement("div");
      name.className = "ach-name";
      name.textContent = (unlocked[a.id] ? "★ " : "☆ ") + a.name;
      item.appendChild(name);

      const desc = document.createElement("div");
      desc.className = "ach-desc";
      desc.textContent = a.desc;
      item.appendChild(desc);

      if (unlocked[a.id]) {
        const date = document.createElement("div");
        date.className = "ach-date";
        date.textContent = "Unlocked: " + new Date(unlocked[a.id].at).toLocaleDateString();
        item.appendChild(date);
      }

      list.appendChild(item);
    }

    container.appendChild(list);
  }

  function refreshPanel() {
    if (panelContainer) void renderPanel(panelContainer);
  }

  ctx.ui.registerPanel({
    id: "achievements",
    title: "Achievements",
    render: (container) => { void renderPanel(container); },
  });

  // --- Check triggers ---

  ctx.stats.onStatsChanged(() => void checkAll());
  ctx.bus.on("map.batch.changed", () => { setTimeout(() => void checkAll(), 200); });
  ctx.bus.on("undo", () => { setTimeout(() => void checkAll(), 200); });
  ctx.bus.on("save.after", () => { setTimeout(() => void checkAll(), 200); });

  // Initial check
  setTimeout(() => void checkAll(), 500);

  // --- Menu item ---

  ctx.menu.registerMenuItem({
    menu: "Mods",
    label: "Open Achievements Panel",
    handler: () => {
      ctx.ui.openPanel("achievements");
    },
  });

  // --- Demo: log single-stat getter usage ---
  const totalTiles = ctx.stats.getGlobalStat("totalTilesPlaced");
  const projectTiles = ctx.stats.getProjectStat("tilesPlaced");
  ctx.log.info("Stats at load — global tiles: " + totalTiles + ", project tiles: " + projectTiles);
  ctx.log.info("Custom global \"achievements_unlocked\": " + ctx.stats.getCustomGlobal("achievements_unlocked"));
}

export function deactivate() {
  // Auto-cleaned via ctx disposables.
}
