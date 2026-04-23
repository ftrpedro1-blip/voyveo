import { mkdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const playwrightPath = "C:/Users/ftrpe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
const { chromium } = await import(pathToFileURL(playwrightPath).href);
const screenshotDir = "artifacts/qa";

await mkdir(screenshotDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true
});

const viewports = [
  { name: "small", width: 320, height: 740 },
  { name: "android", width: 360, height: 800 },
  { name: "iphone", width: 390, height: 844 },
  { name: "large", width: 430, height: 932 },
  { name: "desktop", width: 1280, height: 900 }
];

const routes = [
  ["home", "http://localhost:4173/"],
  ["list", "http://localhost:4173/#list"],
  ["map", "http://localhost:4173/#map"],
  ["gallery", "http://localhost:4173/#gallery/cassia-house"],
  ["admin", "http://localhost:4173/#admin"]
];

const issues = [];
let expectedPublicPins = 1;

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 2 });

  for (const [routeName, url] of routes) {
    await page.goto(url, { waitUntil: "load" });
    await page.waitForTimeout(900);

    const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (hasHorizontalOverflow) issues.push(`${viewport.name}/${routeName}: horizontal overflow`);

    const clippedButtons = await page.evaluate(() =>
      [...document.querySelectorAll("button, a")].filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.left < -1 || rect.right > window.innerWidth + 1);
      }).length
    );
    if (clippedButtons) issues.push(`${viewport.name}/${routeName}: ${clippedButtons} clipped interactive elements`);

    if (routeName === "map") {
      await page.waitForTimeout(700);
      expectedPublicPins = await page.evaluate(async () => {
        const response = await fetch("/api/db", { cache: "no-store" });
        const db = await response.json();
        return db.galleries.filter((gallery) => gallery.public_visible || gallery.is_house_gallery).length;
      });
      const mapState = await page.evaluate(() => ({
        hasLeaflet: Boolean(document.querySelector(".leaflet-container")),
        markerCount: document.querySelectorAll(".leaflet-marker-icon").length,
        hasOverlay: Boolean(document.querySelector(".mapOverlay")),
        overlayOutsideMap: Boolean(document.querySelector(".selectedMapCard .mapOverlay")) && !Boolean(document.querySelector(".mapScene .mapOverlay")),
        hasBlankMap: !document.querySelector(".leaflet-container")
      }));

      if (!mapState.hasLeaflet) issues.push(`${viewport.name}/map: Leaflet map did not load`);
      if (mapState.markerCount < expectedPublicPins) issues.push(`${viewport.name}/map: expected ${expectedPublicPins} public institution pins, found ${mapState.markerCount}`);
      if (!mapState.hasOverlay) issues.push(`${viewport.name}/map: missing selected gallery overlay`);
      if (!mapState.overlayOutsideMap) issues.push(`${viewport.name}/map: selected card is still inside map canvas`);
      if (mapState.hasBlankMap) issues.push(`${viewport.name}/map: blank map`);
      const hasLeafletAttribution = await page.locator(".leaflet-control-attribution").first().isVisible().catch(() => false);
      const hasExternalCredit = await page.locator(".mapCredit").first().isVisible().catch(() => false);
      if (hasLeafletAttribution) issues.push(`${viewport.name}/map: attribution still inside Leaflet canvas`);
      if (!hasExternalCredit) issues.push(`${viewport.name}/map: missing external map credit`);

      const marker = page.locator(".leaflet-marker-icon").first();
      if ((await marker.count()) > 0) {
        await marker.dispatchEvent("click");
        await page.waitForTimeout(250);
        const popupVisible = await page.locator(".leaflet-popup").first().isVisible().catch(() => false);
        if (!popupVisible) issues.push(`${viewport.name}/map: popup did not open`);
      }
    }

    if (["home", "list", "gallery"].includes(routeName)) {
      await page.waitForTimeout(700);
      const imageState = await page.evaluate(() => {
        const images = [...document.querySelectorAll(".dataImage img")];
        const loaded = images.filter((image) => image.complete && image.naturalWidth > 0 && image.naturalHeight > 0).length;
        const failed = document.querySelectorAll(".dataImage.imageFailed").length;
        const covered = images.filter((image) => image.parentElement.querySelector(".imageFallback")).length;
        const visibleCards = document.querySelectorAll(".showCard, .showRow").length;
        return { covered, failed, loaded, total: images.length, visibleCards };
      });

      if (imageState.failed) issues.push(`${viewport.name}/${routeName}: ${imageState.failed} failed images`);
      if (routeName === "home" && imageState.visibleCards !== 5) issues.push(`${viewport.name}/home: expected 5 featured cards, found ${imageState.visibleCards}`);
      if (routeName === "home" && imageState.covered < 5) issues.push(`${viewport.name}/home: expected image or premium placeholder on every featured card`);
      if (routeName === "list" && imageState.covered < 4) issues.push(`${viewport.name}/list: expected image or premium placeholder on agenda cards`);
    }

    if (routeName === "home") {
      const firstFeatured = await page.locator(".featuredCard h2").first().textContent();
      if (firstFeatured?.trim() !== "Un hogar para lo sensible") issues.push(`${viewport.name}/home: Cassia is not first in featured`);
    }

    if (routeName === "list") {
      const firstAgendaGallery = await page.locator(".agendaItem small").first().textContent();
      if (!firstAgendaGallery?.includes("Cassia House")) issues.push(`${viewport.name}/list: Cassia is not first in agenda`);
    }

    if (viewport.name === "iphone" && ["home", "map", "admin"].includes(routeName)) {
      await page.screenshot({ path: `${screenshotDir}/voy-veo-${routeName}.png`, fullPage: true });
    }

    if (viewport.name === "desktop" && ["home", "map"].includes(routeName)) {
      await page.screenshot({ path: `${screenshotDir}/voy-veo-${routeName}-desktop.png`, fullPage: true });
    }
  }

  await page.close();
}

await browser.close();

if (issues.length) {
  throw new Error(`QA failed:\n${issues.join("\n")}`);
}

console.log("Captured Voy Veo mobile and desktop screenshots");
console.log("QA passed on 320, 360, 390, 430 and 1280px widths");
