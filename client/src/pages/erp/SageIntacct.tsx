import ERPProductPage from "@/components/templates/ERPProductPage";
import { sageIntacctData } from "@/data/erp/sage-intacct";

export default function SageIntacct() {
  return <ERPProductPage data={sageIntacctData} />;
}
