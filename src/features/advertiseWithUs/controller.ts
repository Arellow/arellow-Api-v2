import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {UserDTO}  from './dto';

const prisma = new PrismaClient();

export const userController = {
  submitForm: async (req: Request, res: Response) => {
    try {
      const userData: UserDTO = req.body;
      const user = await prisma.advert.create({
        data: {
          fullName: userData.name,
          email: userData.email,
          phone_number: userData.phone,
          subject: userData.subject,
          message: userData.message,
        },
      });
      res.status(201).json({ message: 'Form submitted successfully', data: user });
    } catch (error : any) {
      res.status(400).json({ message: 'Error submitting form', error: error.message });
    } finally {
      await prisma.$disconnect();
    }
  },
};