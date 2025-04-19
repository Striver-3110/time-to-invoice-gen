
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EmployeeList } from "@/components/employees/EmployeeList";
import { EmployeeForm } from "@/components/employees/EmployeeForm";

const Employees = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {showForm ? (
        <div className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">
            {editingEmployee ? 'Edit' : 'New'}
          </h2>
          <EmployeeForm
            employee={editingEmployee}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <EmployeeList onEdit={handleEditEmployee} />
      )}
    </div>
  );
};

export default Employees;
