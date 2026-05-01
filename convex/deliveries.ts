// convex/deliveries.ts

import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api"; // Généré automatiquement

export const saveDelivery = mutation({
  // 1. On définit strictement les arguments attendus
  args: {
    externalId: v.string(),
    address: v.string(),
    status: v.string(),
    proofUri: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    userId: v.string(),
    customerEmail: v.optional(v.string()), // On ajoute l'email si dispo
  },

  // 2. Le "handler" est la fonction qui s'exécute sur le serveur
  handler: async (ctx, args) => {
    // On cherche si cette livraison existe déjà grâce à l'index qu'on a créé
    const existingDelivery = await ctx.db
      .query("deliveries")
      .withIndex("by_externalId", (q) => q.eq("externalId", args.externalId))
      .first();

    if (existingDelivery) {
      // MISE À JOUR : La livraison existe, on met à jour son statut et la preuve
      await ctx.db.patch(existingDelivery._id, {
        status: args.status,
        proofUri: args.proofUri,
        // (On laisse l'adresse telle quelle)
      });
      console.log(`Livraison ${args.externalId} mise à jour.`);
    } else {
      // CRÉATION : Nouvelle livraison scannée
      await ctx.db.insert("deliveries", args);
      console.log(`Nouvelle livraison ${args.externalId} créée.`);
    }

    // 3. Déclenchement du mail si c'est livré
    if (args.status === "DELIVERED" && args.customerEmail) {
      // On utilise le scheduler pour ne pas ralentir la mutation
      // Le mail partira immédiatement après la validation de la transaction
      await ctx.scheduler.runAfter(0, api.resend.sendConfirmationEmail, {
        customerEmail: args.customerEmail,
        deliveryId: args.externalId,
        address: args.address,
      });
    }
  },
});
