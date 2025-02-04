import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useQuery } from "@tanstack/react-query";
import type { AllSheetsData } from "@shared/schema";

export function DniSearch() {
  const [dni, setDni] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const { data: sheets } = useQuery<AllSheetsData>({
    queryKey: ['/api/sheets'],
  });

  const handleSearch = () => {
    if (!dni || !sheets) return;

    // Buscar el DNI en todas las hojas
    const foundInAnySheet = sheets.some(sheet =>
      sheet.rows.some(row => row.includes(dni))
    );

    if (foundInAnySheet) {
      setShowAlert(true);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-sm mx-auto">
      <Input
        type="text"
        placeholder="Ingrese DNI"
        value={dni}
        onChange={(e) => setDni(e.target.value)}
        className="text-lg"
      />
      <Button 
        onClick={handleSearch} 
        className="w-full"
        size="lg"
      >
        Buscar
      </Button>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¡Alerta!</AlertDialogTitle>
            <AlertDialogDescription>
              Esta persona está en la lista de no gratos y no puede ingresar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cerrar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
