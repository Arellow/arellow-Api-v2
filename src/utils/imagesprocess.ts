import pLimit from 'p-limit';
import { getDataUri } from '../middlewares/multer';
import { cloudinary } from '../configs/cloudinary';
import { Prisma } from '../lib/prisma';
import { MediaType, UserPhotoType } from '@prisma/client';


type TprocessImage = {
    images: [],
    folder:  string
    photoType:  UserPhotoType

}


export async function processImages({images = [],folder , photoType }: TprocessImage) {
  
const limit = pLimit(3);

const imagesToUpload =  images.map(image => {
  const file = getDataUri(image);
  return limit(async () => {
        const result = await cloudinary.uploader.upload(file.content, {
      folder, 
    });

  const url =  cloudinary.url(result?.public_id, {
    transformation: [
      {
        quality: "auto",
        fetch_format: "auto",
      },
      {
        width: 500,
        height: 500,
        crop: "fill",
        gravity: "auto",
      },
      
    ],
   

  });

  await Prisma.userMedia.create({
    data: {
    //   photoUrl: url,
    //   public_id: result?.public_id,
    type : "PHOTO",
    photoType,
    url,
    publicId: result?.public_id,

    },
  });


  return url;

  })
});


const photoUrls = await Promise.all(imagesToUpload)

  return photoUrls;
}

export async function deleteImage(photoUrl: string){

  if(photoUrl){
    const isAvatarSaved =  await Prisma.userMedia.findFirst({
      where: {url: photoUrl}
    });
   
    if(isAvatarSaved){
      await cloudinary.uploader.destroy(isAvatarSaved.publicId);
      await Prisma.userMedia.delete({where: {id: isAvatarSaved.id}})
  
    }

  }


}


export async function deleteMultipleImages(images = []){

  if(images.length > 0){

    for await (const photoUrl of images) {

    const isAvatarSaved =  await Prisma.userMedia.findFirst({
      where: {url:photoUrl}
    });
  

    if(isAvatarSaved){
      await cloudinary.uploader.destroy(isAvatarSaved.publicId);
      await Prisma.userMedia.delete({where: {id: isAvatarSaved.id}})
  
    }
  
     }  

  }

}



export async function processImage({image, folder , photoType , type}:{image: any, folder: string, photoType: UserPhotoType, type: MediaType}) {
  
  const file = getDataUri(image);

      const result = await cloudinary.uploader.upload(file.content, {
      folder, 
    });

  const url =  cloudinary.url(result?.public_id, {
    transformation: [
      {
        quality: "auto",
        fetch_format: "auto",
      },
      {
        width: 500,
        height: 500,
        crop: "fill",
        gravity: "auto",
      },
      
    ],
   

  });


    await Prisma.userMedia.create({
    data: {
    type,
    photoType,
    url,
    publicId: result?.public_id,
    },
  });
    return url;


}
