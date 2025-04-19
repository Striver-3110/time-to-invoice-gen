
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AssignEmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: () => void;
}

interface FormData {
  employeeId: string;
  startDate: Date;
  endDate: Date;
}

export function AssignEmployeeSheet({ isOpen, onClose, projectId, onSuccess }: AssignEmployeeFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      employeeId: "",
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name")
        .eq("status", "ACTIVE")
        .order("first_name");

      if (error) throw error;
      return data;
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("assignments").insert({
        employee_id: data.employeeId,
        project_id: projectId,
        start_date: data.startDate.toISOString(),
        end_date: data.endDate.toISOString(),
        status: "ACTIVE",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee assigned successfully",
        variant: "default",
        className: "bg-green-500 text-white border-green-600",
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not assign employee",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Assign Employee</SheetTitle>
          <SheetDescription>
            Assign an employee to this project by selecting them and setting their assignment period.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="employeeId"
              rules={{ required: "Employee is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-indigo-700 font-medium">Employee</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-indigo-200 focus:border-indigo-500">
                        <SelectValue placeholder="Select Employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees?.map((employee) => (
                        <SelectItem
                          key={employee.id}
                          value={employee.id}
                          className="hover:bg-indigo-50"
                        >
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
              name="startDate"
              rules={{ required: "Start date is required" }}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-indigo-700 font-medium">Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
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
                          date < new Date()
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
              name="endDate"
              rules={{ required: "End date is required" }}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-indigo-700 font-medium">End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
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
                          date < form.getValues("startDate")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-indigo-300 hover:bg-indigo-50"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isSubmitting ? "Assigning..." : "Assign Employee"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
