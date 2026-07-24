import { SapProcessIntelligence } from "@/components/home/SapProcessIntelligence/SapProcessIntelligence";
import { CustomerMasterRecord } from "@/components/home/CustomerMasterRecord/CustomerMasterRecord";
import { IntegrationArchitecture } from "@/components/home/IntegrationArchitecture/IntegrationArchitecture";
import { DataModelStudio } from "@/components/home/DataModelStudio/DataModelStudio";
import { CommandCenter } from "@/components/home/CommandCenter/CommandCenter";
import { CrossFunctionalWarRoom } from "@/components/home/CrossFunctionalWarRoom/CrossFunctionalWarRoom";
import { ProductSignals } from "@/components/home/ProductSignals/ProductSignals";

/** IntelligencePage — `/intelligence`. Process and CX intelligence studies. */
export function IntelligencePage() {
  return (
    <>
      <SapProcessIntelligence />
      <CustomerMasterRecord />
      <IntegrationArchitecture />
      <DataModelStudio />
      <CommandCenter />
      <CrossFunctionalWarRoom />
      <ProductSignals />
    </>
  );
}
