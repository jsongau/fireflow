import { EmployerEvidence } from "@/components/employer/EmployerEvidence/EmployerEvidence";
import { EmployerClose } from "@/components/employer/EmployerClose/EmployerClose";
import { FiveColors } from "@/components/home/FiveColors/FiveColors";
import { Methodology } from "@/components/home/Methodology/Methodology";
import { HomepageFAQ } from "@/components/home/HomepageFAQ/HomepageFAQ";

/** AboutPage — `/about`. What this demonstrates, why it was built, and how. */
export function AboutPage() {
  return (
    <>
      <EmployerEvidence />
      <EmployerClose />
      <FiveColors />
      <Methodology />
      <HomepageFAQ />
    </>
  );
}
