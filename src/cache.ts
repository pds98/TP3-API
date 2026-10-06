import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export type SourceCache = 'hit' | 'miss' | 'bypass';

const client = createClient({
    url: process.env.REDIS_URL,
    disableOfflineQueue: true,
    socket: { connectTimeout: 1000, reconnectStrategy: () => 1000 },
});

client.on('error', (erreur: Error) => {
    console.warn('Redis indisponible :', erreur.message);
});

const connexion = client.connect();
try {
    await Promise.race([
        connexion,
        new Promise<void>((resolve) => setTimeout(resolve, 1000)),
    ]);
} catch (erreur) {
    console.warn('Connexion Redis impossible :', erreur);
}

export async function lireCache<T>(cle: string): Promise<T | null> {
    const texte = await client.get(cle);
    return texte === null ? null : JSON.parse(texte) as T;
}

export async function mettreEnCache<T>(cle: string, valeur: T, ttlSec = 60): Promise<void> {
    await client.setEx(cle, ttlSec, JSON.stringify(valeur));
}

export async function purgerCache(cle: string): Promise<void> {
    try {
        await client.del(cle);
    } catch (erreur) {
        console.warn('Purge du cache impossible :', erreur);
    }
}

export async function avecCache<T>(
    cle: string,
    ttlSec: number,
    charger: () => Promise<T>
): Promise<{ valeur: T; cache: SourceCache }> {
    try {
        const valeur = await lireCache<T>(cle);
        if (valeur !== null) {
            return { valeur, cache: 'hit' };
        }
    } catch (erreur) {
        console.warn('Cache contourne :', erreur);
        return { valeur: await charger(), cache: 'bypass' };
    }

    const valeur = await charger();
    try {
        await mettreEnCache(cle, valeur, ttlSec);
        return { valeur, cache: 'miss' };
    } catch (erreur) {
        console.warn('Cache contourne :', erreur);
        return { valeur, cache: 'bypass' };
    }
}
