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



  const matchedCategory = getValidCategory(args.category || "");

      const filters: prisma.PropertyWhereInput = {
          archived: false,
          status: "APPROVED",
          salesStatus: "SELLING",



      ...(matchedCategory && {
        category: matchedCategory,
      }),


      ...(args.bedrooms && {
        bedrooms: { gte: args.bedrooms },
      }),

      ...(args.bathrooms && {
        bathrooms: { gte: args.bathrooms },
      }),

   
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

     
      ...(args.query && {
        OR: [
          { title: { contains: args.query, mode: "insensitive" } },
          { description: { contains: args.query, mode: "insensitive" } },
          { neighborhood: { contains: args.query, mode: "insensitive" } },
        ],
      }),

   
      ...(args.features?.length && {
        features: {
          hasSome: args.features, 
        },
      }),

    
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


          ...(args.city && { 
            OR: [
              { title: iLike(args.city) },
              { city: iLike(args.city) },
              { state: iLike(args.city) },
              { country: iLike(args.city) },
              { neighborhood: iLike(args.city) },
              { description: iLike(args.city) },
            ].filter(Boolean)
          
          }),
     
          ...(args.state && { 
            OR: [
              { title: iLike(args.state) },
              { city: iLike(args.state) },
              { state: iLike(args.state) },
              { country: iLike(args.state) },
              { neighborhood: iLike(args.state) },
              { description: iLike(args.state) },
            ].filter(Boolean)
          
          }),

          ...(args.neighborhood && { 
            OR: [
              { title: iLike(args.neighborhood) },
              { city: iLike(args.neighborhood) },
              { state: iLike(args.neighborhood) },
              { country: iLike(args.neighborhood) },
              { neighborhood: iLike(args.neighborhood) },
              { description: iLike(args.neighborhood) },
            ].filter(Boolean)
          
          }),

          ...(args.country && { 
            OR: [
              { title: iLike(args.country) },
              { city: iLike(args.country) },
              { state: iLike(args.country) },
              { country: iLike(args.country) },
              { neighborhood: iLike(args.country) },
              { description: iLike(args.country) },
            ].filter(Boolean)
          
          }),


  
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