import { useMemo } from "react";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import { LAST_STAGE, deriveCase, type RoutedCase } from "@/data/caseBoard";
import { REPEAT_ISSUE_TRIGGER, THRESHOLD_BASIS } from "@/data/escalation";
import styles from "./PatternWatch.module.css";

/**
 * PatternWatch — where a queue stops being a list and becomes a signal.
 *
 * Counts OPEN cases by category and compares each against the same
 * `REPEAT_ISSUE_TRIGGER` the intake routing check evaluates. When a category
 * crosses it, the case stops being an incident: it gets a root cause owner and
 * goes on the leadership report.
 *
 * It reads live state, so a case routed through account support intake moves a
 * bar here. That causal link is the entire argument. A dashboard that only
 * describes the complaint-to-pattern loop is a diagram; one you can trip by
 * filing a third case is a demonstration.
 *
 * State never rests on color. A category over the trigger carries the word
 * "Pattern" and a glyph, its bar is hatched rather than merely tinted, and the
 * row's left rule thickens. A colorblind reader loses nothing.
 */
export function PatternWatch({ cases }: { cases: RoutedCase[] }) {
  const rows = useMemo(() => {
    const open = cases.filter((c) => c.stageIndex < LAST_STAGE);
    const byCategory = new Map<string, { label: string; owner: string; count: number }>();

    for (const c of open) {
      const d = deriveCase(c);
      if (!d) continue;
      const existing = byCategory.get(c.categoryId);
      if (existing) existing.count += 1;
      else
        byCategory.set(c.categoryId, {
          label: d.category.label,
          owner: d.category.owner,
          count: 1,
        });
    }

    return Array.from(byCategory.entries())
      .map(([id, v]) => ({ id, ...v, flagged: v.count >= REPEAT_ISSUE_TRIGGER }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [cases]);

  const max = rows.reduce((m, r) => Math.max(m, r.count), 0) || 1;
  const flagged = rows.filter((r) => r.flagged);

  if (rows.length === 0) return null;

  return (
    <section className={styles.wrap} aria-labelledby="pattern-watch-h">
      <div className={styles.head}>
        <div>
          <h3 id="pattern-watch-h" className={styles.title}>
            Open cases by category
          </h3>
          <p className={styles.sub}>
            {REPEAT_ISSUE_TRIGGER} or more open cases in one category stop being incidents. File a
            case through account support and this moves.
          </p>
        </div>
        <p className={styles.trigger}>
          Trigger at {REPEAT_ISSUE_TRIGGER}
        </p>
      </div>

      <ul className={styles.rows}>
        {rows.map((r) => (
          <li key={r.id} className={styles.row} data-flagged={r.flagged ? "yes" : undefined}>
            <span className={styles.label}>{r.label}</span>

            <span className={styles.track}>
              <span
                className={styles.fill}
                style={{ width: `${Math.round((r.count / max) * 100)}%` }}
                data-flagged={r.flagged ? "yes" : undefined}
              />
            </span>

            <span className={styles.count}>
              <span className={styles.countNum}>{r.count}</span>
              {r.flagged && (
                <span className={styles.flag}>
                  <span aria-hidden="true">▲</span> Pattern
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      {flagged.length > 0 && (
        <div className={styles.banner}>
          <p className={styles.bannerHead}>
            <span aria-hidden="true">▲</span> Pattern flagged
          </p>
          <p className={styles.bannerBody}>
            {flagged.map((f) => f.label.toLowerCase()).join(", ")}{" "}
            {flagged.length > 1 ? "are" : "is"} at or above the repeat-issue trigger on this board. This is the point where I stop working them as separate cases and ask{" "}
            {Array.from(new Set(flagged.map((f) => f.owner))).join(" and ")} for a root cause, so
            the account stops meeting the same failure and I stop paying to resolve it twice.
          </p>
        </div>
      )}

      <p className={styles.basis}>
        <span className={styles.basisLabel}>About this trigger.</span> {THRESHOLD_BASIS}
      </p>

      <SectionNote sectionId="ops-patterns" />
    </section>
  );
}
