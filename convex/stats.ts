// convex/stats.ts

import { query } from "./_generated/server";
import { v } from "convex/values";

export const getPeriodStats = query({
  args: { userId: v.string(), period: v.union(v.literal("day"), v.literal("week"), v.literal("month")) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Définition de la fenêtre de temps
    const duration = args.period === "day" ? oneDay : args.period === "week" ? oneDay * 7 : oneDay * 30;
    const currentPeriodStart = now - duration;
    const previousPeriodStart = now - (duration * 2);

    const allTours = await ctx.db
  .query("tours")
  .withIndex("by_userId", (q) => q.eq("userId", args.userId)) 
  .collect();

    const currentStats = allTours.filter(t => t.timestamp >= currentPeriodStart);
    const previousStats = allTours.filter(t => t.timestamp >= previousPeriodStart && t.timestamp < currentPeriodStart);

    const sumKm = (list: any[]) => list.reduce((acc, t) => acc + t.savedKm, 0);

    return {
      currentKm: sumKm(currentStats),
      previousKm: sumKm(previousStats),
      customerCount: currentStats.reduce((acc, t) => acc + t.deliveryCount, 0),
    };
  },
});
