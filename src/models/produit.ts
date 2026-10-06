import { pool } from '../db.js';

export interface Produit {
    id: number;
    nom: string;
    prix: number;
    stock: number;
    categorie: string;
}

export type NouveauProduit = Omit<Produit, 'id'>;

type LigneProduit = Omit<Produit, 'prix'> & { prix: string };

function convertirProduit(ligne: LigneProduit): Produit {
    return { ...ligne, prix: Number(ligne.prix) };
}

export async function obtenirProduits(): Promise<Produit[]> {
    const { rows } = await pool.query<LigneProduit>(
        'SELECT id, nom, prix, stock, categorie FROM produits ORDER BY id'
    );
    return rows.map(convertirProduit);
}

export async function trouverProduit(id: number): Promise<Produit | undefined> {
    const { rows } = await pool.query<LigneProduit>(
        'SELECT id, nom, prix, stock, categorie FROM produits WHERE id = $1',
        [id]
    );
    return rows[0] ? convertirProduit(rows[0]) : undefined;
}

export async function ajouterProduit(donnees: NouveauProduit): Promise<Produit> {
    const { rows } = await pool.query<LigneProduit>(
        'INSERT INTO produits (nom, prix, stock, categorie) VALUES ($1, $2, $3, $4) RETURNING id, nom, prix, stock, categorie',
        [donnees.nom, donnees.prix, donnees.stock, donnees.categorie]
    );
    return convertirProduit(rows[0]!);
}

export async function remplacerProduit(id: number, donnees: NouveauProduit): Promise<Produit | undefined> {
    const { rows } = await pool.query<LigneProduit>(
        'UPDATE produits SET nom = $1, prix = $2, stock = $3, categorie = $4 WHERE id = $5 RETURNING id, nom, prix, stock, categorie',
        [donnees.nom, donnees.prix, donnees.stock, donnees.categorie, id]
    );
    return rows[0] ? convertirProduit(rows[0]) : undefined;
}

export async function supprimerProduit(id: number): Promise<boolean> {
    const resultat = await pool.query('DELETE FROM produits WHERE id = $1', [id]);
    return (resultat.rowCount ?? 0) > 0;
}
