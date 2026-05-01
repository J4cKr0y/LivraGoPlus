// convex/http.ts

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// 🔒 Fonction de sécurité
const checkAuth = (request: Request) => {
  const authHeader = request.headers.get("Authorization");
  const expectedToken = process.env.SYNC_API_KEY; // Le secret stocké côté serveur

  if (!expectedToken) {
    console.warn("ATTENTION : SYNC_API_KEY n'est pas défini sur le serveur.");
    return false;
  }

  // On attend un format standard : "Bearer MON_SECRET"
  return authHeader === `Bearer ${expectedToken}`;
};

// Route PUSH sécurisée
http.route({
  path: "/sync/push",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    //  On vérifie l'autorisation en premier
    if (!checkAuth(request)) {
      return new Response(JSON.stringify({ error: "Accès refusé. Clé API invalide." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await request.json();
    await ctx.runMutation(api.sync.push, { changes: body.changes });

    return new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

// Route PULL sécurisée
http.route({
  path: "/sync/pull",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    //  Sécurité ici aussi
    if (!checkAuth(request)) {
      return new Response(JSON.stringify({ error: "Accès refusé. Clé API invalide." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { lastPulledAt, schemaVersion } = await request.json();
    const result = await ctx.runQuery(api.sync.pull, { lastPulledAt, schemaVersion });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

export default http;