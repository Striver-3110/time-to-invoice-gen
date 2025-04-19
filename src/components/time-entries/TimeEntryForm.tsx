
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

interface TimeEntryFormProps {
  timeEntry?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TimeEntryForm({ timeEntry, onSuccess, onCancel }: TimeEntryFormProps) {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      employee_id: timeEntry?.employee_id || "",
      project_id: timeEntry?.project_id || "",
      date: timeEntry?.date ? new Date(timeEntry.date) : new Date(),
      hours: timeEntry?.hours || "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const [employeesData, projectsData] = await Promise.all([
        supabase.from('employees').select('id, first_name, last_name').eq('status', 'ACTIVE'),
        supabase.from('projects').select('id, project_name').eq('status', 'ACTIVE')
      ]);

      if (employeesData.data) setEmployees(employeesData.data);
      if (projectsData.data) setProjects(projectsData.data);
    };

    fetchData();
  }, []);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const { error } = timeEntry?.id
        ? await supabase
            .from('time_entries')
            .update({
              employee_id: data.employee_id,
              project_id: data.project_id,
              date: data.date,
              hours: data.hours,
            })
            .eq('id', timeEntry.id)
        : await supabase.from('time_entries').insert([{
            employee_id: data.employee_id,
            project_id: data.project_id,
            date: data.date,
            hours: data.hours,
          }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Time entry ${timeEntry ? 'updated' : 'created'} successfully`,
      });
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="employee_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="project_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.project_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={!field.value ? "text-muted-foreground" : ""}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("2024-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hours</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.5" 
                  min="0.5" 
                  max="24" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : timeEntry ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
