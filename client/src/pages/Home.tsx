import { DniSearch } from "@/components/DniSearch";

export default function Home() {
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="container max-w-lg mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Control de Ingresos Mundo Yanashpa
          </h1>
          <p className="text-muted-foreground">
            Ingrese el DNI de la persona para verificar su acceso
          </p>
        </div>
        <DniSearch />
      </div>
    </div>
  );
}