import { Router } from 'express';
import { listeProduits, obtenirProduit, creerProduit, mettreAJourProduit, supprimerProduit } from '../controllers/produitsController.js';

export const routerProduits = Router();

routerProduits.get('/', listeProduits);
routerProduits.get('/:id', obtenirProduit);
routerProduits.post('/', creerProduit);
routerProduits.put('/:id', mettreAJourProduit);
routerProduits.delete('/:id', supprimerProduit);
