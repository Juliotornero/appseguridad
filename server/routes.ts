import type { Express } from "express";
import { createServer, type Server } from "http";
import { checkBlacklist, getLatestCheckIn } from './google-sheets';

export function registerRoutes(app: Express): Server {
  // Endpoint para verificar DNI
  app.get('/api/check-dni/:dni', async (req, res) => {
    try {
      const { dni } = req.params;

      // Primero verificar si está en la lista negra
      const isBlacklisted = await checkBlacklist(dni);

      if (isBlacklisted) {
        return res.json({ status: 'blacklisted' });
      }

      // Si no está en la lista negra, buscar su último check-in
      const checkInData = await getLatestCheckIn(dni);

      if (checkInData) {
        return res.json({
          status: 'found',
          data: checkInData
        });
      }

      // Si no se encuentra en ninguna lista
      return res.json({ status: 'not_found' });

    } catch (error) {
      console.error('Error checking DNI:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Error al verificar el DNI' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}