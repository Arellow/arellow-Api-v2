// import { PropertyCategory } from "../../../../generated/prisma/enums";

// import { Pinecone } from "@pinecone-database/pinecone";
// import OpenAI from "openai";
import { Prisma } from "../../../lib/prisma";
import { Prisma as prisma, PropertyCategory, } from "../../../../generated/prisma/client";

// const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

// export const pinecone = new Pinecone({
//   apiKey: process.env.PINECONE_API_KEY!,
// });



// export const pincodeIndex = pinecone.index({name: "properties"});

const iLike = (field?: string) =>
  field ? { contains: field, mode: "insensitive" } : undefined;





// export async function indexProperty(property: any) {
//   const text = `
//   ${property.title}
//   ${property.description}
//   ${property.city}
//   ${property.state}
//   ${property.neighborhood}
//   Features: ${property.features?.join(", ")}
//   Amenities: ${property.amenities?.map((a: any) => a.name).join(", ")}
//   `;

//   const embedding = await openai.embeddings.create({
//     model: "text-embedding-3-small",
//     input: text,
//   });



// await pincodeIndex.upsert({
//     namespace: "properties",
//   records: [
//     {
//       id: property.id,
//       values: embedding.data[0].embedding,
//       metadata: {
//         city: property.city as string,
//         price: property.price?.amount as number,
//       },
//     },
//   ],
// });

// }


// export async function searchProperties(args: any) {
//   return Prisma.property.findMany({
//     where: {
//       status: "APPROVED",
//       archived: false,
//       city: iLike(args.city),
//       state: iLike(args.state),
//       bedrooms: args.bedrooms || undefined,
//       bathrooms: args.bathrooms || undefined,
//       price: args.minPrice || args.maxPrice
//         ? {
//             is: {
//               amount: {
//                 ...(args.minPrice && { gte: args.minPrice }),
//                 ...(args.maxPrice && { lte: args.maxPrice }),
//               },
//             },
//           }
//         : undefined,
//     },
//     take: 5,
//     include: { media: true },
//   });
// }




// export async function semanticSearch(query: string) {
//   const embedding = await openai.embeddings.create({
//     model: "text-embedding-3-small",
//     input: query,
//   });

//   const result = await pincodeIndex.query({
//     vector: embedding.data[0].embedding,
//     topK: 5,
//     includeMetadata: true,
//   });

//   const ids = result.matches.map((m: any) => m.id);

//   return Prisma.property.findMany({
//     where: { id: { in: ids } },
//     include: { media: true },
//   });
// }


// export async function executeTool(name: string, args: any) {
//   if (name === "search_properties") {
//     return await searchProperties(args);
//   }

//   if (name === "semantic_property_search") {
//     return await semanticSearch(args.query);
//   }
// }



// export const tools = [
//   {
//     type: "function",
//     function: {
//       name: "search_properties",
//       description: "Search properties using filters",
//       parameters: {
//         type: "object",
//         properties: {
//           city: { type: "string" },
//           state: { type: "string" },
//           minPrice: { type: "number" },
//           maxPrice: { type: "number" },
//           bedrooms: { type: "number" },
//           bathrooms: { type: "number" },
//           category: { type: "string" },
//         },
//       },
//     },
//   },
//   {
//     type: "function",
//     function: {
//       name: "semantic_property_search",
//       description: "Search properties using natural language",
//       parameters: {
//         type: "object",
//         properties: {
//           query: { type: "string" },
//         },
//         required: ["query"],
//       },
//     },
//   },
// ];




// const tools = [
//   {
//     type: "function",
//     function: {
//       name: "search_properties",
//       description: "Structured property search",
//         parameters: {
//         type: "object",
//         properties: {
//           city: { type: "string" },
//           state: { type: "string" },
//           minPrice: { type: "number" },
//           maxPrice: { type: "number" },
//           bedrooms: { type: "number" },
//           bathrooms: { type: "number" },
//           category: { type: "string" },
//         },
//       },
//     },
//   },
//   {
//     type: "function",
//     function: {
//       name: "semantic_property_search",
//       description: "Search properties based on meaning and lifestyle preferences",
//       parameters: {
//         type: "object",
//         properties: {
//           query: { type: "string" },
//         },
//         required: ["query"],
//       },
//     },
//   },
// ];



