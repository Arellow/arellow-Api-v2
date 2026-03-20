import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import http from 'http';
import { Prisma } from '../../../lib/prisma';
import OpenAI from 'openai';
import { executeTool } from '../controller/aitools';
import { PropertyCategory } from '../../../../generated/prisma/enums';
// import { PropertyCategory } from '../../../../generated/prisma/enums';
// import {  Prisma as prisma, } from '../../../../generated/prisma/client';
// import { } from '../controller/aitools';


interface AuthSocket extends Socket {
  user?: { userId: string };
  aiuser?: { userId: string };
  convos?: string[]; // Cached convos
  participantIds?: string[];
}

let io: Server;


const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY
});




// const tools = [
//   {
//     type: "function",
//     function: {
//       name: "search_properties",
//       description: "Search for real estate properties",
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
// ];


export const initSocketIO = (httpServer: http.Server) => {
  io = new Server<AuthSocket>(httpServer, { cors: { origin: '*' } });

  io.use(async (socket: AuthSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      // const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string, email: string };
      const userId = decoded.userId;
      socket.user = { userId };

      await Prisma.user.update({
        where: { id: userId },
        data: { online: true, lastSeen: null },
      });



      const convos = await Prisma.conversation.findMany({
        where: { userIds: { has: userId } },
        select: {
          id: true,
          userIds: true,
        },
      });

      // Join private room for direct events
      socket.join(`user_${userId}`);

      const allParticipantIds = new Set<string>();
      convos.forEach((conv) => {
        conv.userIds.forEach((uid) => {
          if (uid !== userId) allParticipantIds.add(uid);
        });
      });

      // Cache for later
      socket.convos = convos.map((c) => c.id);
      socket.participantIds = Array.from(allParticipantIds);
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {

    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);

    });



    socket.on('typingStart', (conversationId) => {
      socket.to(conversationId).emit('userTyping', { userId: socket.user!.userId, typing: true });
    });

    socket.on('typingStop', (conversationId) => {
      socket.to(conversationId).emit('userTyping', { userId: socket.user!.userId, typing: false });
    });


    socket.on('sendMessage', async (data, callback) => {
      const { conversationId, type, content, propertyId, videoCallDetails } = data;
      const senderId = socket.user!.userId;

      const requiresContent = type === 'TEXT' || type === 'PHOTO' || type === 'AUDIO' || type === 'VIDEO' || type === 'FILE';
      if (requiresContent && !content) {

        if (callback) callback({ error: 'Content required for this type' });
        return;
      }

      if ((type === 'PROPERTY_SHARE' && !propertyId) || (type === 'VIDEO_CALL_SCHEDULE' && !videoCallDetails)) {

        if (callback) callback({ error: 'Details required for this type' });
        return;
      }



      try {
        const message = await Prisma.message.create({
          data: {
            conversationId,
            senderId,
            type,
            content: type === 'TEXT' ? content : undefined,
            propertyId: type === 'PROPERTY_SHARE' ? propertyId : null,
            videoCallDetails: type === 'VIDEO_CALL_SCHEDULE' ? videoCallDetails : null,
            readByIds: [senderId],
          },
          select: {
            id: true,
            content: true,
            type: true,
            conversationId: true,
            senderId: true,
            propertyId: true,
            videoCallDetails: true,
            readByIds: true,
            createdAt: true,
            updatedAt: true,
            sender: {
              select: {
                id: true,
                fullname: true,
                avatar: true
              }
            },
            property: {
              select: {
                title: true,
                price: true,
                state: true,
                country: true,
                bathrooms: true,
                bedrooms: true,
                squareMeters: true,
                neighborhood: true,
                city: true,
                media: {
                  select: {
                    url: true,
                    altText: true,
                    type: true,
                    photoType: true,
                    sizeInKB: true

                  }
                }
              }

            }
          },
        });


        await Prisma.conversation.update({
          where: { id: conversationId },
          data: { lastMessage: message.id, updatedAt: new Date() },
        });

        // Parse for broadcast
        const broadcastMessage = {
          ...message,
          videoCallDetails: message.videoCallDetails && typeof message.videoCallDetails === 'string'
            ? JSON.parse(message.videoCallDetails)
            : message.videoCallDetails,
        };

        socket.to(conversationId).emit('newMessage', broadcastMessage);
        // console.log('📨 Received broadcastMessage:', { ...broadcastMessage });
        // Notify lists
        const conversation = await Prisma.conversation.findUnique({
          where: { id: conversationId },
          select: { userIds: true },
        });
        conversation?.userIds.forEach((pId) => {
          if (pId !== senderId) {
            io.to(`user_${pId}`).emit('conversationUpdated', { conversationId });
          }
        });

        socket.emit('messageSent', { id: message.id });
        if (callback) callback({ success: true });
      } catch (error: any) {
        console.error('💥 SendMessage Error:', error);
        socket.emit('error', { message: 'Failed to send message' });
        if (callback) callback({ error: error?.message });
      }
    });

    socket.on('markAsRead', async ({ messageId, conversationId }) => {
      const userId = socket.user!.userId;
      await Prisma.message.updateMany({
        where: {
          id: messageId,
          NOT: { readByIds: { has: userId } }
        },
        data: { readByIds: { push: userId } },
      });
      socket.to(conversationId).emit('messageRead', { messageId, userId });
      io.to(`user_${userId}`).emit('conversationUpdated', { conversationId });
    });

    socket.join(`user_${socket.user!.userId}`);


    socket.on('joinAiConversation', (userId, callback) => {

      if (!userId) {
        if (callback) callback({ error: 'User ID is required to join conversation' });
        return;
      }

      socket.join(userId);
      socket.aiuser = { userId }

      if (callback) callback({ success: true });


      socket.to(userId).emit('AiConversation', { joined: true });

    });


//     socket.on("sendAiMessage", async (data, callback) => {



//       if (!data.content || !socket.aiuser?.userId) {
//         if (callback) callback({ error: 'Content required for this type' });
//         return;
//       }

//       try {



//         io.to(socket.aiuser?.userId!).emit('aiTyping', { typing: true });


//         const previousMessages = await Prisma.aiMessage.findMany({
//           where: {
//             userId: socket.user?.userId!,
//             NOT: {
//               content: null,
//             },
//           },
//           orderBy: {
//             createdAt: 'desc',
//           },
//           take: 5,
//         });

//         const orderedMessages = previousMessages.reverse();


//         const historyMessages = orderedMessages.map((msg: any) => ({
//           role: msg.senderId === socket.user?.userId! ? 'user' as const : 'assistant' as const,
//           content: msg.content,
//         }));

// // old ai querty
//         const extractionPrompt = `User said: "${data.content}"\n\nExtract relevant info as JSON like before.`;

//         const extractResponse = await openai.chat.completions.create({
//           model: 'gpt-5-nano',
//           messages: [
//             {
//               role: 'system',
//               content: 
              
              
//               `
// You are a helpful real estate assistant for Arellow.
// Always respond professionally and briefly.
// You have access to property search filters and user context.



// Return a JSON object with fields: with type 

// {
//   content: string;
//   ispropertyRequest: boolean;
//   photos: string[],
//   links: string[],
//   property: {
//     city: string, minPrice: number, maxPrice:number, bedrooms:number, bathrooms: number, category: string,
//      features: string[],
//      amenities: string[],
//      floors: number,
//      state: string,
//      country: string,
//      neighborhood: string,
//   };
// }

// if property is requested set ispropertyRequest to true or vice versa
// content is your response

// If ispropertyRequest is true Extract property search filters from this user message to property else 
//    If a field is not specified, set it to null.
// `,


//             },
//             ...historyMessages,
//             { role: 'user', content: extractionPrompt }
//           ],
//         });


//         await Prisma.aiMessage.create({
//           data: { userId: socket.user?.userId!, content: data.content, senderId: socket.user?.userId!, isAi: false }
//         })


//         const extractedText = extractResponse.choices[0].message.content;
//         const filterItems = JSON.parse(extractedText!);

//         const featuresArray = filterItems?.property?.features ?? [];
//         const amenitiesArray = filterItems?.property?.amenities ?? [];

//         const matchedCategory = getValidCategory(filterItems?.property?.category);


//         const filters: prisma.PropertyWhereInput = {
//           archived: false,
//           status: "APPROVED",
//           AND: [
//             filterItems?.property?.bathrooms ? { bathrooms: parseInt(filterItems?.property?.bathrooms as string) } : undefined,
//             filterItems?.property?.bedrooms ? { bedrooms: parseInt(filterItems?.property.bedrooms as string) } : undefined,
//             filterItems?.property?.floors ? { floors: parseInt(filterItems?.property?.floors as string) } : undefined,
//             matchedCategory ? { category: matchedCategory } : null,

//             filterItems?.property?.state ? { state: iLike(filterItems?.property?.state as string) } : undefined,
//             filterItems?.property?.city ? { city: iLike(filterItems?.property?.city as string) } : undefined,
//             filterItems?.property?.country ? { country: iLike(filterItems?.property?.country as string) } : undefined,
//             filterItems?.property?.neighborhood ? { neighborhood: iLike(filterItems?.property?.neighborhood as string) } : undefined,

//             amenitiesArray.length > 0 ? { amenities: { some: { name: { in: amenitiesArray } } } } : undefined,
//             featuresArray.length > 0 ? { features: { hasSome: featuresArray } } : undefined,

//             (filterItems?.property?.minPrice || filterItems?.property?.maxPrice)
//               ? {

//                 price: {
//                   is: {
//                     amount: {
//                       ...(filterItems?.property?.minPrice ? { gte: parseFloat(filterItems?.property?.minPrice as string) } : {}),
//                       ...(filterItems?.property?.maxPrice ? { lte: parseFloat(filterItems?.property?.maxPrice as string) } : {})
//                     }
//                   }

//                 }
//               }
//               : undefined,
//           ].filter(Boolean) as prisma.PropertyWhereInput[]
//         };


//         const properties = await Prisma.property.findMany({
//           where: filters,
//           select: {
//             id: true,
//             title: true,
//             price: true,
//             state: true,
//             country: true,
//             bathrooms: true,
//             bedrooms: true,
//             squareMeters: true,
//             neighborhood: true,
//             city: true,
//             media: {
//               select: {
//                 url: true,
//                 altText: true,
//                 type: true,
//                 photoType: true,
//                 sizeInKB: true

//               }
//             }
//           },
//           take: 5

//         })


//         io.to(socket.aiuser?.userId!).emit('aiTyping', { typing: false });



//         if (!filterItems?.ispropertyRequest && properties.length !== 0) {

//           const tempId1 = `temp_${Date.now()}_${Math.random() * 1000}`;

//           const optimisticMessage = {
//             id: tempId1,
//             content: filterItems.content,
//             senderId: "ai",
//             createdAt: new Date().toISOString(),
//           };

//           await Prisma.aiMessage.create({
//             data: { userId: socket.user?.userId!, content: filterItems.content, senderId: "ai", isAi: true }
//           })


//           io.to(socket.aiuser?.userId!).emit('newAiMessage', optimisticMessage);

//         }



//         const tempId12 = `temp_${Date.now()}_${Math.random() * 8000}`;

//         const optimisticMessage2 = {
//           id: tempId12,
//           senderId: "ai",
//           content: filterItems?.ispropertyRequest && properties.length === 0 ? "Sorry no match found " : null,
//           createdAt: new Date().toISOString(),
//           properties: filterItems?.ispropertyRequest ? properties : null


//         };

//         if (filterItems?.ispropertyRequest) {

//           await Prisma.aiMessage.create({
//             data: {
//               content: filterItems?.ispropertyRequest && properties.length === 0 ? "Sorry no match found " : null,
//               userId: socket.user?.userId!,
//               senderId: "ai",
//               isAi: true,
//               properties: {
//                 create: (filterItems?.ispropertyRequest && properties.length > 0)
//                   ? properties.map((prop) => ({
//                     property: {
//                       connect: {
//                         id: prop.id,
//                       },
//                     },
//                   }))
//                   : [],
//               },
//             },
//           });


//           io.to(socket.aiuser?.userId!).emit('newAiMessage', optimisticMessage2);
//         }

//       } catch (error: any) {
//         socket.emit('error', { message: 'Failed to send message' });
//         if (callback) callback({ error: error?.message });
//       }

//     })


// socket.on("sendAiMessage", async (data, callback) => {
//   const userId = socket.user?.userId!;
//   if (!data.content || !userId) {
//     if (callback) callback({ error: "Content required" });
//     return;
//   }

//   try {
//     // 1️⃣ Send typing indicator
//     io.to(userId).emit("aiTyping", { typing: true });

//     // 2️⃣ Fetch recent messages for context
//     const previousMessages = await Prisma.aiMessage.findMany({
//       where: { userId, NOT: { content: null } },
//       orderBy: { createdAt: "desc" },
//       take: 5,
//     });


//     const contextMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
//   previousMessages
//     .reverse()
//     .filter((msg) => msg.content !== null) // ✅ remove nulls
//     .map((msg) => {
//       if (msg.senderId === userId) {
//         return {
//           role: "user" as const,
//           content: msg.content!,
//         };
//       } else {
//         return {
//           role: "assistant" as const,
//           content: msg.content!,
//         };
//       }
//     });





//     // 3️⃣ Streaming LLM with tool/RAG instructions
//     const systemPrompt = `
// You are a real estate copilot assistant for Arellow.
// - Always respond professionally and concisely.
// - Detect if user wants property search (isPropertyRequest) or general advice.
// - For property searches, output JSON with filters and relevant properties.
// - Include {content, isPropertyRequest, properties[]} fields.
// - If uncertain, return content with isPropertyRequest=false.
// `;


//  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
//   {
//     role: "system",
//     content: systemPrompt,
//   },
//   ...contextMessages,
//   {
//     role: "user",
//     content: data.content,
//   },
// ];

// // Stream call with correct typing
// const stream = await openai.chat.completions.create({
//   model: "gpt-4o-mini",
//   messages: messages,  // ✅ typed correctly
//   stream: true,
// });



//     let aiOutput = "";

//     for await (const chunk of stream) {
//   const content = chunk.choices?.[0]?.delta?.content;

//   if (content) {
//     aiOutput += content;

//     io.to(userId).emit("aiStream", {
//       chunk: content,
//     });
//   }
// }

//     // 4️⃣ Parse AI output for property request
//     let parsed: {
//       isPropertyRequest: boolean;
//       filters?: any;
//       properties?: any[];
//       content?: string;
//     } = { isPropertyRequest: false, content: aiOutput };

//     try {
//       parsed = JSON.parse(aiOutput);
//     } catch {
//       // fallback if AI doesn't output valid JSON
//       parsed.content = aiOutput;
//     }

//     let propertyResults: any[] = [];

//     // 5️⃣ If property request, run RAG/structured search
//     if (parsed.isPropertyRequest) {
//       if (parsed.filters?.textQuery) {
//         // RAG vector search
//         propertyResults = await semanticSearch(parsed.filters.textQuery);
//       } else {
//         // Structured filter search
//         propertyResults = await searchProperties(parsed.filters);
//       }

//       // Stream properties to client as they arrive
//       for (const prop of propertyResults) {
//         io.to(userId).emit("aiStreamProperties", prop);
//       }

//       parsed.properties = propertyResults;
//     }

//     // 6️⃣ Save AI message to DB
//     await Prisma.aiMessage.create({
//       data: {
//         userId,
//         senderId: "ai",
//         isAi: true,
//         content: parsed.content,
//         properties:
//           propertyResults.length > 0
//             ? {
//                 create: propertyResults.map((prop) => ({
//                   property: { connect: { id: prop.id } },
//                 })),
//               }
//             : undefined,
//       },
//     });

//     io.to(userId).emit("aiTyping", { typing: false });

//     if (callback) callback({ success: true });
//   } catch (error: any) {
//     console.error("AI Copilot Error:", error);
//     io.to(userId).emit("aiTyping", { typing: false });
//     if (callback) callback({ error: error.message });
//   }
// });



socket.on("sendAiMessage", async (data, callback) => {
  const userId = socket.user?.userId!;
  if (!data.content || !userId) {
    if (callback) callback({ error: "Content required" });
    return;
  }

  try {
    io.to(userId).emit("aiTyping", { typing: true });


            await Prisma.aiMessage.create({
          data: { userId, content: data.content, senderId: userId, isAi: false }
        })


    const previousMessages = await Prisma.aiMessage.findMany({
      where: { userId, NOT: { content: null } },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    const contextMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      previousMessages
        .reverse()
        .filter((msg) => msg.content)
        .map((msg) =>
          msg.senderId === userId
            ? { role: "user", content: msg.content! }
            : { role: "assistant", content: msg.content! }
        );

    const baseMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `
You are a smart real estate copilot for Arellow a real company that sell property and lands 
website: arellow.com
.

- Help users find properties or answer questions
- Use tools when needed
- Be concise and helpful
- If properties are returned, summarize them naturally


   Always respond in Markdown format only.

   Rules:
   - Use headings like # for titles.
   - Use **bold** and _italic_ for emphasis.
   - Use bullet lists for multiple items.
   - Use links in Markdown format: [text](url)
   - If providing code, wrap in \`\`\` blocks.
   - If you include property details, format them in Markdown lists or tables.

   Do NOT include HTML tags in your response.

   Answer the user’s question clearly and concisely in Markdown.



When users ask about properties:

- ALWAYS call the "search_properties" tool
- Extract as many filters as possible
- Use "query" for descriptive terms like:
  "cheap", "luxury", "modern", "family home"
- Use arrays for:
  amenities and features

Do NOT answer without calling the tool if the user is searching for property.


        `,
      },
      ...contextMessages,
      {
        role: "user",
        content: data.content,
      },
    ];

const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function" as const,
    function: {
      name: "search_properties",
      description: `
Search real estate properties using structured filters and flexible keyword matching.
Use this for most user requests.
      `,
      parameters: {
        type: "object",
        properties: {
          // 🔍 GENERAL SEARCH
          query: {
            type: "string",
            description: "Free text search (e.g. 'luxury apartment with pool')",
          },

          // 🌍 LOCATION
          country: { type: "string" },
          state: { type: "string" },
          city: { type: "string" },
          neighborhood: { type: "string" },

          // 🏠 PROPERTY DETAILS
          // category: {
          //   type: "string",
          //   description: "Property type (e.g. Apartment, Duplex, Bungalow)",
          // },

          category: {
  type: "string",
  enum: [...Object.values(PropertyCategory)]
},

          bedrooms: {
            type: "number",
            description: "Minimum number of bedrooms",
          },

          bathrooms: {
            type: "number",
            description: "Minimum number of bathrooms",
          },

          // 💰 PRICE
          minPrice: {
            type: "number",
            description: "Minimum price",
          },

          maxPrice: {
            type: "number",
            description: "Maximum price",
          },

          // 🧩 FEATURES (array)
          features: {
            type: "array",
            items: { type: "string" },
            description: "Property features (e.g. 'Garden', 'Parking')",
          },

          // 🧱 AMENITIES (array)
          amenities: {
            type: "array",
            items: { type: "string" },
            description: "Amenities like Pool, Gym, Security",
          },
        },
      },
    },
  },
];


// const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
//   {
//     type: "function",
//     function: {
//       name: "search_properties",
//       description: "Structured property search",
//       parameters: {
//         type: "object",
//         properties: {
//           query: { type: "string" },
          
//           country: { type: "string" },
//           city: { type: "string" },
//           state: { type: "string" },
//           minPrice: { type: "number" },
//           maxPrice: { type: "number" },
//           bedrooms: { type: "number" },
//           bathrooms: { type: "number" },
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
// ]

   
    const decision = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: baseMessages,
      tools,
      tool_choice: "auto",
    });

    const message = decision.choices[0].message;

    let propertyResults: any[] = [];




            if (message.tool_calls?.length) {
  const toolCall = message.tool_calls[0];

  if (isFunctionToolCall(toolCall)) {
    const args = JSON.parse(toolCall.function.arguments);

    propertyResults = await executeTool(
      toolCall.function.name,
      args
    );

    // io.to(userId).emit("aiStreamProperties", propertyResults);
  }
}


    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        ...baseMessages,
        message,
        ...(message.tool_calls?.length
          ? [
              {
                role: "tool",
                tool_call_id: message.tool_calls[0].id,
                content: JSON.stringify(propertyResults),
              } as any,
            ]
          : []),
      ],
    });

    let aiOutput = "";
    

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;

      if (content) {
        aiOutput += content;

        io.to(userId).emit("aiStream", {
          chunk: content,
        });
      }
    }

    if(aiOutput !== ""){
      io.to(userId).emit("aiStream", {
          chunk: aiOutput,
        });
    }



            if (propertyResults?.length > 0) {
              io.to(userId).emit("aiStreamProperties", propertyResults)
            }




    // 💾 6. Save to DB
    await Prisma.aiMessage.create({
      data: {
        userId,
        senderId: "ai",
        isAi: true,
        content: aiOutput,
        properties:
          propertyResults.length > 0
            ? {
                create: propertyResults.map((prop) => ({
                  property: { connect: { id: prop.id } },
                })),
              }
            : undefined,
      },
    });

    io.to(userId).emit("aiTyping", { typing: false });

    if (callback) callback({ success: true });
  } catch (error: any) {
    console.error("AI Copilot Error:", error);
    io.to(userId).emit("aiTyping", { typing: false });
    if (callback) callback({ error: error.message });
  }
});



    socket.on('connectedToPresence', () => {
      socket.participantIds?.forEach((pid) => {
        io.to(`user_${pid}`).emit('userOnline', {
          userId: socket.user?.userId,
          online: true,
        });
      });
    });





    socket.on('disconnect', async () => {

      const userId = socket.user?.userId;
      // const convos = socket.convos;

      if (!userId) return;

      try {
        await Prisma.user.update({
          where: { id: userId },
          data: { online: false, lastSeen: new Date() },
        });


        // if (Array.isArray(convos)) {
        //   for (const convId of convos) {
        //     io.to(convId).emit('userOnline', { userId, online: false });
        //       console.error('userOffline:', { userId, online: false });
        //   }
        // }

        socket.participantIds?.forEach((pid) => {
          io.to(`user_${pid}`).emit('userOnline', {
            userId,
            online: false,
          });
        });


      } catch (err) {

      }


    });
  });

  return io;
};

// const iLike = (field?: string) =>
//   field ? { contains: field, mode: "insensitive" } : undefined;


// function getValidCategory(value: string): PropertyCategory | null {
//   if (!value) return null
//   const lowerValue = value.toLowerCase();
//   return (
//     Object.values(PropertyCategory).find(
//       (category) => category.toLowerCase().includes(lowerValue)
//     ) ?? null
//   );
// }





export const getIO = () => io;



function isFunctionToolCall(
  toolCall: any
): toolCall is OpenAI.Chat.Completions.ChatCompletionMessageFunctionToolCall {
  return toolCall?.type === "function";
}













