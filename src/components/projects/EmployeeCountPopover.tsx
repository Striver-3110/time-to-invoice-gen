
import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Users } from "lucide-react";

interface Employee {
  first_name: string;
  last_name: string;
  designation: string;
}

interface EmployeesByDesignation {
  [key: string]: Employee[];
}

interface EmployeeCountPopoverProps {
  employees: Employee[];
  count: number;
}

export function EmployeeCountPopover({ employees, count }: EmployeeCountPopoverProps) {
  const employeesByDesignation = employees.reduce((acc: EmployeesByDesignation, employee) => {
    if (!acc[employee.designation]) {
      acc[employee.designation] = [];
    }
    acc[employee.designation].push(employee);
    return acc;
  }, {});

  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors">
        <Users className="h-4 w-4" />
        {count}
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          {Object.entries(employeesByDesignation).map(([designation, designationEmployees]) => (
            <div key={designation} className="space-y-2">
              <h4 className="font-medium text-sm text-purple-600">{designation}</h4>
              <ul className="space-y-1">
                {designationEmployees.map((employee, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {employee.first_name} {employee.last_name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
