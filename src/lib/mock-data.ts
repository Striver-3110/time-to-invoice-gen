
import { 
  Client, ClientStatus, Employee, EmployeeStatus, Project, ProjectStatus, 
  Assignment, AssignmentStatus, TimeEntry, Invoice, InvoiceStatus, InvoiceLineItem 
} from './types';

// Mock Clients
export const clients: Client[] = [
  {
    id: "c1",
    name: "Acme Corporation",
    contactEmail: "contact@acmecorp.com",
    contractStartDate: new Date("2023-01-01"),
    contractEndDate: new Date("2024-12-31"),
    status: ClientStatus.ACTIVE,
  },
  {
    id: "c2",
    name: "TechGiant Inc.",
    contactEmail: "info@techgiant.com",
    contractStartDate: new Date("2023-03-15"),
    contractEndDate: new Date("2025-03-14"),
    status: ClientStatus.ACTIVE,
  },
  {
    id: "c3",
    name: "Innovate Solutions",
    contactEmail: "contact@innovatesol.com",
    contractStartDate: new Date("2022-06-01"),
    contractEndDate: new Date("2023-11-30"),
    status: ClientStatus.INACTIVE,
  }
];

// Mock Employees
export const employees: Employee[] = [
  {
    id: "e1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@company.com",
    hireDate: new Date("2020-05-15"),
    designation: "Senior Developer",
    status: EmployeeStatus.ACTIVE,
  },
  {
    id: "e2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@company.com",
    hireDate: new Date("2021-02-10"),
    designation: "UX Designer",
    status: EmployeeStatus.ACTIVE,
  },
  {
    id: "e3",
    firstName: "Michael",
    lastName: "Johnson",
    email: "michael.johnson@company.com",
    hireDate: new Date("2019-11-22"),
    designation: "Project Manager",
    status: EmployeeStatus.ACTIVE,
  },
  {
    id: "e4",
    firstName: "Sarah",
    lastName: "Williams",
    email: "sarah.williams@company.com",
    hireDate: new Date("2022-01-05"),
    designation: "QA Engineer",
    status: EmployeeStatus.ACTIVE,
  }
];

// Mock Projects
export const projects: Project[] = [
  {
    id: "p1",
    clientId: "c1",
    projectName: "Acme Web Platform",
    startDate: new Date("2023-02-01"),
    endDate: new Date("2023-12-31"),
    status: ProjectStatus.ACTIVE,
  },
  {
    id: "p2",
    clientId: "c1",
    projectName: "Acme Mobile App",
    startDate: new Date("2023-04-15"),
    endDate: new Date("2024-04-14"),
    status: ProjectStatus.ACTIVE,
  },
  {
    id: "p3",
    clientId: "c2",
    projectName: "TechGiant CRM Integration",
    startDate: new Date("2023-05-01"),
    endDate: new Date("2024-02-28"),
    status: ProjectStatus.ACTIVE,
  },
  {
    id: "p4",
    clientId: "c3",
    projectName: "Innovate Solutions Portal",
    startDate: new Date("2022-07-01"),
    endDate: new Date("2023-09-30"),
    status: ProjectStatus.COMPLETED,
  }
];

// Mock Assignments
export const assignments: Assignment[] = [
  {
    id: "a1",
    employeeId: "e1",
    projectId: "p1",
    startDate: new Date("2023-02-01"),
    endDate: new Date("2023-12-31"),
    status: AssignmentStatus.ACTIVE,
  },
  {
    id: "a2",
    employeeId: "e2",
    projectId: "p1",
    startDate: new Date("2023-02-15"),
    endDate: new Date("2023-12-31"),
    status: AssignmentStatus.ACTIVE,
  },
  {
    id: "a3",
    employeeId: "e3",
    projectId: "p1",
    startDate: new Date("2023-02-01"),
    endDate: new Date("2023-12-31"),
    status: AssignmentStatus.ACTIVE,
  },
  {
    id: "a4",
    employeeId: "e1",
    projectId: "p2",
    startDate: new Date("2023-05-01"),
    endDate: new Date("2024-04-14"),
    status: AssignmentStatus.ACTIVE,
  },
  {
    id: "a5",
    employeeId: "e4",
    projectId: "p2",
    startDate: new Date("2023-05-01"),
    endDate: new Date("2024-04-14"),
    status: AssignmentStatus.ACTIVE,
  },
  {
    id: "a6",
    employeeId: "e2",
    projectId: "p3",
    startDate: new Date("2023-05-15"),
    endDate: new Date("2024-02-28"),
    status: AssignmentStatus.ACTIVE,
  },
  {
    id: "a7",
    employeeId: "e3",
    projectId: "p3",
    startDate: new Date("2023-05-15"),
    endDate: new Date("2024-02-28"),
    status: AssignmentStatus.ACTIVE,
  },
  {
    id: "a8",
    employeeId: "e1",
    projectId: "p4",
    startDate: new Date("2022-07-01"),
    endDate: new Date("2023-09-30"),
    status: AssignmentStatus.COMPLETED,
  }
];

