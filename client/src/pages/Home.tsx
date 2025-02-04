import { SheetViewer } from "@/components/SheetViewer";

export default function Home() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Google Sheets Viewer</h1>
        <p className="text-muted-foreground mt-2">
          View and navigate through multiple sheets from the connected Google Spreadsheet
        </p>
      </div>
      <SheetViewer />
    </div>
  );
}
