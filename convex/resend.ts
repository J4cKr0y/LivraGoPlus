// convex/resend.ts

"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

export const sendConfirmationEmail = action({
  args: {
    customerEmail: v.string(),
    deliveryId: v.string(),
    address: v.string(),
  },
  handler: async (ctx, args) => {
	  const resend = new Resend(process.env.RESEND_API_KEY);
    try {
      const { data, error } = await resend.emails.send({
        from: "Livraison Express <onboarding@resend.dev>", // Plus tard, tu utiliseras ton propre domaine
        to: [args.customerEmail],
        subject: `Confirmation de livraison - Colis #${args.deliveryId}`,
        html: `
          <h1>Votre colis est arrivé ! 📦</h1>
          <p>Bonjour,</p>
          <p>Nous vous confirmons que votre colis a été livré avec succès à l'adresse suivante :</p>
          <blockquote style="background: #f4f4f4; padding: 10px; border-left: 5px solid #ccc;">
            ${args.address}
          </blockquote>
          <p>Merci de nous avoir fait confiance.</p>
          <hr />
          <small>Ceci est un message automatique, merci de ne pas y répondre.</small>
        `,
      });

      if (error) {
        console.error("Erreur Resend:", error);
        return { success: false };
      }

      return { success: true, id: data?.id };
    } catch (err) {
      console.error("Erreur critique envoi mail:", err);
      return { success: false };
    }
  },
});
