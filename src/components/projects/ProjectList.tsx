import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { AssignEmployeeSheet } from "./AssignEmployeeSheet";
import { EmployeeCountPopover } from "./EmployeeCountPopover";
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

interface Project {
  id: string;
  project_name: string;
  client_id: string;
  start_date: string;
  end_date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
  client: {
    name: string;
  };
}

export function ProjectList({
  onEdit
}: {
  onEdit: (project: Project) => void;
}) {
  const { toast } = useToast();
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const {
    data: projects,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:clients(name),
          assignments!projects_id_fkey(
            employee:employees(
              first_name,
              last_name,
              designation
            )
          )
        `)
        .order('project_name');
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch projects"
        });
        throw error;
      }
      return data;
    }
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', id);
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
    setProjectToDelete(null);
  };

  const handleAssignEmployee = (projectId: string) => {
    setSelectedProject(projectId);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64">
    <div className="animate-pulse text-muted-foreground">Loading...</div>
  </div>;

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500/15 text-green-700 hover:bg-green-500/25";
      case "COMPLETED":
        return "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25";
      case "ON_HOLD":
        return "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25";
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
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Client</TableHead>
              <TableHead className="font-semibold">Start Date</TableHead>
              <TableHead className="font-semibold">End Date</TableHead>
              <TableHead className="font-semibold">Employees</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects?.map(project => {
              const employees = project.assignments
                ?.map(assignment => assignment.employee)
                .filter(Boolean) || [];

              return (
                <TableRow key={project.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{project.project_name}</TableCell>
                  <TableCell>{project.client?.name}</TableCell>
                  <TableCell>{new Date(project.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(project.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <EmployeeCountPopover 
                      employees={employees}
                      count={employees.length}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(project.status)}`}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleAssignEmployee(project.id)}
                        className="text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 border-violet-200 transition-colors duration-200 ease-in-out transform hover:scale-105"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => onEdit(project)}
                        className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 transition-colors duration-200 ease-in-out transform hover:scale-105"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setProjectToDelete(project.id)}
                        className="text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200 transition-colors duration-200 ease-in-out transform hover:scale-105"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <AssignEmployeeSheet
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        projectId={selectedProject || ""}
        onSuccess={() => {
          refetch();
          setSelectedProject(null);
        }}
      />

      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
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
              onClick={() => projectToDelete && handleDelete(projectToDelete)}
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
