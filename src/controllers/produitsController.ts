// src/controllers/produitController.ts
// Couche CONTRÔLEUR

import type { Request, Response } from "express";
import * as modele from "../models/produit.js";
import { validerProduit } from "../validation/produit.js";
import { avecCache, purgerCache } from "../cache.js";

// Constantes et utilitaires

/** Clé Redis de la liste : une seule source de vérité pour la lecture ET les purges. */
const CLE_PRODUITS = "produits";
const TTL_PRODUITS = 60; // secondes

/** Paramètres d'URL des routes  */
type ParamsId = { id: string };

function lireId(brut: string): number | undefined {
    const id = Number(brut);
    return Number.isInteger(id) && id > 0 ? id : undefined;
}

function messageErreur(erreur: unknown): string {
    console.error("Erreur inattendue :", erreur);
    return "Erreur interne du serveur";
}

// GET /api/produits
export async function listeProduits(_req: Request, res: Response): Promise<void> {
    try {
        const { valeur, cache } = await avecCache(
            CLE_PRODUITS,
            TTL_PRODUITS,
            () => modele.obtenirProduits()
        );
        res.set("X-Cache", cache);
        res.status(200).json(valeur);
    } catch (erreur: unknown) {
        res.status(500).json({ erreur: messageErreur(erreur) });
    }
}

// GET /api/produits/
export async function obtenirProduit(req: Request<ParamsId>, res: Response): Promise<void> {
    try {
        const id = lireId(req.params.id);
        if (id === undefined) {
            res.status(400).json({ erreur: "Id invalide" });
            return;
        }
        const produit = await modele.trouverProduit(id);
        if (produit === undefined) {
            res.status(404).json({ erreur: "Produit introuvable" });
            return;
        }
        res.status(200).json(produit);
    } catch (erreur: unknown) {
        res.status(500).json({ erreur: messageErreur(erreur) });
    }
}

// POST /api/produits
export async function creerProduit(
    req: Request<object, unknown, unknown>,
    res: Response
): Promise<void> {
    try {
        const resultat = validerProduit(req.body);
        if (!resultat.valide) {
            res.status(400).json({ erreur: "Donnees invalides", details: resultat.erreurs });
            return;
        }
        const produit = await modele.ajouterProduit(resultat.donnees);
        await purgerCache(CLE_PRODUITS);                 // invalidation après écriture réussie
        res.status(201).json(produit);
    } catch (erreur: unknown) {
        res.status(500).json({ erreur: messageErreur(erreur) });
    }
}

// PUT /api/produits/

export async function mettreAJourProduit(
    req: Request<ParamsId, unknown, unknown>,
    res: Response
): Promise<void> {
    try {
        const id = lireId(req.params.id);
        if (id === undefined) {
            res.status(400).json({ erreur: "Id invalide" });
            return;
        }
        const resultat = validerProduit(req.body);
        if (!resultat.valide) {
            res.status(400).json({ erreur: "Donnees invalides", details: resultat.erreurs });
            return;
        }
        const produit = await modele.remplacerProduit(id, resultat.donnees);
        if (produit === undefined) {
            res.status(404).json({ erreur: "Produit introuvable" });
            return;
        }
        await purgerCache(CLE_PRODUITS);
        res.status(200).json(produit);
    } catch (erreur: unknown) {
        res.status(500).json({ erreur: messageErreur(erreur) });
    }
}

// DELETE /api/produits/

export async function supprimerProduit(req: Request<ParamsId>, res: Response): Promise<void> {
    try {
        const id = lireId(req.params.id);
        if (id === undefined) {
            res.status(400).json({ erreur: "Id invalide" });
            return;
        }
        const supprime = await modele.supprimerProduit(id);
        if (!supprime) {
            res.status(404).json({ erreur: "Produit introuvable" });
            return;
        }
        await purgerCache(CLE_PRODUITS);
        res.status(204).end();
    } catch (erreur: unknown) {
        res.status(500).json({ erreur: messageErreur(erreur) });
    }
}