
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

interface Project {
  id: string;
  project_name: string;
}

interface ProjectSelectProps {
  form: UseFormReturn<any>;
  projects: Project[];
}

export const ProjectSelect = ({ form, projects }: ProjectSelectProps) => {
  return (
    <FormField
      control={form.control}
      name="project_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-blue-500">Project</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!form.watch('employee_id')}>
            <FormControl>
              <SelectTrigger className="bg-blue-50 border-blue-200">
                <SelectValue placeholder={form.watch('employee_id') ? "Select project" : "Select an employee first"} />
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
  );
};
