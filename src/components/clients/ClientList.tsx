
import { useState } from "react";
import { ClientStatus } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Client {
  id: string;
  name: string;
  contact_email: string;
  contract_start_date: string;
  contract_end_date: string;
  status: ClientStatus;
}

export function ClientList({ onEdit }: { onEdit: (client: Client) => void }) {
  const { toast } = useToast();
  
  const { data: clients, isLoading, refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Client[];
    }
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete client"
      });
    } else {
      toast({
        title: "Success",
        description: "Client deleted successfully"
      });
      refetch();
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Contract Start</TableHead>
          <TableHead>Contract End</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients?.map((client) => (
          <TableRow key={client.id}>
            <TableCell>{client.name}</TableCell>
            <TableCell>{client.contact_email}</TableCell>
            <TableCell>{new Date(client.contract_start_date).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(client.contract_end_date).toLocaleDateString()}</TableCell>
            <TableCell>{client.status}</TableCell>
            <TableCell className="space-x-2">
              <Button variant="outline" size="icon" onClick={() => onEdit(client)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleDelete(client.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
