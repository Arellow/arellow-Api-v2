// import { Request, Response } from 'express';


// import app from '../src/server';


// export default (req: Request, res: Response) => {
//   return app(req, res);
//   // return app(req, res);
// };

// import app from '../src/server';
// export default app;


import { Request, Response } from 'express';
import app from '../src/server';
import type { Server } from 'http';

let server: Server | undefined;

export default function handler(req: Request, res: Response) {
  if (!server) server = app.listen();
  return app(req, res);
}