// Mock Time Entries
export const timeEntries: TimeEntry[] = [
  // John Doe on Acme Web Platform
  { id: "t1", employeeId: "e1", projectId: "p1", date: new Date("2023-06-01"), hours: 8 },
  { id: "t2", employeeId: "e1", projectId: "p1", date: new Date("2023-06-02"), hours: 7.5 },
  { id: "t3", employeeId: "e1", projectId: "p1", date: new Date("2023-06-05"), hours: 8 },
  
  // Jane Smith on Acme Web Platform
  { id: "t4", employeeId: "e2", projectId: "p1", date: new Date("2023-06-01"), hours: 6 },
  { id: "t5", employeeId: "e2", projectId: "p1", date: new Date("2023-06-02"), hours: 7 },
  { id: "t6", employeeId: "e2", projectId: "p1", date: new Date("2023-06-05"), hours: 8 },
  
  // Michael Johnson on Acme Web Platform
  { id: "t7", employeeId: "e3", projectId: "p1", date: new Date("2023-06-01"), hours: 4 },
  { id: "t8", employeeId: "e3", projectId: "p1", date: new Date("2023-06-02"), hours: 5 },
  { id: "t9", employeeId: "e3", projectId: "p1", date: new Date("2023-06-05"), hours: 4 },
  
  // John Doe on Acme Mobile App
  { id: "t10", employeeId: "e1", projectId: "p2", date: new Date("2023-06-06"), hours: 8 },
  { id: "t11", employeeId: "e1", projectId: "p2", date: new Date("2023-06-07"), hours: 8 },
  
  // Sarah Williams on Acme Mobile App
  { id: "t12", employeeId: "e4", projectId: "p2", date: new Date("2023-06-06"), hours: 7 },
  { id: "t13", employeeId: "e4", projectId: "p2", date: new Date("2023-06-07"), hours: 7.5 },
  
  // Jane Smith on TechGiant CRM Integration
  { id: "t14", employeeId: "e2", projectId: "p3", date: new Date("2023-06-08"), hours: 8 },
  { id: "t15", employeeId: "e2", projectId: "p3", date: new Date("2023-06-09"), hours: 8 },
  
  // Michael Johnson on TechGiant CRM Integration
  { id: "t16", employeeId: "e3", projectId: "p3", date: new Date("2023-06-08"), hours: 6 },
  { id: "t17", employeeId: "e3", projectId: "p3", date: new Date("2023-06-09"), hours: 6.5 },
];

// Mock Invoices
export const invoices: Invoice[] = [
  {
    id: "i1",
    clientId: "c1",
    invoiceNumber: "INV-2023-001",
    invoiceDate: new Date("2023-06-30"),
    dueDate: new Date("2023-07-15"),
    totalAmount: 12600,
    currency: "USD",
    status: InvoiceStatus.PAID,
    paymentDate: new Date("2023-07-10"),
    billingPeriodStart: new Date("2023-06-01"),
    billingPeriodEnd: new Date("2023-06-30"),
  },
  {
    id: "i2",
    clientId: "c2",
    invoiceNumber: "INV-2023-002",
    invoiceDate: new Date("2023-06-30"),
    dueDate: new Date("2023-07-15"),
    totalAmount: 7200,
    currency: "USD",
    status: InvoiceStatus.SENT,
    billingPeriodStart: new Date("2023-06-01"),
    billingPeriodEnd: new Date("2023-06-30"),
  }
];

