
import { useState } from "react";
import { ClientStatus } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const { toast } = useToast();
  const navigate = useNavigate();
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const {
    data: clients,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase.from('clients').select('*').order('name');
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
    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete"
      });
    } else {
      toast({
        title: "Success",
        description: "Deleted successfully"
      });
      refetch();
    }
    setClientToDelete(null);
  };

  const handleGenerateInvoice = (client: Client) => {
    navigate(`/clients/${client.id}/generate-invoice`);
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

  return (
    <>
      <div className="rounded-lg border bg-card">
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
            {clients?.map(client => (
              <TableRow key={client.id} className="hover:bg-muted/50 transition-colors group">
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
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => onEdit(client)} 
                      className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 transition-colors duration-200 ease-in-out transform hover:scale-105"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setClientToDelete(client.id)} 
                      className="text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200 transition-colors duration-200 ease-in-out transform hover:scale-105"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleGenerateInvoice(client)} 
                      className="text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-200 transition-colors duration-200 ease-in-out transform hover:scale-105"
                      title="Generate Invoice"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clientToDelete && handleDelete(clientToDelete)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
