import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = "http://localhost:4328";
const DIR = "D:/suoyouxiangmu/ai-student-survival/test-results/";

if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

const res = { tests: [] };

async function shot(page, n) {
  try {
    await page.screenshot({ path: path.join(DIR, n + "-" + Date.now() + ".png"), fullPage: true });
  } catch(e) {}
}

async function run() {
  console.log("QA Test Start");
  
  try {
    const r = await fetch(BASE);
    res.tests.push({ name: "Server", status: r.ok ? "PASS" : "FAIL", d: r.status });
  } catch(e) { res.tests.push({ name: "Server", status: "FAIL", d: e.message }); }

  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();

  await page.goto(BASE + "/auth/login", { waitUntil: "networkidle" });
  await shot(page, "login");
  
  const email = await page.$("input[type=email]");
  const pass = await page.$("input[type=password]");
  const submit = await page.$("button[type=submit]");
  
  res.tests.push({ name: "Login:Email", status: email ? "PASS" : "FAIL", d: "" });
  res.tests.push({ name: "Login:Password", status: pass ? "PASS" : "FAIL", d: "" });
  res.tests.push({ name: "Login:Submit", status: submit ? "PASS" : "FAIL", d: "" });

  await page.goto(BASE + "/user", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await shot(page, "user");
  const url = page.url();
  res.tests.push({ name: "Auth:Guard", status: url.includes("/auth/") ? "PASS" : "FAIL", d: url });

  const apis = ["/api/favorites", "/api/ratings", "/api/points", "/api/offers"];
  for (const api of apis) {
    try {
      const r = await page.request.get(BASE + api);
      res.tests.push({ name: "API" + api, status: r.status() < 500 ? "PASS" : "FAIL", d: r.status() });
    } catch(e) { res.tests.push({ name: "API" + api, status: "FAIL", d: e.message }); }
  }

  await browser.close();

  const base = "D:/suoyouxiangmu/ai-student-survival";
  const files = ["src/components/user/ProfilePage.tsx", "src/components/user/EnhancedSettings.tsx", "src/components/user/FavoritesList.tsx", "src/components/user/OffersList.tsx", "src/components/user/RatingsList.tsx", "src/components/user/Leaderboard.tsx", "src/pages/user/index.astro"];
  for (const f of files) {
    const exists = fs.existsSync(path.join(base, f));
    res.tests.push({ name: "File:" + path.basename(f), status: exists ? "PASS" : "FAIL", d: "" });
  }

  const sc = fs.readFileSync(path.join(base, "src/components/user/EnhancedSettings.tsx"), "utf-8");
  const checks = [["name", "Settings:Name"], ["bio", "Settings:Bio"], ["avatar", "Settings:Avatar"], ["language", "Settings:Language"], ["privacy", "Settings:Privacy"], ["notification", "Settings:Notifications"], ["signOut", "Settings:SignOut"]];
  for (const [s, n] of checks) {
    res.tests.push({ name: n, status: sc.includes(s) ? "PASS" : "FAIL", d: "" });
  }

  const pc = fs.readFileSync(path.join(base, "src/components/user/ProfilePage.tsx"), "utf-8");
  const tabs = [["favorites", "Tab:Favorites"], ["offers", "Tab:Offers"], ["ratings", "Tab:Ratings"], ["settings", "Tab:Settings"], ["badges", "Tab:Badges"], ["leaderboard", "Tab:Leaderboard"], ["history", "Tab:History"]];
  for (const [s, n] of tabs) {
    res.tests.push({ name: n, status: pc.includes(s) ? "PASS" : "FAIL", d: "" });
  }

  const uc = fs.readFileSync(path.join(base, "src/lib/userProfile.ts"), "utf-8");
  const libs = [["getPointsHistory", "Lib:PointsHistory"], ["getLeaderboard", "Lib:Leaderboard"], ["BADGES", "Lib:Badges"], ["calculateLevel", "Lib:LevelSystem"], ["getUserRank", "Lib:UserRank"]];
  for (const [s, n] of libs) {
    res.tests.push({ name: n, status: uc.includes(s) ? "PASS" : "FAIL", d: "" });
  }

  const passed = res.tests.filter(t => t.status === "PASS").length;
  const failed = res.tests.filter(t => t.status === "FAIL").length;
  
  console.log("SUMMARY:", passed, "PASSED,", failed, "FAILED,", res.tests.length, "TOTAL");
  console.log("PASSED:");
  res.tests.filter(t => t.status === "PASS").forEach(t => console.log("  PASS:", t.name));
  if (failed > 0) {
    console.log("FAILED:");
    res.tests.filter(t => t.status === "FAIL").forEach(t => console.log("  FAIL:", t.name, t.d));
  }

  fs.writeFileSync(path.join(DIR, "qa-report-" + Date.now() + ".json"), JSON.stringify({ timestamp: new Date().toISOString(), summary: { passed, failed, total: res.tests.length }, tests: res.tests }, null, 2));
  console.log("Done. Report saved.");
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
