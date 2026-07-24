import type {
  OperatorNoteContent,
  NoteLine,
} from "@/components/employer/OperatorNotePanel/OperatorNotePanel";

/* Re-exported so SectionNote (and any future consumer) can pull the note types
   from one place without reaching back into the panel component. */
export type { OperatorNoteContent, NoteLine };

/**
 * SECTION_NOTES - Nathan's Notes for each main section, keyed by the section's
 * anchor id. One note per section. Collapsed to a one-line hook by default and
 * expanded on demand by SectionNote. These are fourth-wall builder commentary,
 * never product UI. All operational data referenced here is synthetic.
 *
 * Voice authority: skills/nathans-notes-voice. Each note is a short label (the
 * "now" tag in the open panel, e.g. "The case board"), a hook for the collapsed
 * teaser, and a body of two to four sentences: the mechanic on screen, why it
 * serves the account, and one honest caveat or refusal. Judgment over
 * qualification. The panel's always-on footer carries the global synthetic-data
 * disclosure, so a note repeats it only when the invention is the point.
 */
export const SECTION_NOTES: Record<string, OperatorNoteContent> = {
  hero: {
    title: "One product, carried the whole way",
    label: "The hero",
    hook: "A buyer should not re-establish which product they mean when they move from browsing to ordering to a case.",
    lines: [
      {
        text: "Pick a product here and it stays picked through comparison, the order builder, and account support, so what the buyer means is never in question. Browse, buy, and support are usually three systems that share nothing, and the buyer re-introduces their own problem at every seam. Carrying state across routes cost more to build than three standalone screens, and I paid it because the cheap version bills the customer instead.",
      },
    ],
  },

  "order-tour": {
    title: "A route, because minutes are the budget",
    label: "The guided tour",
    hook: "The full story runs across three pages. A reviewer with three minutes gets a route through it, not a map of it.",
    lines: [
      {
        text: "The argument this site makes runs across three pages, and a reviewer screening a stack of applications gives it minutes, so the tour walks one retailer order from comparison to a resolved claim instead of handing over a map. Next does real work at the decision stop: 120 cases committed, 40 backordered, and the retailer told about the price before the invoice, the way I would work it. Nothing locks; a tour that freezes the page proves nothing about the product under it.",
      },
    ],
  },

  portfolio: {
    title: "One flavor, several records",
    label: "The portfolio",
    hook: "A customer sees one flavor. The operation sees several formats, and the wrong one on a shelf is a mis-stock.",
    lines: [
      {
        text: "A customer sees one flavor; the operation sees several formats and case packs, each with its own record. When those collapse into one answer, a buyer reads the cup's allergen line, stocks the bowl, and then explains the mis-stock to their own manager with our name inside it. I normalized the catalog into families so naming the right format is our job, not an entry requirement for a correct answer.",
      },
    ],
  },

  compare: {
    title: "Head-to-head, two at a time",
    label: "The comparison",
    hook: "A buyer deciding between two SKUs is not browsing a catalog, so the comparison is capped at two.",
    lines: [
      {
        text: "The comparison is capped at two because a buyer deciding what earns one shelf facing is choosing between finalists, not browsing a wall of columns nobody finishes. Evidence confidence is its own row, so before anyone commits to a value they can see whether we verified it or inferred it. Where we cannot source an allergen to the exact package, the cell says Verify package; a confident wrong answer is worse than an honest instruction to check the label.",
      },
    ],
  },

  order: {
    title: "Minimums and lead times belong on the card",
    label: "The order builder",
    hook: "A buyer plans a promotion around a lead time. Hiding it until checkout is how the promotion misses.",
    lines: [
      {
        text: "Case packs, minimums, and lead times sit on the product card, not at checkout, because a buyer commits shelf space and promotion dates against those numbers before ordering. Below-minimum and short-of-a-pallet flags sit on the line in words and a glyph, so the order gets corrected before submit instead of rejected the next day. I have been the buyer whose truck arrived light with the set already promised; a lead time shown up front is a promotion you can still move.",
      },
    ],
  },

  "standing-order": {
    title: "A standing order fails politely, then all at once",
    label: "The standing order",
    hook: "The cadence here can hold instead of short-shipping, because a silent short on an auto-release is the worst kind.",
    lines: [
      {
        text: "A standing order is trust on a timer: the buyer stops watching because the cadence is the promise. So when stock runs tight, the release here holds and notifies instead of shipping most of it and letting the dock discover the rest. The order and price are modeled; the rule is the point, and it survives any real catalog: forecast before the release fires, and never let an auto-release surprise the buyer.",
      },
    ],
  },

  quote: {
    title: "A quote with no clock becomes a dispute",
    label: "The quote intake",
    hook: "A buyer who sends a request for pricing into silence cannot plan, and a quote with no expiry gets acted on after the price has moved.",
    lines: [
      {
        text: "Trade price is not public, so this intake collects volume, ship-to, and terms up front, carries a turnaround commitment, and stamps every quote with a valid-until date. A request that disappears into a queue leaves the buyer unable to commit a promotion, and the silence is the part they remember. I do not let a quote go out without an expiry; a price honored past its window becomes the same stale-condition dispute this whole system exists to prevent.",
      },
    ],
  },

  resolve: {
    title: "Ask only what changes the answer",
    label: "The intake",
    hook: "The case opens from the exact product, so the account never re-enters what we already hold.",
    lines: [
      {
        text: "A case opens from the product the account already selected and asks only for facts that change the routing; we already hold the family, format, and allergen line. Every field we could have looked up is the buyer repeating themselves while something is already going wrong. I do not add an intake question unless it changes what we do next, because a longer form feels thorough on our side and reads as indifference on theirs.",
      },
    ],
  },

  simulate: {
    title: "No commitment before it clears approval",
    label: "The case lifecycle",
    hook: "Verified facts kept apart from assumptions, one owner, and no promise to the account before it clears approval.",
    lines: [
      {
        text: "This walks a reported issue the way a governed case runs: verified facts kept apart from assumptions, one named owner with a next-update date, and no commitment to the account before it clears approval. Most broken promises start as a fact nobody confirmed, read as settled, and walked back two days later at a higher cost than the original problem. Before anyone drafts the customer update I read the verified line against the assumptions line; a claim on the wrong side means the update waits.",
      },
    ],
  },

  o2c: {
    title: "Priority you can defend on a Monday",
    label: "The order book",
    hook: "Eight orders across order-to-cash at once, ranked by math, because a priority you cannot explain is one you cannot defend.",
    lines: [
      {
        text: "Nobody works one order at a time, so this is the book as it sits on a Monday: eight orders scored on dollars at risk, age, proximity to cash, and open exceptions, with the one closest to hurting someone on top. The loudest order is rarely the riskiest, and a priority you cannot explain is one you cannot defend. The honest claim underneath: I have not configured SAP, I have read SAP SD and own the process around it, and nearly every dispute I have worked traced back to a field on a record like these.",
      },
    ],
  },

  command: {
    title: "A queue is only useful if it shows risk",
    label: "The manager's queue",
    hook: "Sorted by arrival, a queue tells you what is new. It never tells you which account is about to be surprised.",
    lines: [
      {
        text: "A queue sorted by arrival tells you what is new, never which account is about to be surprised, so this one is built around ownership, severity, and the date of the next promised update. The case with no owner and no date never looks urgent to the team, only to the buyer deciding whether to tell their own manager the shelf gets filled. The first thing I check on any board I inherit is ownership without a date, because that case is the one that ages out in silence.",
      },
    ],
  },

  warroom: {
    title: "Coordination fails at the handoff, not the task",
    label: "The war room",
    hook: "Most service failures are not one team dropping the ball. They are two teams each assuming the other had it.",
    lines: [
      {
        text: "This board shows ownership and handoff order across Sales, Supply Chain, Logistics, and Finance, because the failures I have seen are rarely one team dropping the ball. They are two teams each assuming the other had it, and the customer experiences that assumption as a week of silence. Internally a case can touch four departments; externally it touches one person, and I will not make an account learn our org chart to get one update.",
      },
    ],
  },

  signals: {
    title: "From a repeated complaint to a prevented pattern",
    label: "The signal loop",
    hook: "Closing the case restores one customer. Reading the pattern behind it protects the next hundred.",
    lines: [
      {
        text: "Answering a repeated question faster each time never makes it stop, because a repeat is a labeling gap, a packaging spec, or a carrier route wearing a customer's voice. This loop runs the recurring deduction back to its root and puts a function and a metric on the fix; an improvement with no owner is a meeting. I split one-offs from repeats before opening anything: the one-off gets closed, the repeat gets a number to watch so I can tell whether the change held.",
      },
    ],
  },

  rankings: {
    title: "A ranking that cannot show its inputs is an opinion",
    label: "The rankings",
    hook: "A buyer who reads a top-ten list as fact stocks against a number nobody can defend.",
    lines: [
      {
        text: "Every view here shows its weights, its source, and a confidence label, because a ranking that cannot show its inputs is an opinion. A buyer who reads a top-ten as fact commits shelf space to it, then owns the inventory when it turns out to be somebody's guess. Derived inputs score lower confidence than authored ones and carry the asterisk; keeping editorial and official visibly separate is our job, not the reader's to infer.",
      },
    ],
  },

  product: {
    title: "Blank is safer than borrowed on an allergen line",
    label: "The dossier",
    hook: "Switch the format and the allergen answer can change, so a fact we cannot source to this exact package shows as unknown, not inherited.",
    lines: [
      {
        text: "Allergens and preparation here bind to the exact format on screen, because the cup, the bowl, and the multipack are different packages with different labels. This is the one place a confident wrong answer does real harm: the person asking has an allergy, not a data-quality complaint. A format with no official source shows unknown rather than borrowing from the pack next to it; a visible unknown sends the buyer to the label, an inherited value tells them not to look.",
      },
    ],
  },

  brands: {
    title: "Four positions, not one house voice",
    label: "The four brands",
    hook: "A buyer who merchandises all four brands the same way communicates spice wrong on the one that lives or dies on it.",
    lines: [
      {
        text: "One house sells four different promises: Buldak on heat, Samyang on heritage soup, Tangle on a protein claim, MEP on broth depth. A buyer who merchandises all four the same way communicates spice wrong on the one that lives or dies on it, and the dead facing lands on whoever set the shelf. I wrote each position from what a buyer can act on at the shelf, so Buldak's heat framing never gets pasted onto MEP just to keep the copy uniform.",
      },
    ],
  },

  "ops-teaser": {
    title: "From the order you built to the case it becomes",
    label: "The ops bridge",
    hook: "The same case you can open on the ops board, walked here so the bridge between ordering and repair is visible.",
    lines: [
      {
        text: "An order is a promise and a case is that promise being repaired, so this takes one short shipment and walks it down the same lifecycle the ops board runs. Building an order and working its failure become one screen apart instead of two products. The trace light is decoration only; every stage carries its state in a word and a glyph, so a colorblind reader (I am one) loses nothing.",
      },
    ],
  },

  studies: {
    title: "Named on the landing page, on purpose",
    label: "The five studies",
    hook: "The five deepest screens live one page down, and a menu label is a door most reviewers never open.",
    lines: [
      {
        text: "The order queue, the customer record, the integration map, the dimensional model, and the manager's queue live one page down, and a menu label is a door most reviewers never open. A screener scrolls a landing page, and depth they never find carries no weight, so the landing page names all five and links straight to each screen. These cards read from the same table the navigation reads; one source, so a card and the menu cannot drift apart.",
      },
    ],
  },

  "customer-master": {
    title: "Disputes are born in master data",
    label: "The customer master",
    hook: "A reconstruction of the record most disputes are born in. The real one is confidential; the shape is the lesson.",
    lines: [
      {
        text: "Nearly every dispute upstream of a queue starts in a record like this: a partner function pointing at the wrong payer, a condition record with a stale validity date, an EDI identifier that maps a document to nobody. The buyer never sees the field; they see the invoice that disagrees weeks later. A real customer master is confidential twice over (the customer's and the supplier's), so this one is modeled, and the shape still teaches what I would audit first: sold-to, ship-to, bill-to, payer, because a case resolved with the wrong party moves no money.",
      },
    ],
  },

  integration: {
    title: "The clean order is assembled, not received",
    label: "The integration map",
    hook: "One purchase order crosses five systems before anyone can ship it, and each handoff is a place it can stall silently.",
    lines: [
      {
        text: "A buyer believes the order exists the moment they send it; on our side it is still being assembled across five systems, and a handoff that fails silently creates an order nobody can see. Each flow here names its cadence, its failure mode, and what CX watches, because the person who feels an integration failure first is the account, not the integration team. No live pipeline runs here, and every data domain names one source of truth; two systems that both believe they own the customer address will eventually ship to the wrong dock.",
      },
    ],
  },

  "data-model": {
    title: "One grain per fact, or the metric lies",
    label: "The data model",
    hook: "The star schema under the site's own data, pinned to one grain per fact, because grain drift is how dashboards lie.",
    lines: [
      {
        text: "Every number this site argues with decomposes into a fact table pinned to one real event and the dimensions that describe it. When a fact mixes grains (order lines and shipments in one table), the metric on top averages two different things and nobody can say which. This is a modeling study, not a deployed warehouse; the transferable part is naming the grain, and when a number looks wrong, which fact and which grain is the first question I ask.",
      },
    ],
  },

  "sop-register": {
    title: "One taxonomy, or the register lies",
    label: "The SOP register",
    hook: "These procedures render from the same list the intake routes against, so the register cannot drift from the system.",
    lines: [
      {
        text: "These procedures render from the same taxonomy the intake routes against: one list, cited by code on live cases. A register typed separately from its categories eventually lists a procedure nobody runs, and nobody notices until a rep follows the document while the system does something else. The clocks and priorities here are placeholders; on a real book I would set them against the retailers' actual dispute windows, because a target nobody can miss was never a target.",
      },
    ],
  },

  "ops-board": {
    title: "The board is for what is aging, not what is new",
    label: "The case board",
    hook: "One honest design goal: make the case nobody is touching impossible to miss.",
    lines: [
      {
        text: "A queue's newest case takes care of itself; the one that hurts is aging quietly in a middle column, so this board makes age visible before the account calls to ask. Every move is signed and timestamped, because a board that forgets who moved what teaches nothing at the review. The cases are modeled (a real queue is a customer list), which is what lets the mechanics be public: drag a card or move it by keyboard alone, and the audit trail writes itself either way.",
      },
    ],
  },

  "ops-featured": {
    title: "One case, told end to end",
    label: "The featured case",
    hook: "Fourteen cards tell a visitor nothing. One case walked from the report to the prevention says what the board is for.",
    lines: [
      {
        text: "Fourteen cards tell a visitor nothing, so one case gets walked end to end, from the report to the prevention. Every value in this panel derives from the case record itself, never retyped, so the panel and the board cannot disagree; that is the same discipline that keeps a real case file trustworthy when three teams touch it. The account behind the shortage does not care about our columns, only that the name on the update is the person who acknowledged it, on the date we set.",
      },
    ],
  },

  "ops-patterns": {
    title: "The third case is not a case",
    label: "The pattern watch",
    hook: "When one category crosses the trigger, I stop working incidents and ask the owning team for a root cause.",
    lines: [
      {
        text: "Answering the same failure three times is paying three times for one defect. This panel counts open cases by category against the same repeat trigger the intake evaluates, off the same live state, so filing a third case through account support trips the flag you are looking at. An account meeting a repeated failure does not experience three incidents; they experience a supplier who does not learn, which is why the flag opens a root cause with a named owner and a date.",
      },
    ],
  },

  fit: {
    title: "The claims are mapped to real work, not to the posting",
    label: "The evidence table",
    hook: "Every capability here points at a working part of FireFlow and at experience I can defend, not at the job description reworded.",
    lines: [
      {
        text: "Each responsibility in the posting is paired with a part of FireFlow you can open and the experience that informed it, because a capability list that echoes the job description tells a hiring manager nothing new. For every claim I ask two things: can I show it running, and can I speak to it under a follow-up question. Fail either and it comes off the list rather than getting softer language; there is no SAP tenure here and no invented Samyang result.",
      },
    ],
  },

  why: {
    title: "What I could not learn from the outside",
    label: "The close",
    hook: "Everything operational here is modeled, because the real operation is the part I could not see from outside the company.",
    lines: [
      {
        text: "Everything operational in FireFlow is modeled, and that is the honest part: which accounts deduct under which reason code, where a handoff drops a case, none of that is knowable from a careers page, so I built the reasoning instead of the data. I have not worked at Samyang and I have not configured SAP; I have read SAP SD and I own the process around it, and that is the whole claim. On day one I would be wrong about the real accounts and exceptions, and I would rather show that honestly than dress up a fit I could not defend under a follow-up.",
      },
    ],
  },

  colors: {
    title: "Sourced, and decorative on purpose",
    label: "The five colors",
    hook: "Getting a culture wrong on its own brand is a cost the brand pays, so this reading is sourced and kept decorative.",
    lines: [
      {
        text: "This strip reads the FireFlow palette against obangsaek, Korea's five traditional colors, as a personal reading with cited sources, not a claim about an official color system; where the sources hedge, this copy hedges with them. Getting a culture wrong on its own brand is a cost the brand pays. And these five colors signal state nowhere on the site: obangsaek is color-first by nature, I am colorblind, and a cue carried by color alone fails the person who most needs it.",
      },
    ],
  },

  methodology: {
    title: "A fact is labeled by where it came from, not how sure it sounds",
    label: "The source labels",
    hook: "A reader who cannot tell an official fact from an editorial guess will act on the wrong one.",
    lines: [
      {
        text: "Every claim on the site carries a source label: official, retail signal, editorial, or modeled. A buyer who reads an editorial ranking as a sales figure makes a real decision on evidence that was never that strong, and an imputed number that reads like a measured one is the more dangerous of the two. When we cannot source something, the honest label is the product, not a gap we hope nobody notices.",
      },
    ],
  },

  faq: {
    title: "The disclaimer goes first, not in the footer",
    label: "The FAQ",
    hook: "A reader who mistakes this for an official Samyang site could act on modeled pricing as if it were real.",
    lines: [
      {
        text: "The first answers here are the ones a portfolio is tempted to bury: this is not an official Samyang site, it is not affiliated, and the cases, orders, and metrics are modeled. A reader who takes a modeled price as official makes a decision on it, and that confusion would be mine to have prevented. I would rather the artifact look less finished than leave anyone unsure which parts are modeled.",
      },
    ],
  },

  results: {
    title: "The number is real, so I will not dress it up",
    label: "The track record",
    hook: "A rating moves because the service behind it changed. Any other way of moving it does not hold.",
    lines: [
      {
        text: "The review count on this card is real and from a prior role, and the rating moved because the service changed first: a consistent post-visit follow-up, and low-star complaints closed at the source instead of buried under new ratings. I do not chase a rating I cannot defend; gating reviews or asking only happy customers moves the average while leaving the failure that produced it in place. On any figure I inherit, I read the low reviews before the average.",
      },
    ],
  },

  standards: {
    title: "A standard nobody can act on is a document",
    label: "The standards",
    hook: "A standard the team cannot act on at four o'clock on a Friday is not a standard, it is paperwork.",
    lines: [
      {
        text: "These five artifacts answer one question before the pressure hits: who may say yes, by how much, and by when. Left unwritten, every credit, date, and deduction becomes a fresh negotiation, and a rep unsure of their own authority either stalls the case up the chain or improvises a promise nobody can honor. I will not publish a target the team cannot hit under real load; a standard nobody meets on a bad Friday teaches the team to stop reading the document.",
      },
    ],
  },

  team: {
    title: "The overloaded desk is a customer problem",
    label: "The team board",
    hook: "An overloaded rep is not an HR problem. It is the account whose case is aging under eighteen others.",
    lines: [
      {
        text: "This is a modeled operating model (not a team I have managed), built to answer what a roster hides: whose desk the next dropped case is sitting on. A rep carrying nineteen open cases has a deduction aging past its dispute window somewhere in the stack, not from carelessness but because the nineteenth case gets whatever time is left. The first number I read on a team is distribution, not total volume, and I move routine research off the overloaded desk while the case stays with the person who has the history.",
      },
    ],
  },

  plan: {
    title: "Assess before you change anything",
    label: "The first 90 days",
    hook: "The fastest way to break a queue is to reorganize it before you have read it.",
    lines: [
      {
        text: "This is a plan, not a record, and the order is the argument: assess, then stand up the standard, then improve. A manager who reorganizes in week one moves the cases that were fine and misses the deduction quietly aging toward its window; the account does not feel the reorg, it feels the case that fell through it. Before I change anything I read the open queue and the deduction aging against the targets already defined, because the oldest unworked case is where the real risk sits.",
      },
    ],
  },

  /* ---- Account dossier, /accounts/99-ranch-market ------------------------- */

  "acct-po-table": {
    title: "The row is the summary. The record is the argument.",
    label: "The PO history",
    hook: "A buyer does not dispute a table cell. They dispute a document trail, so every row opens the whole record.",
    lines: [
      {
        text: "A buyer does not dispute a table cell, they dispute a document trail, so every row opens the full order record, and the sixty-case gap on PO 482207 is visible at the exact step it opened (pick and load, not the ocean). No price is typed into this table; every line quotes the same pricing function the order builder uses, because two sources of one number always drift, and the drift becomes our invoice dispute. I have not configured SAP; I can read the document flow, VA03 through VL03N to the billing document, and reading it is what the first hour of a short-shipment case requires.",
      },
    ],
  },

  "acct-buyers-chair": {
    title: "Twelve steps, read on a live order",
    label: "The order trace",
    hook: "The lifecycle is traced on the open order instead of taught in the abstract, because the buyer lives it one step at a time.",
    lines: [
      {
        text: "A lifecycle diagram in the abstract is training material; traced on the live order, the same twelve steps do work: this PO cleared its entry steps and broke at pick and load, and every later step inherits the break. The buyer's ad starts Friday whether or not our paperwork agrees with our trailer, so every pending step on this trace carries a date and an owner. I always start from the earliest exception, because the gap at step seven explains steps eight through eleven, and working them in reverse rediscovers the same sixty cases four times.",
      },
    ],
  },

  "acct-fill-rate": {
    title: "A fill rate miss is felt at the shelf",
    label: "The account cases",
    hook: "Ninety percent fill on this order is not a score. It is sixty cases of a promoted item missing with the ad already booked.",
    lines: [
      {
        text: "Ninety percent fill on this order is not a score; it is sixty cases of a promoted cup missing with the ad already booked, a hole the buyer explains to their own boss with our name inside the explanation. Every case on this board carries a named assignee, the clock we promised, and a record of who did what and when. I do not let a case close with an empty root cause, because a shortage without a cause is scheduled to repeat.",
      },
    ],
  },

  "acct-dormant": {
    title: "An account that stops ordering has not told you why",
    label: "The dormancy check",
    hook: "The decline is measured. The cause is a question, and a guess must not become the account's biography.",
    lines: [
      {
        text: "Writing lost to a competitor into a record turns one person's guess into the account's biography, and the next three people inherit it as fact. Nobody knows why an account went quiet until somebody asks, so the checks run cheapest evidence first: our own reset calendar, then the last twelve cases, then the direct-import question Sales asks the buyer, with seasonality as the control. A buyer who left over unresolved shorts and got written off as a sourcing change never gets the fix, and the account stays lost for the wrong reason.",
      },
    ],
  },

  "acct-chain": {
    title: "The account does not care which department broke it",
    label: "The profile notes",
    hook: "The profile keeps one-line facts on purpose. A record full of prose is a record nobody updates.",
    lines: [
      {
        text: "These notes are one line each because a profile is operational, not literary: the field a rep reads thirty seconds before a call has to be current, and long prose rots. The entity line is the one that moves money; this account receives as 99 Ranch and pays as Tawa, and a credit resolved with the wrong party is a credit the buyer chases for another month. The sourcing line says unconfirmed on purpose, because a profile that records suspicion as fact writes the account off while it is still winnable.",
      },
    ],
  },

  "acct-erp": {
    title: "Reading the system is the claim, and it is enough",
    label: "The ERP layer",
    hook: "I have not configured SAP, and this section does not pretend otherwise. The claim is narrower and more useful.",
    lines: [
      {
        text: "Nearly every dispute above was born in a field: a condition record with a stale validity date, a unit-of-measure segment an 856 map got wrong, a receipt nobody posted; the customer feels the back-end error as a front-end betrayal, weeks later, on an invoice. I have not configured SAP, and this section does not pretend otherwise. Oversight here means the discipline around the system: who validates a pricing record before its effective date, who works the 997 queue as a queue instead of an archive, and which master-data fields get audited because they are the ones that generate cases.",
      },
    ],
  },

  "acct-kpis": {
    title: "A metric that cannot name its case is decoration",
    label: "The KPI board",
    hook: "Every figure on this board decomposes back into the orders and cases above it, so each number can defend itself.",
    lines: [
      {
        text: "The ninety percent fill rate here is not an average; it is one order, sixty cases, one buyer, and one Friday ad, and averages are how a bad week hides inside a good quarter. Every figure on this board decomposes back into the orders and cases above it, so each number can defend itself. I would run the review weekly against the dispute windows and the ad calendar, the clocks the account is actually on, because a trend without an owner and a dated next action gets read and forgotten.",
      },
    ],
  },

  "acct-summary": {
    title: "The whole page, in four sentences",
    label: "The summary",
    hook: "One account walked end to end: the orders, the freight behind them, the cases, the routing, and whether the fix held.",
    lines: [
      {
        text: "This dossier walks one account across the chain the role owns: the orders, the freight behind them, the cases that open when something breaks, and the numbers that say whether the fix held; every identifier is modeled. I have not worked at Samyang and I have not configured SAP, but I have read purchase orders from the buyer's chair and worked accounts receivable, where a small front-end error returns weeks later as a claim someone has to rework. The standard is one named owner, an update on a date we set, and a record that travels with the case so the buyer explains the problem once.",
      },
    ],
  },

  "acct-documentation": {
    title: "A bad first answer creates a second problem",
    label: "The SOP library",
    hook: "Each SOP code is cited on the live cases above, so the procedure and the operation cannot quietly drift apart.",
    lines: [
      {
        text: "An SOP that lives in a binder while the queue improvises is two operations wearing one name, so the codes here are cited on the live cases above; change the short-shipment playbook and the case record and the procedure change together. The resolved cases show why the first answer matters: FF-1487 closed in four days because the first reply carried both receipt documents. A wrong or partial first answer becomes a second case, and then the buyer is working our error instead of their shelf.",
      },
    ],
  },
};

