
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Download, Send } from "lucide-react";
import { invoices, invoiceLineItems, clients, employees, projects } from "@/lib/mock-data";
import { Invoice, InvoiceStatus, InvoiceLineItem } from "@/lib/types";
import { format } from "date-fns";

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

const InvoiceView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [clientName, setClientName] = useState<string>("");

  useEffect(() => {
    const foundInvoice = invoices.find(inv => inv.id === id);
    if (foundInvoice) {
      setInvoice(foundInvoice);
      
      // Get client name
      const client = clients.find(c => c.id === foundInvoice.clientId);
      setClientName(client?.name || "Unknown Client");
      
      // Get line items
      const items = invoiceLineItems.filter(item => item.invoiceId === foundInvoice.id);
      setLineItems(items);
    }
  }, [id]);

  if (!invoice) {
    return <div>Loading invoice...</div>;
  }

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : "Unknown Employee";
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.projectName || "Unknown Project";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Invoice #{invoice.invoiceNumber}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          {invoice.status === InvoiceStatus.DRAFT && (
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Send to Client
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">Status:</dt>
                <dd>
                  <Badge className={getStatusColor(invoice.status)} variant="outline">
                    {invoice.status}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Invoice Date:</dt>
                <dd>{format(new Date(invoice.invoiceDate), "MMM dd, yyyy")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">Due Date:</dt>
                <dd>{format(new Date(invoice.dueDate), "MMM dd, yyyy")}</dd>
              </div>
              {invoice.paymentDate && (
                <div className="flex justify-between">
                  <dt className="font-medium">Payment Date:</dt>
                  <dd>{format(new Date(invoice.paymentDate), "MMM dd, yyyy")}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">{clientName}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Period</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="font-medium">Start Date:</dt>
                <dd>{format(new Date(invoice.billingPeriodStart), "MMM dd, yyyy")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium">End Date:</dt>
                <dd>{format(new Date(invoice.billingPeriodEnd), "MMM dd, yyyy")}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Line Items</CardTitle>
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
                <TableRow key={item.id}>
                  <TableCell>{item.serviceDescription}</TableCell>
                  <TableCell>{getProjectName(item.projectId)}</TableCell>
                  <TableCell>{getEmployeeName(item.employeeId)}</TableCell>
                  <TableCell>{item.quantity} hours</TableCell>
                  <TableCell className="text-right">
                    {invoice.currency} {item.totalAmount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-end border-t p-4">
          <div className="text-right">
            <div className="flex justify-between w-64">
              <span className="font-semibold">Total Amount:</span>
              <span className="font-bold">
                {invoice.currency} {invoice.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InvoiceView;
