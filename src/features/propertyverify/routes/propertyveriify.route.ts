import express from 'express';
import { createPropertyVerify } from '../controller/createpayment';
import { singleupload } from '../../../middlewares/multer';
import { getPropertyVerificationDetail, getPropertyVerifications } from '../controller/propertyverificarion.contrroller';

const propertyverifyrouter = express.Router();

propertyverifyrouter.post("/create-property-verify", singleupload, createPropertyVerify);
propertyverifyrouter.get("/:id/detail", getPropertyVerificationDetail);
propertyverifyrouter.get("/", getPropertyVerifications);

export default propertyverifyrouter;