/**
 * Data verification script — run with `npm run verify:data`.
 * Prints the portfolio summary, runs integrity checks, and exercises every
 * ranking view. Exits non-zero on any integrity error so it can gate a build.
 */
import { checkDataIntegrity, DATA_SUMMARY } from "@/data";
import { RANKING_VIEWS, computeRanking } from "@/data/rankings";
import { FAMILY_BY_ID } from "@/data/families";

function main() {
  console.log("FireFlow — data verification\n");
  console.log("Portfolio summary:");
  console.log(`  families: ${DATA_SUMMARY.families} (expected 45)`);
  console.log(`  variants: ${DATA_SUMMARY.variants} (expected 76)`);
  console.log(`  brands:   ${DATA_SUMMARY.brands}`);
  console.log(`  anchors:  ${DATA_SUMMARY.anchors}`);
  console.log("  by brand:");
  for (const b of DATA_SUMMARY.byBrand) console.log(`    ${b.brand}: ${b.families}`);

  console.log("\nRanking views (top 3 each):");
  for (const view of RANKING_VIEWS) {
    const ranked = computeRanking(view.id);
    const top = ranked.slice(0, 3)
      .map((r) => `${FAMILY_BY_ID[r.familyId]?.name} ${r.score}${r.hasMissingInputs ? "*" : ""}`)
      .join("  |  ");
    console.log(`  ${view.label} (${ranked.length} scored): ${top || "none"}`);
  }

  const issues = checkDataIntegrity();
  const errors = issues.filter((i) => i.level === "error");
  const warns = issues.filter((i) => i.level === "warn");

  console.log(`\nIntegrity: ${errors.length} error(s), ${warns.length} warning(s).`);
  for (const i of issues) console.log(`  [${i.level}] ${i.message}`);

  if (errors.length > 0) {
    console.error("\nFAILED — fix data errors above.");
    process.exit(1);
  }
  console.log("\nPASSED — data foundation is structurally sound.");
}

main();
