import express from 'express';
import { userController } from './controller';

const advertRoutes = express.Router();

advertRoutes.post('/submit', userController.submitForm);

export default advertRoutes;