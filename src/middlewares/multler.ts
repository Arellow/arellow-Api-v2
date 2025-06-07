import multer from "multer";
import  DataUriParser from "datauri/parser.js";
import path from "path";

const storage = multer.memoryStorage();

export const singleupload = multer({storage}).single("file");

export const multipleupload = multer({ storage }).fields([
  { name: "outside_view_images",  },  
  { name: "living_room_images", },   
  { name: "kitchen_room_images",  }, 
  { name: "primary_room_images",  },  
  { name: "floor_plan_images",},     
  { name: "tour_3d_images", },    
  { name: "other_images", },          
  { name: "banner",  },              
  { name: "youTube_thumbnail", }   
]);


export const getDataUri = (file:any ) => {
    const parser = new DataUriParser();
    const extName = path.extname(file.originalname).toString()

    return parser.format(extName, file.buffer);
}



