
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Save } from "lucide-react";
import { ClientList } from "@/components/clients/ClientList";
import { ClientForm } from "@/components/clients/ClientForm";

const Clients = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);

  const handleEditClient = (client: any) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {showForm ? (
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">
            {editingClient ? 'Edit' : 'New'}
          </h2>
          <ClientForm
            client={editingClient}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <ClientList onEdit={handleEditClient} />
      )}
    </div>
  );
};

export default Clients;
