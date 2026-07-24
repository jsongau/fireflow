import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import styles from "./HomepageFAQ.module.css";

interface QA {
  q: string;
  a: string;
}

const FAQS: QA[] = [
  {
    q: "Is this an official Samyang site?",
    a: "No. I built FireFlow on my own, from public information, to show how I would run Customer Experience for this portfolio. It is not affiliated with or endorsed by Samyang Foods or Samyang America.",
  },
  {
    q: "How are products ranked?",
    a: "The rankings are an editorial read, not official Samyang ratings. Each view weighs a few inputs you can see and re-weight yourself, like official prominence, retail visibility, and how often a product drives support questions. Where a family is missing an input, the score is marked lower-confidence instead of guessed.",
  },
  {
    q: "Why are formats grouped into families?",
    a: "Samyang America lists every format as its own product, so the same flavor shows up many times. I normalized the catalog into 45 families across 76 formats, so a buyer picks the flavor first and the format second, instead of scrolling past the same product on repeat.",
  },
  {
    q: "Where does product information come from?",
    a: "Product facts trace to public Samyang America product pages and are labeled Official. Retail engagement markers are labeled Retail signal and date-stamped; they are not sales figures. Reads I built are labeled Editorial, and modeled records are labeled Modeled, so you always know which is which.",
  },
  {
    q: "How are allergens handled?",
    a: "Allergen and preparation facts are bound to the exact format we have an official source for, usually the Multi noodle pack or the 200g sauce bottle. Other formats carry no allergen data rather than borrow another format's, because guessing on a food product is not safe. Always check the current physical package.",
  },
  {
    q: "What does Customer Guidance Opportunity mean?",
    a: "It is an editorial label for a product that tends to draw questions best answered with guidance, like clarifying heat, format differences, or preparation. It is not a defect flag and does not imply a quality problem.",
  },
  {
    q: "Why did I build FireFlow?",
    a: "I built it for one job: the Customer Experience role at Samyang America. Rather than describe how I would run the function, I built it, on a portfolio people recognize, so the thinking is on the screen instead of in a cover letter.",
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
            What FireFlow is, and how the numbers are made.
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

        <SectionNote sectionId="faq" />
      </div>
    </section>
  );
}
