import styles from "./HomepageFAQ.module.css";

interface QA {
  q: string;
  a: string;
}

const FAQS: QA[] = [
  {
    q: "Is this an official Samyang site?",
    a: "No. FireFlow is an independent portfolio concept built from publicly available information. It is not affiliated with, commissioned by, or connected to Samyang America or Samyang Foods. It exists to demonstrate a Customer Experience approach, not to represent the company.",
  },
  {
    q: "How are products ranked?",
    a: "Rankings are an editorial model, never official Samyang ratings. Each view weighs a set of transparent inputs (things like official prominence, retail visibility, and support-inquiry value), and you can re-weight them yourself. Where inputs are missing for a family, the score is marked lower-confidence rather than guessed.",
  },
  {
    q: "Are the inquiry records real?",
    a: "No. Every case, customer, order, shipment, metric, owner, timeline, and outcome shown in the resolution and command sections is synthetic, invented purely to demonstrate how a CX workflow behaves. Nothing here reflects real people or real transactions.",
  },
  {
    q: "Why are formats grouped into families?",
    a: "Samyang America lists each format as its own product, so the same flavor can appear many times. FireFlow normalizes those listings into 45 families across 76 formats, so you browse by flavor and then choose a format, instead of scrolling past the same product repeated.",
  },
  {
    q: "Can consumers submit a real complaint?",
    a: "Not through FireFlow. The consumer path shows how a complaint would be classified, what evidence it would need, and where it would route. For a genuine product concern, always contact Samyang America directly and keep your packaging and lot code.",
  },
  {
    q: "Can vendors place a real order?",
    a: "No. The vendor path is a demonstration of how order, deduction, and shipment issues would be structured and routed. It does not connect to any ordering or account system, and no real orders can be placed here.",
  },
  {
    q: "Where does product information come from?",
    a: "Product facts trace to public Samyang America product information and are labeled Official. Retail engagement markers are labeled Retail signal and date-stamped. They are not sales figures. Interpretations built by this project are labeled Editorial, and demonstration data is labeled Synthetic.",
  },
  {
    q: "How are allergens handled?",
    a: "Allergen and preparation facts are bound only to the exact format we have an official source for, typically the Multi noodle pack or the 200g sauce bottle. Other formats deliberately carry no allergen data rather than borrow another format's, because that would be unsafe for a food product. Always verify the current physical package.",
  },
  {
    q: "What does Customer Guidance Opportunity mean?",
    a: "It is an editorial label for a product that tends to generate questions best answered with guidance, for example clarifying heat, format differences, or preparation. It is not a defect signal and does not imply a quality problem.",
  },
  {
    q: "Why was FireFlow created?",
    a: "As a portfolio piece: a way to show how real product data, honest sourcing, and a structured resolution workflow come together into a Customer Experience system, using a portfolio people recognize, without pretending to be the brand.",
  },
];

export function HomepageFAQ() {
  return (
    <section id="faq" className={styles.section} aria-labelledby="faq-h">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>About</p>
          <h2 id="faq-h" className={styles.h2}>Frequently asked questions</h2>
          <p className={styles.lede}>
            The honest answers: what FireFlow is, what it isn&rsquo;t, and how the numbers are made.
          </p>
        </header>

        <div className={styles.list}>
          {FAQS.map((item) => (
            <details key={item.q} className={styles.item}>
              <summary className={styles.summary}>
                <span className={styles.qText}>{item.q}</span>
                <span className={styles.marker} aria-hidden="true" />
              </summary>
              <p className={styles.answer}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
