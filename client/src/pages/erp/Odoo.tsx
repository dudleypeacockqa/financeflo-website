import ERPProductPage from "@/components/templates/ERPProductPage";
import { odooData } from "@/data/erp/odoo";

export default function Odoo() {
  return <ERPProductPage data={odooData} />;
}
