
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useEmployees } from "@/hooks/useEmployees";

interface FormData {
  employeeId: string;
  startDate: Date;
  endDate: Date;
  hourlyRate: number;
}

interface AssignmentFormFieldsProps {
  form: UseFormReturn<FormData>;
}

export function AssignmentFormFields({ form }: AssignmentFormFieldsProps) {
  const { data: employees } = useEmployees();

  return (
    <>
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
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
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
                  disabled={(date) => date < form.getValues("startDate")}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="hourlyRate"
        rules={{ 
          required: "Hourly rate is required",
          min: {
            value: 1,
            message: "Hourly rate must be greater than 0"
          }
        }}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-indigo-700 font-medium">Hourly Rate ($)</FormLabel>
            <FormControl>
              <Input 
                type="number"
                min="1"
                step="0.01"
                {...field}
                onChange={e => field.onChange(parseFloat(e.target.value))}
                className="border-indigo-200 focus:border-indigo-500"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
