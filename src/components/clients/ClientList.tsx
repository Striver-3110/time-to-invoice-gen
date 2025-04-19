import { useState } from "react";
import { ClientStatus } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
interface Client {
  id: string;
  name: string;
  contact_email: string;
  contract_start_date: string;
  contract_end_date: string;
  status: ClientStatus;
}
export function ClientList({
  onEdit
}: {
  onEdit: (client: Client) => void;
}) {
  const {
    toast
  } = useToast();
  const {
    data: clients,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('clients').select('*').order('name');
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch clients"
        });
        throw error;
      }
      return data as Client[];
    }
  });
  const handleDelete = async (id: string) => {
    const {
      error
    } = await supabase.from('clients').delete().eq('id', id);
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
  if (isLoading) return <div className="flex items-center justify-center h-64">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>;
  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case ClientStatus.ACTIVE:
        return "bg-green-500/15 text-green-700 hover:bg-green-500/25";
      case ClientStatus.INACTIVE:
        return "bg-gray-500/15 text-gray-700 hover:bg-gray-500/25";
      default:
        return "bg-gray-500/15 text-gray-700 hover:bg-gray-500/25";
    }
  };
  return <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Email</TableHead>
            <TableHead className="font-semibold">Contract Start</TableHead>
            <TableHead className="font-semibold">Contract End</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients?.map(client => <TableRow key={client.id} className="hover:bg-muted/50 transition-colors group">
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>{client.contact_email}</TableCell>
              <TableCell>{new Date(client.contract_start_date).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(client.contract_end_date).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge className={`${getStatusColor(client.status)}`}>
                  {client.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button variant="outline" size="icon" onClick={() => onEdit(client)} className="text-emerald-600 hover:text-emerald-700 transition-colors duration-200 ease-in-out transform hover:scale-105 bg-emerald-600 hover:bg-emerald-500">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(client.id)} className="bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors duration-200 ease-in-out transform hover:scale-105">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>)}
        </TableBody>
      </Table>
    </div>;
}