
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HRMetrics } from "@/components/reports/HRMetrics";
import { FinanceMetrics } from "@/components/reports/FinanceMetrics";
import { AdminMetrics } from "@/components/reports/AdminMetrics";

const Reports = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>
      
      <Tabs defaultValue="hr" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hr">HR Metrics</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>
        
        <TabsContent value="hr" className="space-y-4">
          <HRMetrics />
        </TabsContent>
        
        <TabsContent value="finance" className="space-y-4">
          <FinanceMetrics />
        </TabsContent>
        
        <TabsContent value="admin" className="space-y-4">
          <AdminMetrics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
