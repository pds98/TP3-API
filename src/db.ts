import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.on('error', (erreur: Error) => {
    console.warn('Connexion PostgreSQL interrompue :', erreur.message);
});

export async function verifierConnexion(): Promise<boolean> {
    try {
        await pool.query('SELECT 1');
        return true;
    } catch {
        return false;
    }
}
