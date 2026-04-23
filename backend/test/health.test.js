import test from "node:test";
import assert from "node:assert/strict";

import { startServer } from "../server.js";

test("GET /health renvoie 200 OK", async () => {
  const { server } = startServer({ port: 0 });
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();

  try {
    const res = await fetch(`http://127.0.0.1:${port}/health`, { cache: "no-store" });
    assert.equal(res.status, 200);
    const body = await res.text();
    assert.equal(body, "OK");
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
});

