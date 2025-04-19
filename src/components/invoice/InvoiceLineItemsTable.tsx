
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface LineItem {
  line_item_id: string;
  service_description: string;
  projects?: { project_name: string };
  employees?: { designation: string };
  quantity: number;
  total_amount: number;
}

interface InvoiceLineItemsTableProps {
  lineItems: LineItem[];
  currency: string;
  totalAmount: number;
}

export const InvoiceLineItemsTable = ({ 
  lineItems, 
  currency, 
  totalAmount 
}: InvoiceLineItemsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Invoice Line Items</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lineItems.map((item) => (
              <TableRow key={item.line_item_id}>
                <TableCell>{item.service_description}</TableCell>
                <TableCell>{item.projects?.project_name}</TableCell>
                <TableCell>{item.employees?.designation}</TableCell>
                <TableCell>{item.quantity} hours</TableCell>
                <TableCell className="text-right font-medium">
                  {currency} {item.total_amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-end border-t p-4">
        <div className="text-right">
          <div className="flex justify-between w-64">
            <span className="font-semibold text-secondary-700">Total Amount:</span>
            <span className="font-bold text-primary">
              {currency} {totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
