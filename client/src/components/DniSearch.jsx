import { useState } from "react";
import { useLocation } from "wouter";
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
import { useToast } from "@/hooks/use-toast";

export function DniSearch() {
  const [dni, setDni] = useState("");
  const [blacklistData, setBlacklistData] = useState(null);
  const [showBlacklistAlert, setShowBlacklistAlert] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

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
          setBlacklistData(data);
          setShowBlacklistAlert(true);
          break;
        case 'found':
          setLocation(`/guest/${dni}`);
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

  const handleKeyDown = (e) => {
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
              {blacklistData && (
                <div className="space-y-2">
                  <p className="font-medium">{blacklistData.name}</p>
                  <p>{blacklistData.message}</p>
                </div>
              )}
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