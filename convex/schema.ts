// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	
  packages: defineTable({
    id: v.string(),
    status: v.string(),
    address: v.string(),
    updatedAt: v.number(),
  })
    .index("by_external_id", ["id"])
    .index("by_updatedAt", ["updatedAt"]),

// Table pour suivre les suppressions
  tombstones: defineTable({
    recordId: v.string(),
    tableName: v.string(),
    deletedAt: v.number(),
  }).index("by_deletedAt", ["deletedAt"]),
  
  tours: defineTable({
  userId: v.string(),
  savedKm: v.number(),
  deliveryCount: v.number(),
  timestamp: v.number(),
}).index("by_userId", ["userId"]),
  
  deliveries: defineTable({
  externalId: v.string(),
  address: v.string(),
  status: v.string(),
  proofUri: v.optional(v.string()),
  customerPhone: v.optional(v.string()),
  customerEmail: v.optional(v.string()),
  userId: v.string(),
})
  .index("by_externalId", ["externalId"]),
  
});