// function getValidCategory(value: string): PropertyCategory | null {
//   if (!value) return null
//   const lowerValue = value.toLowerCase();
//   return (
//     Object.values(PropertyCategory).find(
//       (category) => category.toLowerCase().includes(lowerValue)
//     ) ?? null
//   );
// }




// new


export async function semanticSearch(query: string) {
  // const embedding = await openai.embeddings.create({
  //   model: "text-embedding-3-small",
  //   input: query,
  // });

  // const result = await pincodeIndex.query({
  //   vector: embedding.data[0].embedding,
  //   topK: 5,
  //   includeMetadata: true,
  // });

  // const ids = result.matches.map((m: any) => m.id);

  // const properties = await Prisma.property.findMany({
  //   where: { id: { in: ids } },
  //   include: { media: true },
  // });


  // return ids
  //   .map((id) => properties.find((p) => p.id === id))
  //   .filter(Boolean);



  const matchedCategory = getValidCategory(query);

      const filters: prisma.PropertyWhereInput = {
          archived: false,
          status: "APPROVED",
          salesStatus: "SELLING",
          AND: [

           {
            OR: [
              { title: iLike(query) },
              matchedCategory ? { category: matchedCategory } : null,
              { city: iLike(query) },
              { state: iLike(query) },
              { country: iLike(query) }
            ].filter(Boolean)
          },
           
          ].filter(Boolean) as prisma.PropertyWhereInput[]
        };




  return Prisma.property.findMany({
    where:filters,
    take: 5,
    include: { media: true },
  });



}



