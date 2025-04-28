import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import type { ProjectTimesheet } from "@/types/invoice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectTimesheet {
  projectId: string;
  projectName: string;
  employees: {
    designation: string;
    days: number;
    rate: number;
    amount: number;
  }[];
}

export const TimesheetTable = ({ projectTimesheets }: { projectTimesheets: ProjectTimesheet[] }) => {
  return (
    <div className="space-y-6">
      {projectTimesheets.map((project) => (
        <Card key={project.projectId} className="overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg font-semibold text-primary">{project.projectName}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Designation</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Daily Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.employees.map((employee, idx) => (
                  <TableRow key={`${project.projectId}-${employee.designation}-${idx}`}>
                    <TableCell className="font-medium">{employee.designation}</TableCell>
                    <TableCell>{employee.days}</TableCell>
                    <TableCell className="text-secondary-600">${employee.rate.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-semibold">${employee.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
