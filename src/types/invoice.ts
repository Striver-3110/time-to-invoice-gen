
export interface ProjectTimesheet {
  projectId: string;
  projectName: string;
  employees: {
    designation: string;
    days: number;
    rate: number;
    amount: number;
  }[];
}

export interface DesignationTimesheet {
  designation: string;
  days: number;
  rate: number;
  amount: number;
}
