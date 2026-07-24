import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import {
  FACTS,
  DIMENSIONS,
  TABLE_BY_ID,
  COLUMN_ROLE_META,
  dimensionsForFact,
  factsForDimension,
  conformedDimensionIds,
  STAR_SCHEMA_DISCLOSURE,
  type ModelTable,
} from "@/data/dataArch";
import styles from "./DataModelStudio.module.css";

/*
 * Dimensional Model Studio.
 * A star-schema study of the FireFlow CX domain. Fact tables are pinned to one
 * grain; product, account, and date are conformed dimensions shared across
 * facts. Each table records the FireFlow data it was modeled from, so the model
 * reads as derived from the app rather than invented. Everything is synthetic
 * and labeled. State is never signaled by color alone.
 */

const KIND_META: Record<ModelTable["kind"], { label: string; glyph: string }> = {
  fact: { label: "Fact table", glyph: "◆" },
  dimension: { label: "Dimension", glyph: "●" },
};

/** Top-scoring fact, selected on mount so the studio never opens empty. */
const DEFAULT_TABLE_ID = FACTS[0]!.id;

export function DataModelStudio() {
  const [tableId, setTableId] = useState<string>(DEFAULT_TABLE_ID);

  const table = TABLE_BY_ID[tableId] ?? FACTS[0]!;
  const conformed = useMemo(() => conformedDimensionIds(), []);

  /** The related tables a selected table connects to, as navigable chips. */
  const related: ModelTable[] =
    table.kind === "fact"
      ? dimensionsForFact(table).map((id) => TABLE_BY_ID[id]!).filter(Boolean)
      : factsForDimension(table.id);

  return (
    <section id="data-model" className={styles.section} aria-labelledby="data-model-h">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Data Architecture · Dimensional model study</p>
        <h2 id="data-model-h" className={styles.h2}>The model under the questions.</h2>
        <p className={styles.lede}>
          The catalog, the order book, the case queue, and the deduction file are not four apps.
          They are one dimensional model. Here is the star schema the FireFlow data already runs
          on: fact tables pinned to the grain of one real event, and a handful of dimensions every
          fact shares. Pick a table to read its grain, its columns, and the FireFlow data it was
          modeled from.
        </p>

        <div className={styles.badgeRow}>
          <span className={styles.badgeNote}>
            A modeling study aligned to star-schema practice. Not a deployed warehouse.
          </span>
        </div>

        <div className={styles.layout}>
          {/* Table picker, grouped fact then dimension */}
          <div className={styles.picker}>
            <div className={styles.pickerGroup}>
              <h3 className={styles.pickerH}>
                <span aria-hidden="true">{KIND_META.fact.glyph}</span> Fact tables
              </h3>
              <ul className={styles.pickerList}>
                {FACTS.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      className={styles.pickBtn}
                      data-kind="fact"
                      aria-pressed={t.id === tableId}
                      onClick={() => setTableId(t.id)}
                    >
                      <span className={styles.pickName}>{t.name}</span>
                      <span className={styles.pickGrain}>{t.grain}</span>
                      {t.id === tableId && <span className={styles.srOnly}> (selected)</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.pickerGroup}>
              <h3 className={styles.pickerH}>
                <span aria-hidden="true">{KIND_META.dimension.glyph}</span> Dimensions
              </h3>
              <ul className={styles.pickerList}>
                {DIMENSIONS.map((t) => {
                  const isConformed = conformed.includes(t.id);
                  return (
                    <li key={t.id}>
                      <button
                        type="button"
                        className={styles.pickBtn}
                        data-kind="dimension"
                        aria-pressed={t.id === tableId}
                        onClick={() => setTableId(t.id)}
                      >
                        <span className={styles.pickName}>
                          {t.name}
                          {isConformed && (
                            <span className={styles.conformedTag}>
                              <span aria-hidden="true">◇</span> conformed
                            </span>
                          )}
                        </span>
                        <span className={styles.pickGrain}>{t.grain}</span>
                        {t.id === tableId && <span className={styles.srOnly}> (selected)</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Detail for the selected table */}
          <div className={styles.detail}>
            <div className={styles.detailHead}>
              <span className={styles.kindTag} data-kind={table.kind}>
                <span aria-hidden="true">{KIND_META[table.kind].glyph}</span>{" "}
                {KIND_META[table.kind].label}
              </span>
              <h3 className={styles.detailTitle}>{table.name}</h3>
            </div>

            <p className={styles.grain}>
              <span className={styles.grainLabel}>Grain</span> {table.grain}
            </p>
            <p className={styles.purpose}>{table.purpose}</p>
            <p className={styles.derived}>
              <span className={styles.derivedLabel}>Modeled from</span> {table.derivedFrom}
            </p>

            <div className={styles.columns} role="table" aria-label={`${table.name} columns`}>
              <div className={styles.colHead} role="row" aria-hidden="true">
                <span role="columnheader">Column</span>
                <span role="columnheader">Type</span>
                <span role="columnheader">Role</span>
              </div>
              <ul className={styles.colList}>
                {table.columns.map((c) => {
                  const meta = COLUMN_ROLE_META[c.role];
                  const ref = c.references ? TABLE_BY_ID[c.references] : undefined;
                  return (
                    <li key={c.name} className={styles.col} role="row">
                      <span className={styles.colMain} role="cell">
                        <span className={styles.colName}>{c.name}</span>
                        <span className={styles.colNote}>
                          {c.note}
                          {ref && (
                            <>
                              {" "}
                              <button
                                type="button"
                                className={styles.refLink}
                                onClick={() => setTableId(ref.id)}
                              >
                                Open {ref.name}
                              </button>
                            </>
                          )}
                        </span>
                      </span>
                      <span className={styles.colType} role="cell">{c.type}</span>
                      <span className={styles.colRole} data-role={c.role} role="cell">
                        <span aria-hidden="true">{meta.glyph}</span> {meta.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Star: the selected table and what it connects to */}
            <div className={styles.related}>
              <h4 className={styles.relatedH}>
                {table.kind === "fact" ? "Joins to these dimensions" : "Referenced by these facts"}
              </h4>
              <div className={styles.relatedChips}>
                {related.length === 0 ? (
                  <p className={styles.relatedEmpty}>
                    Nothing references this table yet in the study.
                  </p>
                ) : (
                  related.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={styles.relatedChip}
                      data-kind={r.kind}
                      onClick={() => setTableId(r.id)}
                    >
                      <span aria-hidden="true">{KIND_META[r.kind].glyph}</span> {r.name}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Conformed-dimension payoff, computed not asserted */}
        <div className={styles.conformed}>
          <h3 className={styles.conformedH}>Why the dimensions are conformed</h3>
          <p className={styles.conformedLede}>
            The whole point of the star is that a case, an order, and a chargeback for the same
            buyer meet on one key instead of four spellings of a name. These dimensions are shared
            by two or more facts, so a report can cross them without a fuzzy match:
          </p>
          <div className={styles.conformedList}>
            {conformed.map((id) => {
              const dim = TABLE_BY_ID[id]!;
              const uses = factsForDimension(id);
              return (
                <button
                  key={id}
                  type="button"
                  className={styles.conformedItem}
                  onClick={() => setTableId(id)}
                >
                  <span className={styles.conformedName}>
                    <span aria-hidden="true">◇</span> {dim.name}
                  </span>
                  <span className={styles.conformedUses}>
                    shared by {uses.map((u) => u.name).join(", ")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <p className={styles.disclosure}>
          <span className={styles.disclosureTag} aria-hidden="true">ⓘ</span> {STAR_SCHEMA_DISCLOSURE}
        </p>
        <p className={styles.next}>
          <Link to="/intelligence#integration" className={styles.nextLink}>
            See the systems these tables are loaded from
          </Link>
        </p>
        <p className={styles.next}>
          <Link to="/intelligence#customer-master" className={styles.nextLink}>
            Read the customer master behind dim_account
          </Link>
        </p>

        <SectionNote sectionId="data-model" />
      </div>
    </section>
  );
}
