
import { Badge } from "@/components/ui/badge";
import { InvoiceStatus } from "@/lib/types";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

const getStatusColor = (status: InvoiceStatus) => {
  switch (status) {
    case InvoiceStatus.DRAFT:
      return "bg-yellow-100 text-yellow-800";
    case InvoiceStatus.SENT:
      return "bg-blue-100 text-blue-800";
    case InvoiceStatus.PAID:
      return "bg-green-100 text-green-800";
    case InvoiceStatus.OVERDUE:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const InvoiceStatusBadge = ({ status }: InvoiceStatusBadgeProps) => {
  return (
    <Badge className={getStatusColor(status)} variant="outline">
      {status}
    </Badge>
  );
};
