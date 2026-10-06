import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { verifierConnexion } from './db.js';
import { routerProduits } from './route/produits.js';
import { errorHandler } from './middlewares/errorHandler.js';
import "dotenv/config";

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req: Request, res: Response): Promise<void> => {
    const connexion = await verifierConnexion();
    res.status(connexion ? 200 : 503).json({ statut: connexion ? 'ok' : 'erreur' });
});

app.use('/api/produits', routerProduits);
app.use(errorHandler);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
    console.log(`Serveur demarre sur http://localhost:${port}`);

    app.get("/", (_req, res) => {
        res.status(200).json({
            nom: "API Produits - TP3",
            routes: {
                sante: "GET /api/health",
                liste: "GET /api/produits",
                detail: "GET /api/produits/:id",
                creer: "POST /api/produits",
                remplacer: "PUT /api/produits/:id",
                supprimer: "DELETE /api/produits/:id",
            },
        });
    });
});
