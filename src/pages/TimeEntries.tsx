
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TimeEntryList } from "@/components/time-entries/TimeEntryList";
import { TimeEntryForm } from "@/components/time-entries/TimeEntryForm";

const TimeEntries = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingTimeEntry, setEditingTimeEntry] = useState<any>(null);

  const handleEditTimeEntry = (timeEntry: any) => {
    setEditingTimeEntry(timeEntry);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingTimeEntry(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTimeEntry(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-600">Time Entries</h1>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Time Entry
        </Button>
      </div>

      {showForm ? (
        <div className="border rounded-lg p-4 bg-white shadow-sm border-purple-200">
          <h2 className="text-lg font-semibold mb-4 text-purple-600">
            {editingTimeEntry ? 'Edit Time Entry' : 'New Time Entry'}
          </h2>
          <TimeEntryForm
            timeEntry={editingTimeEntry}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <TimeEntryList onEdit={handleEditTimeEntry} />
      )}
    </div>
  );
};

export default TimeEntries;
