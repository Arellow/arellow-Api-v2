import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import http from 'http';
import { Prisma } from '../../../lib/prisma';
import OpenAI from 'openai';
import { Prisma as prisma, PropertyCategory } from '@prisma/client';


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


    socket.on("sendAiMessage", async (data, callback) => {



      if (!data.content || !socket.aiuser?.userId) {
        if (callback) callback({ error: 'Content required for this type' });
        return;
      }

      try {



        io.to(socket.aiuser?.userId!).emit('aiTyping', { typing: true });


        const previousMessages = await Prisma.aiMessage.findMany({
          where: {
            userId: socket.user?.userId!,
            NOT: {
              content: null,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        });

        const orderedMessages = previousMessages.reverse();


        const historyMessages = orderedMessages.map((msg: any) => ({
          role: msg.senderId === socket.user?.userId! ? 'user' as const : 'assistant' as const,
          content: msg.content,
        }));


        const extractionPrompt = `User said: "${data.content}"\n\nExtract relevant info as JSON like before.`;




        const extractResponse = await openai.chat.completions.create({
          model: 'gpt-5-nano',
          messages: [
            {
              role: 'system',
              content: `
You are a helpful real estate assistant for Arellow.
Always respond professionally and briefly.
You have access to property search filters and user context.



Return a JSON object with fields: with type 

{
  content: string;
  ispropertyRequest: boolean;
  photos: string[],
  links: string[],
  property: {
    city: string, minPrice: number, maxPrice:number, bedrooms:number, bathrooms: number, category: string,
     features: string[],
     amenities: string[],
     floors: number,
     state: string,
     country: string,
     neighborhood: string,
  };
}

if property is requested set ispropertyRequest to true or vice versa
content is your response

If ispropertyRequest is true Extract property search filters from this user message to property else 
   If a field is not specified, set it to null.
`,
            },
            ...historyMessages,
            { role: 'user', content: extractionPrompt }
          ],
        });

        await Prisma.aiMessage.create({
          data: { userId: socket.user?.userId!, content: data.content, senderId: socket.user?.userId!, isAi: false }
        })


        const extractedText = extractResponse.choices[0].message.content;
        const filterItems = JSON.parse(extractedText!);

        const featuresArray = filterItems?.property?.features ?? [];
        const amenitiesArray = filterItems?.property?.amenities ?? [];

        const matchedCategory = getValidCategory(filterItems?.property?.category);


        const filters: prisma.PropertyWhereInput = {
          archived: false,
          status: "APPROVED",
          AND: [
            filterItems?.property?.bathrooms ? { bathrooms: parseInt(filterItems?.property?.bathrooms as string) } : undefined,
            filterItems?.property?.bedrooms ? { bedrooms: parseInt(filterItems?.property.bedrooms as string) } : undefined,
            filterItems?.property?.floors ? { floors: parseInt(filterItems?.property?.floors as string) } : undefined,
            matchedCategory ? { category: matchedCategory } : null,

            filterItems?.property?.state ? { state: iLike(filterItems?.property?.state as string) } : undefined,
            filterItems?.property?.city ? { city: iLike(filterItems?.property?.city as string) } : undefined,
            filterItems?.property?.country ? { country: iLike(filterItems?.property?.country as string) } : undefined,
            filterItems?.property?.neighborhood ? { neighborhood: iLike(filterItems?.property?.neighborhood as string) } : undefined,

            amenitiesArray.length > 0 ? { amenities: { some: { name: { in: amenitiesArray } } } } : undefined,
            featuresArray.length > 0 ? { features: { hasSome: featuresArray } } : undefined,

            (filterItems?.property?.minPrice || filterItems?.property?.maxPrice)
              ? {

                price: {
                  is: {
                    amount: {
                      ...(filterItems?.property?.minPrice ? { gte: parseFloat(filterItems?.property?.minPrice as string) } : {}),
                      ...(filterItems?.property?.maxPrice ? { lte: parseFloat(filterItems?.property?.maxPrice as string) } : {})
                    }
                  }

                }
              }
              : undefined,
          ].filter(Boolean) as prisma.PropertyWhereInput[]
        };


        const properties = await Prisma.property.findMany({
          where: filters,
          select: {
            id: true,
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
          },
          take: 5

        })


        io.to(socket.aiuser?.userId!).emit('aiTyping', { typing: false });



        if (!filterItems?.ispropertyRequest && properties.length !== 0) {

          const tempId1 = `temp_${Date.now()}_${Math.random() * 1000}`;

          const optimisticMessage = {
            id: tempId1,
            content: filterItems.content,
            senderId: "ai",
            createdAt: new Date().toISOString(),
          };

          await Prisma.aiMessage.create({
            data: { userId: socket.user?.userId!, content: filterItems.content, senderId: "ai", isAi: true }
          })


          io.to(socket.aiuser?.userId!).emit('newAiMessage', optimisticMessage);

        }



        const tempId12 = `temp_${Date.now()}_${Math.random() * 8000}`;

        const optimisticMessage2 = {
          id: tempId12,
          senderId: "ai",
          content: filterItems?.ispropertyRequest && properties.length === 0 ? "Sorry no match found " : null,
          createdAt: new Date().toISOString(),
          properties: filterItems?.ispropertyRequest ? properties : null


        };

        if (filterItems?.ispropertyRequest) {

          await Prisma.aiMessage.create({
            data: {
              content: filterItems?.ispropertyRequest && properties.length === 0 ? "Sorry no match found " : null,
              userId: socket.user?.userId!,
              senderId: "ai",
              isAi: true,
              properties: {
                create: (filterItems?.ispropertyRequest && properties.length > 0)
                  ? properties.map((prop) => ({
                    property: {
                      connect: {
                        id: prop.id,
                      },
                    },
                  }))
                  : [],
              },
            },
          });


          io.to(socket.aiuser?.userId!).emit('newAiMessage', optimisticMessage2);
        }

      } catch (error: any) {
        socket.emit('error', { message: 'Failed to send message' });
        if (callback) callback({ error: error?.message });
      }

    })


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

const iLike = (field?: string) =>
  field ? { contains: field, mode: "insensitive" } : undefined;


function getValidCategory(value: string): PropertyCategory | null {
  if (!value) return null
  const lowerValue = value.toLowerCase();
  return (
    Object.values(PropertyCategory).find(
      (category) => category.toLowerCase().includes(lowerValue)
    ) ?? null
  );
}





export const getIO = () => io;