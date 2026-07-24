import { ButtonLink } from "@/components/primitives";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import styles from "./EmployerEvidence.module.css";

interface Capability {
  capability: string;
  demonstrates: string;
  informed: string;
  href: string;
  linkLabel: string;
}

/**
 * "What this demonstrates" — organized by capability, not by pasting the job
 * description. Each item connects a target responsibility to a working part of
 * FireFlow and to Nathan's defensible, transferable experience. Claims stay
 * honest: no direct SAP tenure, no invented company results.
 */
const CAPABILITIES: Capability[] = [
  {
    capability: "Product knowledge",
    demonstrates: "Per-format product dossiers with source labels, so the team can tell what is verified, what is editorial, and what still needs checking before answering a customer.",
    informed: "Retail and grocery operations, including supply coordination at a national Asian grocery chain, where knowing the exact item and its facts is the start of every good answer.",
    href: "#product",
    linkLabel: "Open a product dossier",
  },
  {
    capability: "Customer operations and order management",
    demonstrates: "A connected path from the first question to a resolved case, with the product, evidence, owner, and next customer update carried the whole way.",
    informed: "Owning order-to-cash by analog: patient billing from eligibility through claims, billing, and collections, plus end-to-end ecommerce order fulfillment and demand planning.",
    href: "#resolve",
    linkLabel: "Open the inquiry paths",
  },
  {
    capability: "Escalation standards and complex issue resolution",
    demonstrates: "Severity, required evidence, the accountable owner, collaborators, and a promised customer update, made visible before a delay becomes a service problem.",
    informed: "Front-line dispute work: resolving billing and insurance disputes and writing the SOPs and escalation steps that keep them from recurring.",
    href: "#simulate",
    linkLabel: "Run the resolution simulator",
  },
  {
    capability: "De-escalation and service recovery",
    demonstrates: "A calm, evidence-first path that moves a case from reported to resolved with the next customer update always visible, so pressure never turns into a lost relationship.",
    informed: "Years as the calm party in high-stakes conversations, and as the customer pushing a vendor to correct poor work, so I know what an escalating customer needs to feel heard and what actually resolves the problem.",
    href: "#simulate",
    linkLabel: "Run the resolution simulator",
  },
  {
    capability: "Cross-functional coordination",
    demonstrates: "A War Room operating model where each scenario names who leads, who supports, and in what order, so ownership is set before the customer has to figure it out.",
    informed: "Routing issues to the owner from both sides of the table: as a retailer's first point of contact for vendor disputes, and as the customer chasing outside labs to correct failed work.",
    href: "#warroom",
    linkLabel: "Open the War Room",
  },
  {
    capability: "Metrics and accountability",
    demonstrates: "A manager's queue showing SLA exposure, overdue updates, and open deductions.",
    informed: "Moving the numbers that matter, from one practice's reviews growing from about 10 to more than 700 five-star to back-to-back seven-figure revenue years, without claiming any Samyang results.",
    href: "#command",
    linkLabel: "Open the command center",
  },
  {
    capability: "Continuous improvement",
    demonstrates: "A loop that separates a single complaint from a repeated issue and turns the pattern into a root cause and a corrective action.",
    informed: "Turning repeated disputes and process breakdowns into better procedures and the operational tools I built to support them.",
    href: "#signals",
    linkLabel: "Open product signals",
  },
  {
    capability: "SAP SD aligned learning and order-to-cash",
    demonstrates: "One order followed through order entry, pricing, delivery, billing, and deductions, with the failure points a customer experience lead should watch.",
    informed: "Transferable order-to-cash understanding from revenue-cycle and electronic claims work on EDI clearinghouses, plus self-directed SAP SD study. This is not direct SAP tenure.",
    href: "#o2c",
    linkLabel: "Open the SAP SD chapter",
  },
];

export function EmployerEvidence() {
  return (
    <section id="fit" className={styles.section} aria-labelledby="fit-h">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>What this demonstrates</p>
        <h2 id="fit-h" className={styles.h2}>Each capability, tied to a working part of FireFlow.</h2>
        <p className={styles.roleLine}>
          For a consumer products company, customer experience is not only answering messages. It is
          knowing the product, understanding the order, protecting the customer relationship, and making
          sure Sales, Supply Chain, Finance, Quality, and Operations are working from the same truth.
        </p>
        <p className={styles.lede}>
          Rather than repeat the job description, here is how the artifact shows the work. Open any
          chapter to see it running.
        </p>

        <ul className={styles.grid}>
          {CAPABILITIES.map((c) => (
            <li key={c.capability} className={styles.card}>
              <h3 className={styles.cardTitle}>{c.capability}</h3>
              <p className={styles.demonstrates}>{c.demonstrates}</p>
              <details className={styles.details}>
                <summary className={styles.summary}>What informed my approach</summary>
                <p className={styles.informed}>{c.informed}</p>
              </details>
              <ButtonLink href={c.href} variant="ghost" size="sm">{c.linkLabel}</ButtonLink>
            </li>
          ))}
        </ul>

        <SectionNote sectionId="fit" />
      </div>
    </section>
  );
}
