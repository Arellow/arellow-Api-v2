
import { getDataUri } from '../middlewares/multer';
import { cloudinary } from '../configs/cloudinary';
import { Prisma } from '../lib/prisma';
import { MediaType, UserPhotoType } from '../../generated/prisma/enums';



type TprocessImage = {
    images: [],
    folder:  string
    photoType:  UserPhotoType

}


export async function processImages({images = [],folder , photoType }: TprocessImage) {

  const pLimit = (await import('p-limit')).default;
  
const limit = pLimit(3);

const imagesToUpload =  images.map(image => {
  const file = getDataUri(image);
  return limit(async () => {
        const result = await cloudinary.uploader.upload(file.content, {
      folder, 
    });

  // const url =  cloudinary.url(result?.public_id, {
  //   transformation: [
  //     {
  //       quality: "auto",
  //       fetch_format: "auto",
  //     },
  //     {
  //       width: 500,
  //       height: 500,
  //       crop: "fill",
  //       gravity: "auto",
  //     },
      
  //   ],
   

  // });

  await Prisma.userMedia.create({
    data: {
    //   photoUrl: url,
    //   public_id: result?.public_id,
    type : "PHOTO",
    photoType,
    url: result.secure_url,
    publicId: result?.public_id,

    },
  });


  return result.secure_url;

  })
});


const photoUrls = await Promise.all(imagesToUpload)

  return photoUrls;
}

export const deleteImage = async(photoUrl: string) => {

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

  // const url =  cloudinary.url(result?.public_id, {
  //   transformation: [
  //     {
  //       quality: "auto",
  //       fetch_format: "auto",
  //     },
  //     {
  //       width: 500,
  //       height: 500,
  //       crop: "fill",
  //       gravity: "auto",
  //     },
      
  //   ],
   

  // });


    await Prisma.userMedia.create({
    data: {
    type,
    photoType,
    url: result.secure_url,
    publicId: result?.public_id,
    },
  });
    return result.secure_url;


}
