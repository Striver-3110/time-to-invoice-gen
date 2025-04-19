
export interface ProjectTimesheet {
  projectId: string;
  projectName: string;
  employees: {
    designation: string;
    hours: number;
    rate: number;
    amount: number;
  }[];
}

export interface DesignationTimesheet {
  designation: string;
  hours: number;
  rate: number;
  amount: number;
}
