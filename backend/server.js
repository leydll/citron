import express from "express";

export function createApp() {
  const app = express();

  app.get("/health", (_req, res) => {
    res.status(200).send("OK");
  });

  app.get("/message", (_req, res) => {
    res.json({ message: "Bonjour depuis le backend." });
  });

  return app;
}

export function startServer({ port } = {}) {
  const app = createApp();
  const resolvedPort = Number.parseInt(port ?? process.env.PORT ?? "3000", 10);

  const server = app.listen(resolvedPort, "0.0.0.0", () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on :${resolvedPort}`);
  });

  return { app, server, port: resolvedPort };
}

// Démarrage uniquement si lancé via "node server.js"
if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  startServer();
}

