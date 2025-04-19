
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EmployeeStatus } from "@/lib/types";

interface EmployeeFormData {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  hire_date: string;
  designation: string;
  status: EmployeeStatus;
}

const DESIGNATIONS = [
  "Intern",
  "Software Craftsperson",
  "Software Craftsperson - Tech Lead",
  "Engineering Manager"
] as const;

interface EmployeeFormProps {
  employee?: EmployeeFormData;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EmployeeForm({ employee, onSuccess, onCancel }: EmployeeFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<EmployeeFormData>({
    defaultValues: employee || {
      first_name: "",
      last_name: "",
      email: "",
      hire_date: "",
      designation: "Software Craftsperson",
      status: EmployeeStatus.ACTIVE
    }
  });

  const onSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true);
    try {
      if (employee?.id) {
        const { error } = await supabase
          .from('employees')
          .update({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            hire_date: data.hire_date,
            designation: data.designation,
            status: data.status
          })
          .eq('id', employee.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Employee updated successfully",
          variant: "default",
          className: "bg-green-500 text-white border-green-600"
        });
      } else {
        const { error } = await supabase
          .from('employees')
          .insert({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            hire_date: data.hire_date,
            designation: data.designation,
            status: data.status
          });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Employee added successfully",
          variant: "default",
          className: "bg-green-500 text-white border-green-600"
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="first_name"
          rules={{ required: "First name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-indigo-700 font-medium">First Name</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter first name" 
                  className="border-indigo-200 focus:border-indigo-500" 
                />
              </FormControl>
              <FormMessage className="text-rose-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="last_name"
          rules={{ required: "Last name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-indigo-700 font-medium">Last Name</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter last name" 
                  className="border-indigo-200 focus:border-indigo-500" 
                />
              </FormControl>
              <FormMessage className="text-rose-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          rules={{ 
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address"
            }
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-indigo-700 font-medium">Email</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="email" 
                  placeholder="Enter email" 
                  className="border-indigo-200 focus:border-indigo-500" 
                />
              </FormControl>
              <FormMessage className="text-rose-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hire_date"
          rules={{ required: "Hire date is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-indigo-700 font-medium">Hire Date</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field} 
                  className="border-indigo-200 focus:border-indigo-500" 
                />
              </FormControl>
              <FormMessage className="text-rose-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="designation"
          rules={{ required: "Designation is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-indigo-700 font-medium">Designation</FormLabel>
              <Select 
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="border-indigo-200 focus:border-indigo-500">
                    <SelectValue placeholder="Select Designation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  {DESIGNATIONS.map((designation) => (
                    <SelectItem 
                      key={designation} 
                      value={designation}
                      className="hover:bg-indigo-50"
                    >
                      {designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-rose-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          rules={{ required: "Status is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-indigo-700 font-medium">Status</FormLabel>
              <Select 
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="border-indigo-200 focus:border-indigo-500">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  <SelectItem value={EmployeeStatus.ACTIVE} className="hover:bg-indigo-50">Active</SelectItem>
                  <SelectItem value={EmployeeStatus.INACTIVE} className="hover:bg-indigo-50">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-rose-500" />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
            className="border-indigo-300 hover:bg-indigo-50"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isSubmitting ? 'Saving...' : employee ? 'Update' : 'Add'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
