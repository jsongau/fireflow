import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Segmented, type SegmentedOption } from "@/components/primitives";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import {
  LANES,
  SCENARIOS,
  LANE_BY_ID,
  SCENARIO_BY_ID,
  type DeptId,
  type RoleKind,
  type ScenarioRole,
} from "@/data/warroom";
import styles from "./CrossFunctionalWarRoom.module.css";

/*
 * Cross-Functional War Room.
 * Job competency this demonstrates: cross-functional coordination. The role is
 * the connective tissue between Sales, Supply Chain, Logistics, and Finance, so
 * this chapter shows OWNERSHIP and HANDOFF ORDER, not case resolution (that is
 * the Resolution Simulator). Default view is the standing operating model; each
 * scenario lights up which lanes lead, which support, and in what order. ALL
 * situations are SYNTHETIC.
 */

type Lens = "model" | string;

const ROLE_LABEL: Record<RoleKind, string> = { lead: "Lead", support: "Support" };
const ROLE_GLYPH: Record<RoleKind, string> = { lead: "▲", support: "◆" }; // ▲ ◆

export function CrossFunctionalWarRoom() {
  const [lens, setLens] = useState<Lens>("model");

  const options: SegmentedOption<string>[] = useMemo(
    () => [
      { value: "model", label: "Standing model" },
      ...SCENARIOS.map((s) => ({ value: s.id, label: s.label })),
    ],
    [],
  );

  const scenario = lens === "model" ? null : SCENARIO_BY_ID[lens] ?? null;

  /* dept -> role for the active scenario (undefined = monitoring). */
  const roleByDept = useMemo(() => {
    const map: Partial<Record<DeptId, ScenarioRole>> = {};
    if (scenario) for (const r of scenario.roles) map[r.dept] = r;
    return map;
  }, [scenario]);

  const handoff = useMemo(
    () => (scenario ? [...scenario.roles].sort((a, b) => a.step - b.step) : []),
    [scenario],
  );

  const dominantNames = scenario
    ? scenario.dominant.map((d) => LANE_BY_ID[d].name).join(" and ")
    : "";

  return (
    <section id="warroom" className={styles.section} aria-labelledby="warroom-h">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>Coordinate</p>
            <h2 id="warroom-h" className={styles.h2}>Cross-Functional War Room</h2>
            <p className={styles.lede}>
              The Customer Experience manager is the connective tissue. The job is not only answering
              the account. It is making sure Sales, Supply Chain, Logistics, and Finance see the same
              issue, the same owner, and the same next step. Start with the standing operating model,
              then pick a scenario to watch a handoff move through it.
            </p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <span className={styles.toolbarLabel}>View</span>
          <Segmented<string>
            label="War Room view"
            options={options}
            value={lens}
            onChange={setLens}
            size="sm"
          />
        </div>

        {scenario ? (
          <div className={styles.scenarioHead}>
            <h3 className={styles.scenarioTitle}>{scenario.title}</h3>
            <p className={styles.trigger}>{scenario.trigger}</p>
            <p className={styles.gravity}>
              <span className={styles.gravityLabel}>Center of gravity</span> {dominantNames}
            </p>
          </div>
        ) : (
          <p className={styles.modelIntro}>
            The standing operating model. This is who owns what on a normal day, before anything goes
            wrong. Pick a scenario above to see which lanes lead and which support.
          </p>
        )}

        {/* Department lanes — the fixed spine. Order stays stable across scenarios
            so the same grid can be compared, with step numbers marking sequence. */}
        <ul className={styles.lanes} aria-label="Department lanes">
          {LANES.map((lane) => {
            const role = roleByDept[lane.id];
            const state = !scenario ? "model" : role ? role.kind : "monitoring";
            return (
              <li
                key={lane.id}
                className={styles.lane}
                data-state={state}
              >
                <div className={styles.laneHead}>
                  <span className={styles.laneGlyph} aria-hidden="true">{lane.glyph}</span>
                  <h4 className={styles.laneName}>{lane.name}</h4>
                  {scenario ? (
                    role ? (
                      <span className={styles.roleTag} data-kind={role.kind}>
                        <span className={styles.stepNum} aria-hidden="true">{role.step}</span>
                        <span className={styles.roleGlyph} aria-hidden="true">{ROLE_GLYPH[role.kind]}</span>
                        {ROLE_LABEL[role.kind]}
                      </span>
                    ) : (
                      <span className={styles.roleTag} data-kind="monitoring">
                        <span className={styles.roleGlyph} aria-hidden="true">{"○"}</span>
                        Monitoring
                      </span>
                    )
                  ) : (
                    <span className={styles.answers}>{lane.answers}</span>
                  )}
                </div>

                {scenario ? (
                  <p className={styles.laneBody}>
                    {role ? role.action : (
                      <>Not in this handoff. Stays informed in case the case turns. Owns: {lane.owns}</>
                    )}
                  </p>
                ) : (
                  <p className={styles.laneBody}>{lane.owns}</p>
                )}
              </li>
            );
          })}
        </ul>

        {/* Explicit handoff order for the active scenario, as a numbered sequence. */}
        {scenario && (
          <div className={styles.handoff}>
            <h4 className={styles.handoffTitle}>Handoff order</h4>
            <ol className={styles.handoffList}>
              {handoff.map((r) => (
                <li key={`${r.dept}-${r.step}`} className={styles.handoffItem} data-kind={r.kind}>
                  <span className={styles.handoffStep} aria-hidden="true">{r.step}</span>
                  <span className={styles.handoffBody}>
                    <span className={styles.handoffDept}>
                      <span aria-hidden="true">{LANE_BY_ID[r.dept].glyph}</span> {LANE_BY_ID[r.dept].name}
                      <span className={styles.handoffKind}> · {ROLE_LABEL[r.kind]}</span>
                    </span>
                    <span className={styles.handoffAction}>{r.action}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className={styles.cxRole}>
              <span className={styles.cxRoleLabel}>What CX holds together</span> {scenario.cxRole}
            </p>
          </div>
        )}

        <p className={styles.boundary}>
          This chapter maps ownership and handoffs. To work one case end to end, with evidence and the
          next customer update, <Link to="/support#simulate" className={styles.boundaryLink}>run the resolution simulator</Link>.
        </p>

        <SectionNote sectionId="warroom" />
      </div>
    </section>
  );
}
