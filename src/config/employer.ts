/**
 * Employer-layer configuration.
 *
 * Fill these in when the real assets exist. Any action whose destination is
 * empty is hidden in the UI, so FireFlow never ships a dead button.
 *
 *   resumeUrl    e.g. "/nathan-song-resume.pdf" (place the file in /public)
 *   contactEmail e.g. "nathan@example.com" (used for a mailto: on "Discuss the role")
 *
 * "View Nathan's experience" always works because it links to the on-page
 * evidence section (#fit), so at least one primary action is always present.
 */
export const EMPLOYER = {
  name: "Nathan J. Song",
  role: "Manager, Customer Experience",
  company: "Samyang America",
  resumeUrl: "",
  contactEmail: "",
} as const;

export const hasResume = (): boolean => EMPLOYER.resumeUrl.trim().length > 0;
export const hasContact = (): boolean => EMPLOYER.contactEmail.trim().length > 0;
