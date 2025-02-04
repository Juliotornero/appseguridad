import type { Express } from "express";
import { createServer, type Server } from "http";
import { checkBlacklist, getLatestCheckIn, getAllSheetData } from './google-sheets';

export function registerRoutes(app: Express): Server {
  // Ruta de prueba para verificar conexión con sheets
  app.get('/api/test-sheets', async (req, res) => {
    try {
      await getAllSheetData();
      res.json({ status: 'ok', message: 'Successfully connected to sheets' });
    } catch (error) {
      console.error('Error testing sheets:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'Error connecting to sheets',
        error: (error as Error).message
      });
    }
  });

  // Endpoint para verificar DNI
  app.get('/api/check-dni/:dni', async (req, res) => {
    try {
      const { dni } = req.params;

      // Primero verificar si está en la lista negra
      const blacklistResult = await checkBlacklist(dni);

      if (blacklistResult.found) {
        return res.json({ 
          status: 'blacklisted',
          sheetName: blacklistResult.sheetName,
          name: blacklistResult.name,
          message: blacklistResult.message
        });
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
        message: 'Error al verificar el DNI',
        error: (error as Error).message
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}