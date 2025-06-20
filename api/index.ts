import { Request, Response } from 'express';
import app from '../src/app';
// import app from '../src/index';

export default (req: Request, res: Response) => {
  return app(req, res);
};