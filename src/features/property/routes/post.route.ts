import express from 'express';
import authenticate from '../../../middlewares/auth.middleware';
import { multipleupload } from '../../../middlewares/multler';
import { parseArrayFields, validateSchema } from '../../../middlewares/propertyParsingAndValidation';
import { createPropertySchema } from '../../../validations/property.validation';
import { CreatePost } from '../controllers/createPost';

const postRouter = express.Router();    
// postRouter.post("/create/:userId", authenticate, multipleupload,  parseArrayFields(["features", "amenities"]),validateSchema(createPropertySchema), CreatePost);

export default postRouter;