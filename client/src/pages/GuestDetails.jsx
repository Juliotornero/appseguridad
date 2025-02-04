import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GuestDetails() {
  const { dni } = useParams();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [checkInData, setCheckInData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/check-dni/${dni}`);
        const data = await response.json();

        if (data.status === 'found') {
          setCheckInData(data.data);
        } else {
          toast({
            title: "Error",
            description: "No se encontraron datos del huésped",
            variant: "destructive",
          });
          setLocation("/");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Error al cargar los datos del huésped",
          variant: "destructive",
        });
        setLocation("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dni, setLocation, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!checkInData) return null;

  const isImage = checkInData.documentUrl?.toLowerCase().endsWith('.jpeg') || 
                 checkInData.documentUrl?.toLowerCase().endsWith('.jpg') || 
                 checkInData.documentUrl?.toLowerCase().endsWith('.png');

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="container max-w-3xl mx-auto">
        <Card className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                {checkInData.names} {checkInData.lastName}
              </h1>
              <p className="text-muted-foreground">
                DNI: {checkInData.documentNumber}
              </p>
            </div>
            <Button variant="outline" onClick={() => setLocation("/")}>
              Volver
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h2 className="font-semibold mb-2">Información Personal</h2>
              <div className="space-y-2">
                <p>Teléfono: {checkInData.phone}</p>
                <p>Email: {checkInData.email}</p>
                <p>Nacionalidad: {checkInData.nationality}</p>
                <p>Fecha de Nacimiento: {checkInData.birthDate}</p>
              </div>
            </div>

            <div>
              <h2 className="font-semibold mb-2">Detalles de la Estadía</h2>
              <div className="space-y-2">
                <p>Check-in: {checkInData.checkInDate} {checkInData.checkInTime}</p>
                <p>Check-out: {checkInData.checkOutDate}</p>
                <p>Propiedad: {checkInData.property}</p>
                <p>Acompañantes: {checkInData.companions}</p>
              </div>
            </div>
          </div>

          {checkInData.documentUrl && (
            <div className="mt-6">
              <h2 className="font-semibold mb-4">Documento de Identidad</h2>
              {isImage ? (
                <div className="rounded-lg overflow-hidden border">
                  <img 
                    src={checkInData.documentUrl} 
                    alt="Documento de identidad"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
              ) : (
                <div className="flex justify-center">
                  <Button 
                    onClick={() => window.open(checkInData.documentUrl, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Ver PDF del documento
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}