
// Types based on the schema provided by the user
export enum ClientStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}

export enum EmployeeStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}

export enum ProjectStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  ON_HOLD = "ON_HOLD"
}

export enum AssignmentStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED"
}

export enum InvoiceStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  PAID = "PAID",
  OVERDUE = "OVERDUE"
}

export interface Client {
  id: string;
  name: string;
  contactEmail: string;
  contractStartDate: Date;
  contractEndDate: Date;
  status: ClientStatus;
  projects?: Project[];
  invoices?: Invoice[];
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  hireDate: Date;
  designation: string;
  status: EmployeeStatus;
  timeEntries?: TimeEntry[];
  assignments?: Assignment[];
}

export interface Project {
  id: string;
  clientId: string;
  projectName: string;
  startDate: Date;
  endDate: Date;
  status: ProjectStatus;
  client?: Client;
  timeEntries?: TimeEntry[];
  assignments?: Assignment[];
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  projectId: string;
  date: Date;
  hours: number;
  employee?: Employee;
  project?: Project;
}

export interface Assignment {
  id: string;
  employeeId: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
  status: AssignmentStatus;
  employee?: Employee;
  project?: Project;
}

export interface Invoice {
  id: string;
  clientId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  totalAmount: number;
  currency: string;
  status: InvoiceStatus;
  paymentDate?: Date;
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  client?: Client;
  lineItems?: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  employeeId: string;
  projectId: string;
  serviceDescription: string;
  quantity: number;
  rate: number;
  totalAmount: number;
  invoice?: Invoice;
  employee?: Employee;
  project?: Project;
}
