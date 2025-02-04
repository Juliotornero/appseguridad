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
import { useToast } from "@/hooks/use-toast";

export function DniSearch() {
  const [dni, setDni] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const { toast } = useToast();

  const { data: sheets } = useQuery<AllSheetsData>({
    queryKey: ['/api/sheets'],
  });

  const handleSearch = () => {
    if (!dni.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingrese un DNI",
        variant: "destructive",
      });
      return;
    }

    if (!sheets) {
      toast({
        title: "Error",
        description: "Error al cargar los datos",
        variant: "destructive",
      });
      return;
    }

    // Buscar el DNI en todas las hojas
    const foundInAnySheet = sheets.some(sheet =>
      sheet.rows.some(row => row.includes(dni.trim()))
    );

    if (foundInAnySheet) {
      setShowAlert(true);
    } else {
      toast({
        title: "Resultado",
        description: "La persona no está en la lista de no gratos",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4 w-full max-w-sm mx-auto">
      <Input
        type="text"
        placeholder="Ingrese DNI"
        value={dni}
        onChange={(e) => setDni(e.target.value)}
        onKeyDown={handleKeyDown}
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