export async function searchProperties(args: any) {



  // const matchedCategory = getValidCategory(args.city);

      const filters: prisma.PropertyWhereInput = {
          archived: false,
          status: "APPROVED",
          salesStatus: "SELLING",



 ...(args.city && {
        city: { contains: args.city, mode: "insensitive" },
      }),

      ...(args.state && {
        state: { contains: args.state, mode: "insensitive" },
      }),

      ...(args.neighborhood && {
        neighborhood: { contains: args.neighborhood, mode: "insensitive" },
      }),

      // 🏠 PROPERTY TYPE
      ...(args.category && {
        category: args.category,
      }),

      // 🛏️ ROOMS (flexible match)
      ...(args.bedrooms && {
        bedrooms: { gte: args.bedrooms },
      }),

      ...(args.bathrooms && {
        bathrooms: { gte: args.bathrooms },
      }),

      // 💰 PRICE RANGE
      ...(args.minPrice || args.maxPrice
        ? {
            price: {
              is: {
                amount: {
                  ...(args.minPrice && { gte: args.minPrice }),
                  ...(args.maxPrice && { lte: args.maxPrice }),
                },
              },
            },
          }
        : {}),

      // 🔍 TEXT SEARCH (VERY IMPORTANT)
      ...(args.query && {
        OR: [
          { title: { contains: args.query, mode: "insensitive" } },
          { description: { contains: args.query, mode: "insensitive" } },
          { neighborhood: { contains: args.query, mode: "insensitive" } },
        ],
      }),

      // 🧩 FEATURES ARRAY
      ...(args.features?.length && {
        features: {
          hasSome: args.features, // matches any
        },
      }),

      // 🧱 AMENITIES RELATION
      ...(args.amenities?.length && {
        amenities: {
          some: {
            name: {
              in: args.amenities,
              mode: "insensitive",
            },
          },
        },
      }),





// old

          // AND: [

          //  {
          //   OR: [
          //     { title: iLike(args.city) },
          //     matchedCategory ? { category: matchedCategory } : null,
          //     { city: iLike(args.city) },
          //     { state: iLike(args.city) },
          //     { country: iLike(args.city) }
          //   ].filter(Boolean)
          // },


  //           title        String
  // description  String
  // category     PropertyCategory
  // features     String[]
  // amenities    Amenity[]
  // country      String
  // state        String
  // city         String
  // neighborhood String
  // location     GeoPoint

  // bedrooms     Int
  // bathrooms    Int
  // squareMeters String



      //     ...(args.city && {
      //   city: { contains: args.city, mode: "insensitive" },
      // }),

      // ...(args.state && {
      //   state: { contains: args.state, mode: "insensitive" },
      // }),

      // ...(args.bedrooms && {
      //   bedrooms: { gte: args.bedrooms }, 
      // }),

      // ...(args.bathrooms && {
      //   bathrooms: { gte: args.bathrooms },
      // }),

      //    (args.minPrice || args.maxPrice)
      //         ? {
    
      //           price: {
      //             is: {
      //               amount: {
      //                 ...(args.minPrice ? { gte: parseFloat(args.minPrice as string) } : {}),
      //                 ...(args.maxPrice ? { lte: parseFloat(args.maxPrice as string) } : {})
      //               }
      //             }
    
      //           }
      //         }
      //         : undefined,

      // ...(args.minPrice || args.maxPrice
      //   ? {
      //       price: {
      //         is: {
      //           amount: {
      //             ...(args.minPrice && { gte: args.minPrice }),
      //             ...(args.maxPrice && { lte: args.maxPrice }),
      //           },
      //         },
      //       },
      //     }
      //   : {})




           
            // args.bathrooms ? { bathrooms: parseInt(args.bathrooms as string) } : undefined,
            // args.bedrooms ? { bedrooms: parseInt(args.bedrooms as string) } : undefined,
            // args.floors ? { floors: parseInt(args.floors as string) } : undefined,
            // // args.category ? { category: args.category as PropertyCategory } : undefined,
    
            // args.state ? { state: iLike(args.state as string) } : undefined,
            // args.city ? { city: iLike(args.city as string) } : undefined,
            // args.country ? { country: iLike(args.country as string) } : undefined,
            // args.neighborhood ? { neighborhood: iLike(args.neighborhood as string) } : undefined,
    
            // // args.amenitiesArray.length > 0 ? { amenities: { some: { name: { in: amenitiesArray } } } } : undefined,
            // // args.featuresArray.length > 0 ? { features: { hasSome: featuresArray } } : undefined,
           
            // (args.minPrice || args.maxPrice)
            //   ? {
    
            //     price: {
            //       is: {
            //         amount: {
            //           ...(args.minPrice ? { gte: parseFloat(args.minPrice as string) } : {}),
            //           ...(args.maxPrice ? { lte: parseFloat(args.maxPrice as string) } : {})
            //         }
            //       }
    
            //     }
            //   }
            //   : undefined,
          // ].filter(Boolean) as prisma.PropertyWhereInput[]
        };



    const property = await Prisma.property.findMany({
    where:filters,
    take: 5,
    include: { media: true },
    orderBy: [
  { isFeatureProperty: "desc" },
  { viewsCount: "desc" },
  { createdAt: "desc" },
]
  });

  console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
  console.log({args})
  console.log({property})
  console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")

  return  property;
}




export async function executeTool(name: string, args: any) {
  if (name === "search_properties") {
    return await searchProperties(args);
  }

  if (name === "semantic_property_search") {
    return await semanticSearch(args.query);
  }

  return [];
}



// export async function indexProperty(property: any) {
//   const text = `
// Title: ${property.title}
// Description: ${property.description}
// Location: ${property.city}, ${property.state}, ${property.neighborhood}
// Price: ${property.price?.amount}
// Bedrooms: ${property.bedrooms}
// Bathrooms: ${property.bathrooms}

// Features: ${property.features?.join(", ")}
// Amenities: ${property.amenities?.map((a: any) => a.name).join(", ")}
// `;

//   const embedding = await openai.embeddings.create({
//     model: "text-embedding-3-small",
//     input: text,
//   });

//   await pincodeIndex.upsert({
//     namespace: "properties",
//     records: [
//       {
//         id: property.id,
//         values: embedding.data[0].embedding,
//         metadata: {
//           city: property.city,
//           price: property.price?.amount,
//         },
//       },
//     ],
//   });
// }





function getValidCategory(value: string): PropertyCategory | null {
  if (!value) return null
  const lowerValue = value.toLowerCase();
  return (
    Object.values(PropertyCategory).find(
      (category) => category.toLowerCase().includes(lowerValue)
    ) ?? null
  );
}