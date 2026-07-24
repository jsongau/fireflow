import { TrackRecord } from "@/components/leadership/TrackRecord/TrackRecord";
import { StandardsPlaybook } from "@/components/leadership/StandardsPlaybook/StandardsPlaybook";
import { SopRegister } from "@/components/leadership/SopRegister/SopRegister";
import { TeamBoard } from "@/components/leadership/TeamBoard/TeamBoard";
import { FirstNinetyDays } from "@/components/leadership/FirstNinetyDays/FirstNinetyDays";

/**
 * LeadershipPage — `/leadership`. The page that closes the JD's people-leadership
 * and track-record gaps. Sections, in order:
 *
 *   #results       TrackRecord        real prior-role results, explicitly not Samyang
 *   #standards     StandardsPlaybook  the governed service-standards artifact
 *   #sop-register  SopRegister        every procedure the intake actually routes,
 *                                     rendered from the same taxonomy
 *   #team          TeamBoard          the synthetic team operating model
 *   #plan          FirstNinetyDays    a 30/60/90 plan tied to this site's artifacts
 */
export function LeadershipPage() {
  return (
    <>
      <TrackRecord />
      <StandardsPlaybook />
      <SopRegister />
      <TeamBoard />
      <FirstNinetyDays />
    </>
  );
}
