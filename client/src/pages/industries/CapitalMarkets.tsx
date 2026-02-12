import IndustryPage from "@/components/templates/IndustryPage";
import { capitalMarketsData } from "@/data/industries/capital-markets";

export default function CapitalMarkets() {
  return <IndustryPage data={capitalMarketsData} />;
}
