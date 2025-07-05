import { NextFunction, Request, Response } from "express";
import { InternalServerError } from "../../../lib/appError";
import { Prisma } from "../../../lib/prisma";


export const createNewProperty = async (req: Request, res: Response, next: NextFunction) => {

    const { documentType, documentNumber } = req.body


    try {

        const userId = req.user?.id!;
        const is_user_verified = req.user?.is_verified!;

        if (!is_user_verified) {
            return next(new InternalServerError("Unverify email please check mail and verify account", 401));
        }


        const kyc = await Prisma.kyc.findUnique({
            where: { userId }
        });


        if (kyc && kyc.status == 'VERIFIED') {
            return res.status(403).json({ message: 'Credential was verify' });
        }


        const documentPhoto = "";


        await Prisma.kyc.create({
            data: {
                userId,
                documentType,
                documentPhoto,
                documentNumber
            }
        });






    } catch (error) {

    }


}
