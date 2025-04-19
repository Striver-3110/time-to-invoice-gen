
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import type { ProjectTimesheet } from "@/types/invoice";

interface TimesheetTableProps {
  projectTimesheets: ProjectTimesheet[];
}

export const TimesheetTable = ({ projectTimesheets }: TimesheetTableProps) => {
  return (
    <div className="space-y-6">
      {projectTimesheets.map((project) => (
        <div key={project.projectId} className="space-y-4">
          <h3 className="text-lg font-semibold text-primary">{project.projectName}</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Designation</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {project.employees.map((employee, idx) => (
                <TableRow key={`${project.projectId}-${employee.designation}-${idx}`}>
                  <TableCell className="font-medium">{employee.designation}</TableCell>
                  <TableCell>{employee.hours}</TableCell>
                  <TableCell className="text-secondary-600">${employee.rate.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-semibold">${employee.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Separator className="my-4" />
        </div>
      ))}
    </div>
  );
};
