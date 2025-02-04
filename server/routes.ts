import type { Express } from "express";
import { createServer, type Server } from "http";
import { getAllSheetData } from './google-sheets';

export function registerRoutes(app: Express): Server {
  // Google Sheets data endpoint
  app.get('/api/sheets', async (_req, res) => {
    try {
      const data = await getAllSheetData();
      res.json(data);
    } catch (error) {
      console.error('Error fetching sheets:', error);
      res.status(500).json({ message: 'Failed to fetch spreadsheet data' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
