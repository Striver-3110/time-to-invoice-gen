
import { useForm } from "react-hook-form";
import { ClientStatus } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ClientFormData {
  name: string;
  contact_email: string;
  contract_start_date: string;
  contract_end_date: string;
  status: ClientStatus;
}

interface ClientFormProps {
  client?: ClientFormData & { id: string };
  onSuccess: () => void;
  onCancel: () => void;
}

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const { toast } = useToast();
  const form = useForm<ClientFormData>({
    defaultValues: client || {
      name: "",
      contact_email: "",
      contract_start_date: "",
      contract_end_date: "",
      status: ClientStatus.ACTIVE
    }
  });

  const onSubmit = async (data: ClientFormData) => {
    const { error } = client
      ? await supabase
          .from('clients')
          .update(data)
          .eq('id', client.id)
      : await supabase
          .from('clients')
          .insert([data]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save"
      });
    } else {
      toast({
        title: "Success",
        description: `Saved successfully`
      });
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contact_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contract_start_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contract_end_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contract End Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value={ClientStatus.ACTIVE}>Active</option>
                  <option value={ClientStatus.INACTIVE}>Inactive</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {client ? 'Save' : 'Add'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
