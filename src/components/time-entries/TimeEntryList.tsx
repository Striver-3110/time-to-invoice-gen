import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
interface TimeEntry {
  id: string;
  employee_id: string;
  project_id: string;
  date: string;
  hours: number;
  employee?: {
    first_name: string;
    last_name: string;
  };
  project?: {
    project_name: string;
  };
}
export function TimeEntryList({
  onEdit
}: {
  onEdit: (timeEntry: TimeEntry) => void;
}) {
  const {
    toast
  } = useToast();
  const [timeEntryToDelete, setTimeEntryToDelete] = useState<string | null>(null);
  const {
    data: timeEntries,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['time-entries'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('time_entries').select(`
          *,
          employee:employees(first_name, last_name),
          project:projects(project_name)
        `).order('date', {
        ascending: false
      });
      if (error) {
        console.error("Supabase query error:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch time entries"
        });
        throw error;
      }
      return data as TimeEntry[];
    }
  });
  const handleDelete = async (id: string) => {
    const {
      error
    } = await supabase.from('time_entries').delete().eq('id', id);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete time entry"
      });
    } else {
      toast({
        title: "Success",
        description: "Time entry deleted successfully"
      });
      refetch();
    }
    setTimeEntryToDelete(null);
  };
  if (isLoading) return <div className="flex items-center justify-center h-64">
    <div className="animate-pulse text-muted-foreground">Loading...</div>
  </div>;
  return <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold text-purple-600">Employee</TableHead>
              <TableHead className="font-semibold text-blue-500">Project</TableHead>
              <TableHead className="font-semibold text-purple-600">Date</TableHead>
              <TableHead className="font-semibold text-purple-600">Hours</TableHead>
              <TableHead className="font-semibold text-right text-purple-600">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timeEntries?.map(entry => <TableRow key={entry.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="text-black-600">
                  {entry.employee?.first_name} {entry.employee?.last_name}
                </TableCell>
                <TableCell className="text-blue-500">
                  {entry.project?.project_name}
                </TableCell>
                <TableCell className="text-orange-500">
                  {entry.date ? format(new Date(entry.date), 'PPP') : 'N/A'}
                </TableCell>
                <TableCell className="text-green-500">
                  {entry.hours}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="icon" onClick={() => onEdit(entry)} className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setTimeEntryToDelete(entry.id)} className="text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>)}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!timeEntryToDelete} onOpenChange={() => setTimeEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected time entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => timeEntryToDelete && handleDelete(timeEntryToDelete)} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>;
}