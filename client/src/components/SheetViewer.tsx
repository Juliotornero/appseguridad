import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "./DataTable";
import { useQuery } from "@tanstack/react-query";
import type { AllSheetsData } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function SheetViewer() {
  const { data: sheets, isLoading, error } = useQuery<AllSheetsData>({
    queryKey: ['/api/sheets'],
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load spreadsheet data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!sheets || sheets.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No data found in the spreadsheet.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Tabs defaultValue={sheets[0].sheetName} className="w-full">
      <TabsList className="mb-4 flex flex-wrap">
        {sheets.map((sheet) => (
          <TabsTrigger key={sheet.sheetName} value={sheet.sheetName}>
            {sheet.sheetName}
          </TabsTrigger>
        ))}
      </TabsList>
      {sheets.map((sheet) => (
        <TabsContent key={sheet.sheetName} value={sheet.sheetName}>
          <DataTable data={sheet} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
