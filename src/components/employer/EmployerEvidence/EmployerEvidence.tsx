import { ButtonLink } from "@/components/primitives";
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
    informed: "A consumer products and retail operations background, where knowing the exact item and its facts is the start of every good answer.",
    href: "#product",
    linkLabel: "Open a product dossier",
  },
  {
    capability: "Customer operations and order management",
    demonstrates: "A connected path from the first question to a resolved case, with the product, evidence, owner, and next customer update carried the whole way.",
    informed: "Years of customer intake, billing, issue resolution, follow-up, and owning the process end to end.",
    href: "#resolve",
    linkLabel: "Open the inquiry paths",
  },
  {
    capability: "Escalation standards and complex issue resolution",
    demonstrates: "Severity, required evidence, the accountable owner, collaborators, and a promised customer update, made visible before a delay becomes a service problem.",
    informed: "Building repeatable workflows and working high-stakes issues to a clear resolution.",
    href: "#simulate",
    linkLabel: "Run the resolution simulator",
  },
  {
    capability: "Cross-functional coordination",
    demonstrates: "Cases route to Sales, Supply Chain, Logistics, Finance, and Quality, with ownership named at each step rather than left to the customer to figure out.",
    informed: "Coordinating across departments, vendors, managers, and customers to move a problem forward.",
    href: "#o2c",
    linkLabel: "Open the order-to-cash flow",
  },
  {
    capability: "Metrics and accountability",
    demonstrates: "A manager's synthetic queue showing SLA exposure, overdue updates, and open deductions, every value labeled synthetic.",
    informed: "Tracking operational activity and customer outcomes, without claiming any real Samyang results.",
    href: "#command",
    linkLabel: "Open the command center",
  },
  {
    capability: "Continuous improvement",
    demonstrates: "A loop that separates a single complaint from a repeated issue and turns the pattern into a root cause and a corrective action.",
    informed: "Turning repeated customer and process issues into better procedures.",
    href: "#signals",
    linkLabel: "Open product signals",
  },
  {
    capability: "SAP SD aligned learning and order-to-cash",
    demonstrates: "One synthetic order followed through order entry, pricing, delivery, billing, and deductions, with the failure points a customer experience lead should watch.",
    informed: "Transferable operational understanding and readiness to learn the company's SAP SD environment. This is not direct SAP tenure.",
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
      </div>
    </section>
  );
}
