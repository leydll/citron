import express from "express";

const app = express();

const port = Number.parseInt(process.env.PORT ?? "3000", 10);

app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

app.get("/message", (_req, res) => {
  res.json({ message: "Bonjour depuis le backend." });
});

app.listen(port, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on :${port}`);
});

