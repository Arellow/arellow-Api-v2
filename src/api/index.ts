import { Request, Response } from 'express';
import serverless from 'serverless-http';

import app from '../server';

const handler = serverless(app);

export default (req: Request, res: Response) => {
  return handler(req, res);
  // return app(req, res);
};