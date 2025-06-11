import multer from "multer";
import DataUriParser from "datauri/parser.js";
import path from "path";

const storage = multer.memoryStorage();

export const singleupload = multer({storage}).single("file");
// export const multipleupload = multer({storage}).fields([
//     {name: "outside_view_images"},
//     {name: "living_room_images"},
//     {name: "kitchen_room_images"},
//     {name: "floor_plan_images"},
//     {name: "virtual_tour_images"},
//     {name: "other_images"},
//     {name: "banner", maxCount: 1},
//     {name: "youTube_thumbnail", maxCount: 1},
//     {name: "avatar", maxCount: 1}
// ]);


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

interface FileData {
  originalname: string;
  buffer: Buffer;
}

export const getDataUri = (file: FileData): { content: string } => {
  const parser = new DataUriParser();
  const extName = path.extname(file.originalname).toString();
  const result = parser.format(extName, file.buffer);
  
  if (!result.content) {
    throw new Error('Failed to generate data URI');
  }
  
  return { content: result.content };
}



