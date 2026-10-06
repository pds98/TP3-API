import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err);
  const statut = err instanceof SyntaxError && 'status' in err && err.status === 400 ? 400 : 500;
  const message = err instanceof Error && err.message ? err.message : 'Erreur du serveur';
  res.status(statut).json({ erreur: message });
}
