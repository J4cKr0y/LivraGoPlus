// convex/sync.ts

import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const push = mutation({
  args: {
    changes: v.any(), // On reçoit l'objet global "changes"
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { packages } = args.changes;

    if (!packages) return { status: "ok" };

    // 1. Gérer les CRÉATIONS
    for (const pkg of packages.created) {
      await ctx.db.insert("packages", {
        ...pkg,
        updatedAt: now,
      });
    }

    // 2. Gérer les MISES À JOUR
    for (const pkg of packages.updated) {
      const existing = await ctx.db
        .query("packages")
        .withIndex("by_external_id", (q) => q.eq("id", pkg.id))
        .first();
      
      if (existing) {
        await ctx.db.patch(existing._id, {
          ...pkg,
          updatedAt: now,
        });
      }
    }

    // 3. Gérer les SUPPRESSIONS (avec Tombstones)
    for (const id of packages.deleted) {
      const existing = await ctx.db
        .query("packages")
        .withIndex("by_external_id", (q) => q.eq("id", id))
        .first();

      if (existing) {
        // On supprime le record
        await ctx.db.delete(existing._id);
        // On laisse une trace pour que les autres mobiles sachent qu'il faut le supprimer
        await ctx.db.insert("tombstones", {
          recordId: id,
          tableName: "packages",
          deletedAt: now,
        });
      }
    }

    return { status: "ok" };
  },
});



export const pull = query({
  args: { lastPulledAt: v.union(v.number(), v.null()), schemaVersion: v.number() },
  handler: async (ctx, args) => {
    const lastPull = args.lastPulledAt ?? 0;
    const now = Date.now();

    // Récupérer les créations/mises à jour
    const packages = await ctx.db
      .query("packages")
      .withIndex("by_updatedAt", (q) => q.gt("updatedAt", lastPull))
      .collect();

    // Récupérer les suppressions (Tombstones)
    // Filtrer sur l'index, puis filtrer tableName en mémoire
const deletedPackages = await ctx.db
  .query("tombstones")
  .withIndex("by_deletedAt", (q) => q.gt("deletedAt", lastPull))
  .filter((q) => q.eq(q.field("tableName"), "packages"))
  .collect();

    return {
      changes: {
        packages: {
          created: packages.filter(p => p._creationTime > lastPull),
          updated: packages.filter(p => p._creationTime <= lastPull),
          deleted: deletedPackages.map(d => d.recordId),
        }
      },
      timestamp: now,
    };
  },
});