/* ---- The guided sequence -------------------------------------------------
 *
 * NOTE_GUIDE is the one ordered route through the notes: the open panel shows
 * "n of 12" with Prev and Next, and each jump scrolls to (or navigates to) the
 * section the next note explains. The order follows the site's own argument:
 * the home funnel (hero, catalog, comparison, order, ops bridge), then intake,
 * then the ops board where an order's failure gets worked, then the
 * order-to-cash book, then the leadership layer, then the close.
 *
 * Notes that are not listed here still work exactly as before, as standalone
 * per-section commentary; they simply carry no Prev/Next. Every id here must
 * exist in SECTION_NOTES and be mounted by a page in NOTE_GUIDE_ROUTES.
 */
export const NOTE_GUIDE: readonly string[] = [
  "hero",
  "portfolio",
  "compare",
  "order",
  "ops-teaser",
  "resolve",
  "ops-board",
  "ops-featured",
  "o2c",
  "team",
  "fit",
  "why",
];

/* Route for each guide stop, so SectionNote knows whether a Prev/Next jump is
 * a same-page scroll or a cross-page navigation. Hardcoded as a static pair
 * table on purpose: nav.ts is owned by another workstream right now, and a
 * literal table is honest and greppable; if a section moves pages, this is the
 * one place the guide needs to hear about it. */
export const NOTE_GUIDE_ROUTES: Record<string, string> = {
  hero: "/",
  portfolio: "/",
  compare: "/",
  order: "/",
  "ops-teaser": "/",
  resolve: "/support",
  "ops-board": "/ops",
  "ops-featured": "/ops",
  o2c: "/intelligence",
  team: "/leadership",
  fit: "/about",
  why: "/about",
};
