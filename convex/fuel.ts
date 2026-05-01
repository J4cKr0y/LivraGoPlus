// convex/fuel.ts

"use node"; 
import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Action pour récupérer le prix moyen du carburant sur un code postal donné.
 * Utilise l'API Open Data du gouvernement français.
 */
export const getLocalFuelPrice = action({
  args: { 
    zipCode: v.string(), 
    fuelType: v.string() // ex: "Gazole", "SP95", "E10"
  },
  handler: async (ctx, args) => {
    try {
      // API officielle Open Data du gouvernement (Flux instantané v2)
      const url = `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records?limit=10&refine=cp:${args.zipCode}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Erreur avec l'API Gouvernementale");
      
      const data = await response.json();
      const stations = data.results;

      if (!stations || stations.length === 0) {
        return { success: false, error: "Aucune station trouvée dans ce code postal" };
      }

      let totalPrice = 0;
      let count = 0;

      for (const station of stations) {
        // L'API renvoie des champs dynamiques comme gazole_prix
        const priceField = `${args.fuelType.toLowerCase()}_prix`;
        if (station[priceField]) {
          totalPrice += parseFloat(station[priceField]);
          count++;
        }
      }

      if (count === 0) return { success: false, error: "Carburant indisponible dans cette zone" };

      const averagePrice = totalPrice / count;
      
      return { 
        success: true, 
        price: Number(averagePrice.toFixed(3)),
        currency: "EUR"
      };

    } catch (error) {
      console.error("Erreur Fetch Carburant:", error);
      return { success: false, error: "Erreur serveur" };
    }
  },
});