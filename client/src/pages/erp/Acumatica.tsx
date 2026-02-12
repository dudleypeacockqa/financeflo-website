import ERPProductPage from "@/components/templates/ERPProductPage";
import { acumaticaData } from "@/data/erp/acumatica";

export default function Acumatica() {
  return <ERPProductPage data={acumaticaData} />;
}
