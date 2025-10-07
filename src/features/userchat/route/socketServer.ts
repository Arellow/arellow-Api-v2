
// import { Server, Socket } from 'socket.io';
// import jwt from 'jsonwebtoken';
// import http from 'http';
// import { MessageWithRelations } from './types.chat';
// import { Prisma } from '../../../lib/prisma';

// interface AuthSocket extends Socket {
//   user?: { userId: string , email: string };
// }

// let io: Server;



// export const initSocketIO = (httpServer: http.Server) => {
//   io = new Server<AuthSocket>(httpServer, { cors: { origin: '*' } });

//   io.use(async (socket: AuthSocket, next) => {
//     const token = socket.handshake.auth.token;

//     if (!token) return next(new Error('Authentication error'));

//     try {
//       const user = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string , email: string};
//       socket.user = user;

//          console.log("======================================================================================================================================")



// console.log({user: socket.user })
//    const updated =   await Prisma.user.update({
//         where: { id: user.userId },
//         data: { online: true, lastSeen: null },
//       });

// console.log({updated})
//       const convos = await Prisma.conversation.findMany({
//         where: { userIds: { has: user.userId } },
//         select: { id: true },
//       });
//       convos.forEach((conv) => {
//         io.to(conv.id).emit('userOnline', { userId: user.userId, online: true });
//       });

//     console.log({token, user, convos})
//       next();
//     } catch (err) {
//       next(new Error('Invalid token'));
//     }
//   });

//   io.on('connection', (socket: AuthSocket) => {
//     console.log(`User ${socket.user?.userId} connected`);

//     socket.on('joinConversation', (conversationId: string) => {
//       socket.join(conversationId);
//       console.log(`User ${socket.user?.userId} joined ${conversationId}`);
//     });

//     socket.on('typingStart', (conversationId: string) => {
//       socket.to(conversationId).emit('userTyping', { userId: socket.user!.userId, conversationId, typing: true });
//     });

//     socket.on('typingStop', (conversationId: string) => {
//       socket.to(conversationId).emit('userTyping', { userId: socket.user!.userId, conversationId, typing: false });
//     });

//     socket.on('sendMessage', async (data: {
//       conversationId: string;
//       type: string;
//       content?: string;
//       propertyId?: string;
//       videoCallDetails?: any;
//     }) => {
//       const { conversationId, type, content, propertyId, videoCallDetails } = data;

//       console.log({data})
//       const senderId = socket.user!.userId;

//       if (type !== 'TEXT' && !content) {
//         return socket.emit('error', { message: 'Media URL required for non-text types' });
//       }

//       const message = await Prisma.message.create({
//         data: {
//           conversationId,
//           senderId,
//           type: type as any,
//           content,
//           propertyId: type === 'PROPERTY_SHARE' ? propertyId : null,
//           videoCallDetails: type === 'VIDEO_CALL_SCHEDULE' ? videoCallDetails : null,
//           readByIds: [senderId],
//         },
//         include: {
//           sender: { select: { id: true, fullname: true, avatar: true, online: true, lastSeen: true } },
//           property: true,
//         },
//       }) as MessageWithRelations;

//       await Prisma.conversation.update({
//         where: { id: conversationId },
//         data: { lastMessage: message.id, updatedAt: new Date() },
//       });

//       io.to(conversationId).emit('newMessage', message);

//       const conversation = await Prisma.conversation.findUnique({
//         where: { id: conversationId },
//         select: { userIds: true },
//       });
//       conversation?.userIds.forEach((pId) => {
//         if (pId !== senderId) {
//           io.to(`user_${pId}`).emit('conversationUpdated', { conversationId });
//         }
//       });

//       socket.emit('messageSent', { id: message.id });
//     });

//     socket.on('markAsRead', async ({ messageId, conversationId }: { messageId: string; conversationId: string }) => {
//       const userId = socket.user!.userId;
//       const message = await Prisma.message.findUnique({ where: { id: messageId } });
//       if (message && !message.readByIds.includes(userId)) {
//         await Prisma.message.update({
//           where: { id: messageId },
//           data: { readByIds: [...message.readByIds, userId] },
//         });
//         io.to(conversationId).emit('messageRead', { messageId, userId });
//       }
//     });

//     socket.join(`user_${socket.user!.userId}`);

