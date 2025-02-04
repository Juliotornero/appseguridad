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
import { useToast } from "@/hooks/use-toast";

export function DniSearch() {
  const [dni, setDni] = useState("");
  const [showBlacklistAlert, setShowBlacklistAlert] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!dni.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingrese un DNI",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/check-dni/${dni.trim()}`);
      if (!response.ok) {
        throw new Error('Error al verificar el DNI');
      }

      const data = await response.json();

      switch (data.status) {
        case 'blacklisted':
          setShowBlacklistAlert(true);
          break;
        case 'found':
          // Aquí podríamos navegar a la página de detalles con los datos
          window.location.href = `/guest/${dni}`;
          break;
        case 'not_found':
          toast({
            title: "Resultado",
            description: "La persona no está registrada en el sistema",
          });
          break;
        default:
          toast({
            title: "Error",
            description: "Error al verificar el DNI",
            variant: "destructive",
          });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al verificar el DNI",
        variant: "destructive",
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

      <AlertDialog open={showBlacklistAlert} onOpenChange={setShowBlacklistAlert}>
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