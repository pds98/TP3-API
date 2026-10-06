import type { NouveauProduit } from '../models/produit.js';

export type ResultatValidation =
    | { valide: true; donnees: NouveauProduit }
    | { valide: false; erreurs: string[] };

export function validerProduit(corps: unknown): ResultatValidation {
    if (typeof corps !== 'object' || corps === null) {
        return { valide: false, erreurs: ['Le corps doit etre un objet'] };
    }

    const champs = corps as Record<string, unknown>;
    const { nom, prix, stock, categorie } = champs;
    const erreurs: string[] = [];

    if (typeof nom !== 'string' || nom.trim() === '') {
        erreurs.push('Le nom doit etre un texte non vide');
    }
    if (typeof prix !== 'number' || !Number.isFinite(prix) || prix <= 0) {
        erreurs.push('Le prix doit etre un nombre superieur a 0');
    }
    if (typeof stock !== 'number' || !Number.isInteger(stock) || stock < 0) {
        erreurs.push('Le stock doit etre un entier positif ou nul');
    }
    if (typeof categorie !== 'string' || categorie.trim() === '') {
        erreurs.push('La categorie doit etre un texte non vide');
    }

    if (erreurs.length === 0 && typeof nom === 'string' && typeof prix === 'number'
        && typeof stock === 'number' && typeof categorie === 'string') {
        return {
            valide: true,
            donnees: { nom: nom.trim(), prix, stock, categorie: categorie.trim() },
        };
    }

    return { valide: false, erreurs };
}