// Mock Invoice Line Items
export const invoiceLineItems: InvoiceLineItem[] = [
  // Invoice 1 - for Acme Corp
  {
    id: "li1",
    invoiceId: "i1",
    assignmentId: "a1",
    employeeId: "e1",
    projectId: "p1",
    serviceDescription: "Senior Developer Services - Acme Web Platform",
    quantity: 23.5, // Total hours
    totalAmount: 4700, // At $200/hour
  },
  {
    id: "li2",
    invoiceId: "i1",
    assignmentId: "a2",
    employeeId: "e2",
    projectId: "p1",
    serviceDescription: "UX Designer Services - Acme Web Platform",
    quantity: 21, // Total hours
    totalAmount: 3150, // At $150/hour
  },
  {
    id: "li3",
    invoiceId: "i1",
    assignmentId: "a3",
    employeeId: "e3",
    projectId: "p1",
    serviceDescription: "Project Management Services - Acme Web Platform",
    quantity: 13, // Total hours
    totalAmount: 2600, // At $200/hour
  },
  {
    id: "li4",
    invoiceId: "i1",
    assignmentId: "a4",
    employeeId: "e1",
    projectId: "p2",
    serviceDescription: "Senior Developer Services - Acme Mobile App",
    quantity: 16, // Total hours
    totalAmount: 3200, // At $200/hour
  },
  
  // Invoice 2 - for TechGiant
  {
    id: "li5",
    invoiceId: "i2",
    assignmentId: "a6",
    employeeId: "e2",
    projectId: "p3",
    serviceDescription: "UX Designer Services - TechGiant CRM Integration",
    quantity: 16, // Total hours
    totalAmount: 2400, // At $150/hour
  },
  {
    id: "li6",
    invoiceId: "i2",
    assignmentId: "a7",
    employeeId: "e3",
    projectId: "p3",
    serviceDescription: "Project Management Services - TechGiant CRM Integration",
    quantity: 12.5, // Total hours
    totalAmount: 2500, // At $200/hour
  }
];

// Helper function to get full data with relations
export function getEnrichedData() {
  const enrichedClients = clients.map(client => ({
    ...client,
    projects: projects.filter(project => project.clientId === client.id),
    invoices: invoices.filter(invoice => invoice.clientId === client.id)
  }));
  
  const enrichedProjects = projects.map(project => ({
    ...project,
    client: clients.find(client => client.id === project.clientId),
    assignments: assignments.filter(assignment => assignment.projectId === project.id),
    timeEntries: timeEntries.filter(entry => entry.projectId === project.id)
  }));
  
  const enrichedEmployees = employees.map(employee => ({
    ...employee,
    assignments: assignments.filter(assignment => assignment.employeeId === employee.id),
    timeEntries: timeEntries.filter(entry => entry.employeeId === employee.id)
  }));
  
  const enrichedAssignments = assignments.map(assignment => ({
    ...assignment,
    employee: employees.find(employee => employee.id === assignment.employeeId),
    project: projects.find(project => project.id === assignment.projectId)
  }));
  
  const enrichedTimeEntries = timeEntries.map(entry => ({
    ...entry,
    employee: employees.find(employee => employee.id === entry.employeeId),
    project: projects.find(project => project.id === entry.projectId)
  }));
  
  const enrichedInvoices = invoices.map(invoice => ({
    ...invoice,
    client: clients.find(client => client.id === invoice.clientId),
    lineItems: invoiceLineItems.filter(item => item.invoiceId === invoice.id)
  }));
  
  const enrichedInvoiceLineItems = invoiceLineItems.map(item => ({
    ...item,
    invoice: invoices.find(invoice => invoice.id === item.invoiceId),
    assignment: assignments.find(assignment => assignment.id === item.assignmentId),
    employee: employees.find(employee => employee.id === item.employeeId),
    project: projects.find(project => project.id === item.projectId)
  }));
  
  return {
    clients: enrichedClients,
    projects: enrichedProjects,
    employees: enrichedEmployees,
    assignments: enrichedAssignments,
    timeEntries: enrichedTimeEntries,
    invoices: enrichedInvoices,
    invoiceLineItems: enrichedInvoiceLineItems
  };
}

// Helper function to generate a new invoice number
export function generateInvoiceNumber() {
  const prefix = "INV";
  const year = new Date().getFullYear();
  const lastInvoice = invoices.length > 0 ? 
    parseInt(invoices[invoices.length - 1].invoiceNumber.split("-")[2]) : 0;
  const nextNum = (lastInvoice + 1).toString().padStart(3, "0");
  return `${prefix}-${year}-${nextNum}`;
}
