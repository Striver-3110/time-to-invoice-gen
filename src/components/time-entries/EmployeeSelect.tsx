
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
}

interface EmployeeSelectProps {
  form: UseFormReturn<any>;
  employees: Employee[] | undefined;
}

export const EmployeeSelect = ({ form, employees }: EmployeeSelectProps) => {
  return (
    <FormField
      control={form.control}
      name="employee_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-pink-600">Employee</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="bg-pink-50 border-pink-200">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {employees?.map((employee) => (
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
  );
};
