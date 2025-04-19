
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  hire_date: string;
  designation: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export function EmployeeList({
  onEdit
}: {
  onEdit: (employee: Employee) => void;
}) {
  const { toast } = useToast();
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  const {
    data: employees,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('first_name');
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch employees"
        });
        throw error;
      }
      return data as Employee[];
    }
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete"
      });
    } else {
      toast({
        title: "Success",
        description: "Deleted successfully"
      });
      refetch();
    }
    setEmployeeToDelete(null);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>;

  const getStatusColor = (status: Employee['status']) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500/15 text-green-700 hover:bg-green-500/25";
      case "INACTIVE":
        return "bg-red-500/15 text-red-700 hover:bg-red-500/25";
      default:
        return "bg-gray-500/15 text-gray-700 hover:bg-gray-500/25";
    }
  };

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">First Name</TableHead>
              <TableHead className="font-semibold">Last Name</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Hire Date</TableHead>
              <TableHead className="font-semibold">Designation</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees?.map(employee => (
              <TableRow key={employee.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">{employee.first_name}</TableCell>
                <TableCell>{employee.last_name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>{new Date(employee.hire_date).toLocaleDateString()}</TableCell>
                <TableCell>{employee.designation}</TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(employee.status)}`}>
                    {employee.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => onEdit(employee)}
                      className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 transition-colors duration-200 ease-in-out transform hover:scale-105"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setEmployeeToDelete(employee.id)}
                      className="text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200 transition-colors duration-200 ease-in-out transform hover:scale-105"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!employeeToDelete} onOpenChange={() => setEmployeeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => employeeToDelete && handleDelete(employeeToDelete)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
