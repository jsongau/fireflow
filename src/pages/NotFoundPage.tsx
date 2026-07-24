import { Link } from "react-router-dom";

/** NotFoundPage — the `*` route. Plain, honest 404. */
export function NotFoundPage() {
  return (
    <section
      aria-labelledby="notfound-title"
      style={{
        maxWidth: "var(--container, 72rem)",
        margin: "0 auto",
        padding: "var(--space-8, 4rem) var(--space-4, 1.5rem)",
      }}
    >
      <p style={{ color: "var(--text-2)", fontWeight: 600, letterSpacing: "0.04em" }}>
        Error 404
      </p>
      <h1 id="notfound-title" style={{ color: "var(--text-0)", marginTop: "var(--space-2, 0.5rem)" }}>
        This page does not exist.
      </h1>
      <p style={{ color: "var(--text-1)", maxWidth: "40ch", marginTop: "var(--space-3, 0.75rem)" }}>
        The link may be out of date, or the address may have a typo. Head back to the home page to
        find your way.
      </p>
      <p style={{ marginTop: "var(--space-5, 2rem)" }}>
        <Link
          to="/"
          style={{ color: "var(--op-accent)", fontWeight: 600 }}
        >
          Return to the home page
        </Link>
      </p>
    </section>
  );
}