//     socket.on('disconnect', async () => {
//       if (socket.user?.userId) {
//         await Prisma.user.update({
//           where: { id: socket.user.userId },
//           data: { online: false, lastSeen: new Date() },
//         });
//         const convos = await Prisma.conversation.findMany({
//           where: { userIds: { has: socket.user.userId } },
//           select: { id: true },
//         });
//         convos.forEach((conv) => {
//           io.to(conv.id).emit('userOnline', { userId: socket?.user?.userId, online: false });
//         });
//       }
//       console.log(`User ${socket.user?.userId} disconnected`);
//     });
//   });

//   return io;
// };





import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import http from 'http';
import { MessageWithRelations } from './types.chat';
import { Prisma } from '../../../lib/prisma';





interface AuthSocket extends Socket {
  user?: { userId: string };
  convos?: string[]; // Cached convos
}

let io: Server;


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

      // Cache convos once
      const convos = await Prisma.conversation.findMany({
        where: { userIds: { has: userId } },
        select: { id: true },
      });
      socket.convos = convos.map(c => c.id);

      convos.forEach(conv => io.to(conv.id).emit('userOnline', { userId, online: true }));
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    console.log(`User ${socket.user?.userId} connected`);

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



    //     socket.on('sendMessage', async (data, callback) => {
    //       const { conversationId, type, content, propertyId, videoCallDetails } = data;
    //       const senderId = socket.user!.userId;

    //        console.log({data1: data })

    //       if (type !== 'TEXT' && !content) {
    //         if (callback) callback({ error: 'Media URL required' });
    //         return;
    //       }

    //        console.log({data2: data })

    //       try {
    //         const message = await Prisma.message.create({
    //           data: {
    //             conversationId,
    //             senderId,
    //             type,
    //             content,
    //             propertyId: type === 'PROPERTY_SHARE' ? propertyId : null,
    //             videoCallDetails: type === 'VIDEO_CALL_SCHEDULE' ? videoCallDetails : null,
    //             readByIds: [senderId],
    //           },
    //           select: {
    //             id: true, content: true, type: true, senderId: true, readByIds: true, videoCallDetails: true,
    //             sender: { select: { id: true, fullname: true, avatar: true } },
    //             property: true,
    //             createdAt: true,
    //           },
    //         });

    //         await Prisma.conversation.update({
    //           where: { id: conversationId },
    //           data: { lastMessage: message.id, updatedAt: new Date() },
    //         });


    //         let broadcastMessage = { ...message };

    //         console.log({broadcastMessage1: broadcastMessage })

    // // FIXED: Safe parse for videoCallDetails
    // if (message.videoCallDetails && typeof message.videoCallDetails === 'string') {
    //   try {
    //     broadcastMessage.videoCallDetails = JSON.parse(message.videoCallDetails);
    //   } catch (parseErr) {
    //     console.error('JSON parse error:', parseErr);
    //     broadcastMessage.videoCallDetails = null;
    //   }
    // } else {
    //   broadcastMessage.videoCallDetails = message.videoCallDetails || null;
    // }

    //   console.log({broadcastMessage2: broadcastMessage })
    //   socket.to(conversationId).emit('newMessage', broadcastMessage);

    //         // Exclude sender
    //         // socket.to(conversationId).emit('newMessage', message);

    //         // Notify lists (use cached convos if needed)
    //         socket.convos?.forEach(cId => {
    //           if (cId === conversationId) {
    //             io.to(`user_${senderId}`).emit('conversationUpdated', { conversationId });
    //           }
    //         });

    //         socket.emit('messageSent', { id: message.id });
    //         if (callback) callback({ success: true });
    //       } catch (error:any) {
    //         console.error('Send error:', error);
    //         socket.emit('error', { message: 'Failed to send' });
    //         if (callback) callback({ error: error.message });
    //       }
    //     });

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

    socket.on('disconnect', async () => {

      const userId = socket.user?.userId;
      const convos = socket.convos;

      if (!userId) return;

      try {
        await Prisma.user.updateMany({
          where: { id: userId },
          data: { online: false, lastSeen: new Date() },
        });

        if (Array.isArray(convos)) {
          for (const convId of convos) {
            io.to(convId).emit('userOnline', { userId, online: false });
          }
        }
      } catch (err) {
        console.error('Socket disconnect error:', err);
      }


      // if (socket.user?.userId) {
      //   await Prisma.user.update({
      //     where: { id: socket.user.userId },
      //     data: { online: false, lastSeen: new Date() },
      //   });

      // socket.convos?.forEach(convId => io.to(convId).emit('userOnline', { userId: socket.user?.userId, online: false }));
      // }



    });
  });

  return io;
};






export const getIO = () => io;