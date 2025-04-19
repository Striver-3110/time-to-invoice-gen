
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AssignmentFormFields } from "./AssignmentFormFields";

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
  hourlyRate: number;
}

export function AssignEmployeeSheet({ isOpen, onClose, projectId, onSuccess }: AssignEmployeeFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      employeeId: "",
      startDate: new Date(),
      endDate: new Date(),
      hourlyRate: 75,
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
        hourly_rate: data.hourlyRate,
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
            Assign an employee to this project by selecting them, setting their assignment period, and hourly rate.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
            <AssignmentFormFields form={form} />
            
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
