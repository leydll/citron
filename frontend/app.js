async function setText(id, text, cls) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = cls ?? "";
}

async function main() {
  try {
    const healthRes = await fetch("/api/health", { cache: "no-store" });
    await setText("health", healthRes.ok ? "OK" : `HTTP ${healthRes.status}`, healthRes.ok ? "ok" : "err");
  } catch {
    await setText("health", "Erreur réseau", "err");
  }

  try {
    const res = await fetch("/api/message", { cache: "no-store" });
    const data = await res.json();
    await setText("msg", data?.message ?? "(vide)", res.ok ? "ok" : "err");
  } catch {
    await setText("msg", "Impossible de récupérer le message", "err");
  }
}

main();

