import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useTimeEntryData } from "@/hooks/useTimeEntryData";
import { EmployeeSelect } from "./EmployeeSelect";
import { ProjectSelect } from "./ProjectSelect";

interface TimeEntryFormProps {
  timeEntry?: {
    id?: string;
    employee_id: string;
    project_id: string;
    date: string;
    days: number;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function TimeEntryForm({ timeEntry, onSuccess, onCancel }: TimeEntryFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const form = useForm({
    defaultValues: {
      employee_id: timeEntry?.employee_id || "",
      project_id: timeEntry?.project_id || "",
      date: timeEntry?.date ? new Date(timeEntry.date) : new Date(),
      days: timeEntry?.days || "",
    },
  });

  const { employees, availableProjects } = useTimeEntryData(form.watch('employee_id'));

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
              days: data.days,
            })
            .eq('id', timeEntry.id)
        : await supabase
            .from('time_entries')
            .insert({
              employee_id: data.employee_id,
              project_id: data.project_id,
              date: data.date,
              days: data.days,
            });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Time entry ${timeEntry ? 'updated' : 'created'} successfully`,
        variant: "default",
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
        <EmployeeSelect form={form} employees={employees} />
        <ProjectSelect form={form} projects={availableProjects} />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-orange-500">Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={`${!field.value ? "text-muted-foreground" : ""} bg-orange-50 border-orange-200 text-orange-900`}
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
          name="days"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-green-500">Days</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.5" 
                  min="0.5" 
                  max="30" 
                  {...field} 
                  className="bg-green-50 border-green-200"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} className="border-purple-300 hover:bg-purple-100">
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading} 
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? "Saving..." : timeEntry ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
