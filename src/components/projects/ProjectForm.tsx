
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
import { useQuery } from "@tanstack/react-query";
import { ProjectStatus } from "@/lib/types";

interface ProjectFormData {
  id?: string;
  project_name: string;
  client_id: string;
  start_date: string;
  end_date: string;
  status: ProjectStatus;
}

interface ProjectFormProps {
  project?: ProjectFormData;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProjectForm({ project, onSuccess, onCancel }: ProjectFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ProjectFormData>({
    defaultValues: project || {
      project_name: "",
      client_id: "",
      start_date: "",
      end_date: "",
      status: ProjectStatus.ACTIVE
    }
  });

  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    try {
      if (project?.id) {
        const { error } = await supabase
          .from('projects')
          .update({
            project_name: data.project_name,
            client_id: data.client_id,
            start_date: data.start_date,
            end_date: data.end_date,
            status: data.status
          })
          .eq('id', project.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Project updated successfully",
          variant: "default",
          className: "bg-green-500 text-white border-green-600"
        });
      } else {
        const { error } = await supabase
          .from('projects')
          .insert({
            project_name: data.project_name,
            client_id: data.client_id,
            start_date: data.start_date,
            end_date: data.end_date,
            status: data.status
          });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Project added successfully",
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
          name="project_name"
          rules={{ required: "Project name is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-indigo-700 font-medium">Project Name</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter project name" 
                  className="border-indigo-200 focus:border-indigo-500" 
                />
              </FormControl>
              <FormMessage className="text-rose-500" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="client_id"
          rules={{ required: "Client is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-indigo-700 font-medium">Client</FormLabel>
              <Select 
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="border-indigo-200 focus:border-indigo-500">
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white">
                  {clients?.map((client) => (
                    <SelectItem 
                      key={client.id} 
                      value={client.id}
                      className="hover:bg-indigo-50"
                    >
                      {client.name}
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
          name="start_date"
          rules={{ required: "Start date is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-indigo-700 font-medium">Start Date</FormLabel>
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
          name="end_date"
          rules={{ required: "End date is required" }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-indigo-700 font-medium">End Date</FormLabel>
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
                  <SelectItem value={ProjectStatus.ACTIVE} className="hover:bg-indigo-50">Active</SelectItem>
                  <SelectItem value={ProjectStatus.COMPLETED} className="hover:bg-indigo-50">Completed</SelectItem>
                  <SelectItem value={ProjectStatus.ON_HOLD} className="hover:bg-indigo-50">On Hold</SelectItem>
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
            {isSubmitting ? 'Saving...' : project ? 'Update' : 'Add'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
