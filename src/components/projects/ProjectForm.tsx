
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface ProjectFormData {
  project_name: string;
  client_id: string;
  start_date: string;
  end_date: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
}

interface ProjectFormProps {
  project?: ProjectFormData;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProjectForm({ project, onSuccess, onCancel }: ProjectFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormData>({
    defaultValues: project || {
      status: 'ACTIVE'
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
          .update(data)
          .eq('id', project.id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('projects')
          .insert(data);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Added successfully"
        });
      }
      onSuccess();
    } catch (error) {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          {...register("project_name", { required: true })}
          placeholder="Project Name"
          className="w-full"
        />
        {errors.project_name && (
          <span className="text-sm text-red-500">Required</span>
        )}
      </div>

      <div>
        <Select
          {...register("client_id", { required: true })}
          defaultValue={project?.client_id}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Client" />
          </SelectTrigger>
          <SelectContent>
            {clients?.map(client => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.client_id && (
          <span className="text-sm text-red-500">Required</span>
        )}
      </div>

      <div>
        <Input
          type="date"
          {...register("start_date", { required: true })}
          className="w-full"
        />
        {errors.start_date && (
          <span className="text-sm text-red-500">Required</span>
        )}
      </div>

      <div>
        <Input
          type="date"
          {...register("end_date", { required: true })}
          className="w-full"
        />
        {errors.end_date && (
          <span className="text-sm text-red-500">Required</span>
        )}
      </div>

      <div>
        <Select
          {...register("status", { required: true })}
          defaultValue={project?.status || 'ACTIVE'}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="ON_HOLD">On Hold</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <span className="text-sm text-red-500">Required</span>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
