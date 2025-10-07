


// // routes/chat.routes.ts
// import { Router } from "express";
// import { Prisma } from "../../../lib/prisma";
// import { getIO } from "../../../socketServer";



// const chatRoutes = Router();

// /**
//  * ✅ Get all chats for current user
//  */
// chatRoutes.get("/", async (req: any, res) => {
//   const userId = req.user.id;

//   const chats = await Prisma.chat.findMany({
//     where: {
//       participants: {
//         some: { userId },
//       },
//     },
//     include: {
//       participants: {
//         include: { user: true },
//       },
//       messages: {
//         orderBy: { createdAt: "desc" },
//         take: 1, // last message
//       },
//     },
//     orderBy: { updatedAt: "desc" },
//   });

//   res.json(chats);
// });

// /**
//  * ✅ Start a new chat
//  */
// chatRoutes.post("/start", async (req: any, res) => {
//   const userId = req.user.id;
//   const { otherUserId, propertyId } = req.body;

//   // check if a chat already exists
//   let chat = await Prisma.chat.findFirst({
//     where: {
//       participants: {
//         every: {
//           userId: { in: [userId, otherUserId] },
//         },
//       },
//     },
//     include: { participants: true },
//   });

//   if (!chat) {
//     chat = await Prisma.chat.create({
//       data: {
//         propertyId,
//         participants: {
//           create: [{ userId }, { userId: otherUserId }],
//         },
//       },
//       include: { participants: true },
//     });
//   }

//   res.json(chat);
// });

// /**
//  * ✅ Get messages in a chat
//  */
// chatRoutes.get("/:id/messages", async (req: any, res) => {
//   const { id: chatId } = req.params;

//   const messages = await Prisma.message.findMany({
//     where: { chatId },
//     orderBy: { createdAt: "asc" },
//     include: { sender: true },
//   });

//   res.json(messages);
// });

// /**
//  * ✅ Send a new message (REST)
//  * This ALSO emits via socket.io for real-time update
//  */
// chatRoutes.post("/:id/messages", async (req: any, res) => {
//   const { id: chatId } = req.params;
//   const senderId = req.user.id;
//   const { content, type, attachmentUrl, attachmentMime, attachmentName, attachmentSize } = req.body;

//   const message = await Prisma.message.create({
//     data: {
//       chatId,
//       senderId,
//       content,
//       type,
//       attachmentUrl,
//       attachmentMime,
//       attachmentName,
//       attachmentSize,
//     },
//     include: { sender: true },
//   });

//   // update chat's updatedAt
//   await Prisma.chat.update({
//     where: { id: chatId },
//     data: { updatedAt: new Date() },
//   });

//   // ✅ Broadcast via socket.io
//   getIO().to(chatId).emit("message:new", message);

//   res.json(message);
// });

// /**
//  * ✅ Mark chat as read
//  */
// chatRoutes.post("/:id/read", async (req: any, res) => {
//   const { id: chatId } = req.params;
//   const userId = req.user.id;

//   await Prisma.chatParticipant.updateMany({
//     where: { chatId, userId },
//     data: { lastReadAt: new Date() },
//   });

//   // ✅ Notify others
//   getIO().to(chatId).emit("message:read", { chatId, userId });

//   res.json({ success: true });
// });

// export default chatRoutes;








// import express from 'express';
// import authenticate  from '../../../middlewares/auth.middleware';
// import { ConversationWithRelations, MessageWithRelations } from './types.chat';
// import upload from './middleware.upload';
// import { Prisma } from '../../../lib/prisma';
// const chatRoutes = express.Router();


// interface CreateConversationBody {
//   participantIds: string[];
// }

// // Helper to map lastMessage
// const mapLastMessage = (conversation: any): ConversationWithRelations => ({
//   ...conversation,
//   lastMessage: conversation.messages?.[0] || undefined,
// });

// // Create or get conversation (only if has messages)
// chatRoutes.post('/conversations', authenticate, async (req, res) => {
//   const { participantIds } = req.body as CreateConversationBody;
//   const userId = req.user!.id;

//   if (participantIds.length !== 2 || !participantIds.includes(userId)) {
//     return res.status(400).json({ error: 'Invalid participants' });
//   }

//   let conversation = await Prisma.conversation.findFirst({
//     where: {
//       userIds: {
//         hasEvery: participantIds,  // Exact match
//       },
//       messages: { some: {} }, // Only with messages
//     },
//     include: {
//       users: { select: { id: true, fullname: true, avatar: true, online: true, lastSeen: true } },
//       messages: { 
//         take: 50, 
//         orderBy: { createdAt: 'desc' }, 
//         include: { sender: { select: { id: true, fullname: true, avatar: true } } } 
//       },  // Full recent messages
//     },
//   });

//   if (!conversation) {
//     // Create with userIds
//     conversation = await Prisma.conversation.create({
//       data: {
//         type: 'ONE_ON_ONE',
//         userIds: participantIds,  // Embed IDs
//       },
//       include: { 
//         users: true, 
//         messages: { 
//           orderBy: { createdAt: 'desc' }, 
//           include: { sender: { select: { id: true, fullname: true, avatar: true } } } 
//         } 
//       },
//     });
//     // If no messages, don't return it here
//     if (conversation.messages.length === 0) {
//       return res.json({ id: conversation.id, message: 'Conversation created, send a message to start' });
//     }
//   }

//   res.json(mapLastMessage(conversation));
// });

// // Get user's conversations list (only with messages, with unread counts)
// chatRoutes.get('/conversations', authenticate, async (req, res) => {
//   const userId = req.user!.id;
//   const conversations = await Prisma.conversation.findMany({
//     where: {
//       userIds: { has: userId },  // User's convos
//       messages: { some: {} },
//     },
//     include: {
//       users: { where: { id: { not: userId } }, select: { id: true, fullname: true, avatar: true, online: true, lastSeen: true } }, // Other user
//       messages: {  // Take only last for efficiency
//         take: 1,
//         orderBy: { createdAt: 'desc' },
//         include: { sender: { select: { id: true, fullname: true, avatar: true } } },
//       },
//     },
//     orderBy: { updatedAt: 'desc' },
//   });

//   // Add unread count and map lastMessage
//   const convosWithUnread = await Promise.all(
//     conversations.map(async (conv) => {
//       const unreadCount = await Prisma.message.count({
//         where: {
//           conversationId: conv.id,
//           NOT: { readByIds: { has: userId } },
//         },
//       });
//       return { 
//         ...mapLastMessage(conv), 
//         unreadCount,
//         otherUser: conv.users[0],  // For frontend convenience
//       };
//     })
//   );

//   res.json(convosWithUnread);
// });

// // Send message
// chatRoutes.post('/messages', authenticate, upload.single('media'), async (req, res) => {
//   const { conversationId, type = 'TEXT', content, propertyId, videoCallDetails } = req.body;
//   const senderId = req.user!.id;
//   let mediaUrl = req.file ? (req.file as any).path : null;



//   const message = await Prisma.message.create({
//     data: {
//       conversationId,
//       senderId,
//       type: type as any,
//       content: type === 'TEXT' ? content : mediaUrl,
//       propertyId: type === 'PROPERTY_SHARE' ? propertyId : null,
//       videoCallDetails: type === 'VIDEO_CALL_SCHEDULE' ? JSON.parse(videoCallDetails as string) : null,
//       readByIds: [senderId],  // Sender auto-reads
//     },
//     include: {
//       sender: { select: { id: true, fullname: true, avatar: true } },
//       property: type === 'PROPERTY_SHARE' ? { select: { id: true, title: true } } : false,
//     },
//   }) as MessageWithRelations;

//   await Prisma.conversation.update({
//     where: { id: conversationId },
//     data: { lastMessage: message.id, updatedAt: new Date() },  // Update scalar ID
//   });

//   res.json(message);
// });

// // Mark as read
// chatRoutes.post('/mark-read/:messageId', authenticate, async (req, res) => {
//   const { messageId } = req.params;
//   const userId = req.user!.id;

//   const message = await Prisma.message.findUnique({ where: { id: messageId } });
//   if (message && !message.readByIds.includes(userId)) {
//     await Prisma.message.update({
//       where: { id: messageId },
//       data: { readByIds: [...message.readByIds, userId] },
//     });
//   }

//   res.json({ success: true });
// });

// // Get messages for a conversation (for pagination)
// chatRoutes.get('/messages/:conversationId', authenticate, async (req, res) => {
//   const { conversationId } = req.params;
//   const { page = '0', limit = '20' } = req.query;
//   const userId = req.user!.id;
//   const skip = parseInt(page as string) * parseInt(limit as string);
//   const take = parseInt(limit as string);

//   const messages = await Prisma.message.findMany({
//     where: { conversationId },
//     include: {
//       sender: { select: { id: true, fullname: true, avatar: true } },
//       property: true,
//     },
//     orderBy: { createdAt: 'desc' },
//     skip,
//     take,
//   });

//   // Mark unread as read for current user
//   const unreadMessages = messages.filter(m => !m.readByIds.includes(userId));
//   if (unreadMessages.length > 0) {
//     const updates = unreadMessages.map(async (m) => {
//       const newIds = [...new Set([...m.readByIds, userId])];  // Avoid dups
//       await Prisma.message.update({
//         where: { id: m.id },
//         data: { readByIds: newIds },
//       });
//     });
//     await Promise.all(updates);
//   }

//   res.json(messages);
// });

// export default chatRoutes;



// Types (from your code)
enum MessageType {
  TEXT = 'TEXT',
  PHOTO = 'PHOTO',
  AUDIO = 'AUDIO',
  VOICE_RECORDING = 'VOICE_RECORDING',
  VIDEO = 'VIDEO',
  FILE = 'FILE',
  PROPERTY_SHARE = 'PROPERTY_SHARE',
  VIDEO_CALL_SCHEDULE = 'VIDEO_CALL_SCHEDULE',
}


import { Router } from "express";
import { Prisma } from "../../../lib/prisma";
import authenticate from "../../../middlewares/auth.middleware";
import upload from "./middleware.upload";
import { getIO } from "./socketServer";
import { processImage } from "../../../utils/imagesprocess";
import { singleupload } from "../../../middlewares/multer";

let io = getIO();




// chatRoutes.post('/conversations', authenticate, async (req, res) => {
//   const { participantIds } = req.body as CreateConversationBody;
//   const userId = req.user!.id;

//   if (participantIds.length !== 2 || !participantIds.includes(userId)) {
//     return res.status(400).json({ error: 'Invalid participants' });
//   }

//   let conversation = await Prisma.conversation.findFirst({
//     where: {
//       userIds: {
//         hasEvery: participantIds,
//       },
//       messages: { some: {} },
//     },
//     include: {
//       users: { select: { id: true, fullname: true, avatar: true, online: true, lastSeen: true } },
//       messages: {
//         take: 50,
//         orderBy: { createdAt: 'desc' },
//         include: { sender: { select: { id: true, fullname: true, avatar: true } } },
//       },
//     },
//   });

//   if (!conversation) {
//     conversation = await Prisma.conversation.create({
//       data: {
//         type: 'ONE_ON_ONE',
//         userIds: participantIds,
//       },
//       include: {
//         users: true,
//         messages: {
//           orderBy: { createdAt: 'desc' },
//           include: { sender: { select: { id: true, fullname: true, avatar: true } } },
//         },
//       },
//     });
//     if (conversation.messages.length === 0) {
//       return res.json({ id: conversation.id, message: 'Conversation created, send a message to start' });
//     }
//   }

//   res.json(mapLastMessage(conversation));
// });


// chatRoutes.get('/conversations', authenticate, async (req, res) => {
//   const userId = req.user!.id;
//   const conversations = await Prisma.conversation.findMany({
//     where: {
//       userIds: { has: userId },
//       messages: { some: {} },
//     },
//     include: {
//       users: { where: { id: { not: userId } }, select: { id: true, fullname: true, avatar: true, online: true, lastSeen: true } },
//       messages: {  // FIXED: Explicitly order desc, include sender for last msg
//         take: 1,
//         orderBy: { createdAt: 'desc' },
//         include: { sender: { select: { id: true, fullname: true, avatar: true } } },
//       },
//     },
//     orderBy: { updatedAt: 'desc' },
//   });

//   const convosWithUnread = await Promise.all(
//     conversations.map(async (conv) => {
//       const unreadCount = await Prisma.message.count({
//         where: {
//           conversationId: conv.id,
//           NOT: { readByIds: { has: userId } },
//           senderId: { not: userId }, // FIXED: Only count incoming as unread (outgoing auto-read)
//         },
//       });
//       return { 
//         ...mapLastMessage(conv),  // lastMessage is now always the true last (any sender)
//         unreadCount,
//         otherUser: conv.users[0],
//       };
//     })
//   );

//   res.json(convosWithUnread);
// });



// // Media Upload Endpoint (new)
// chatRoutes.post('/upload-media', authenticate, upload.single('media'), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: 'No file uploaded' });
//   }
//   const mediaUrl = (req.file as any).path;
//   res.json({ url: mediaUrl, type: req.body.type || 'FILE' });
// });

// // Send Message (updated with broadcast via io)
// // Set by initSocketIO
// chatRoutes.post('/messages', authenticate, upload.single('media'), async (req, res) => {
//   const { conversationId, type = 'TEXT', content, propertyId, videoCallDetails } = req.body;
//   const senderId = req.user!.id;
//   let mediaUrl = req.file ? (req.file as any).path : null;
//   const finalContent = type === 'TEXT' ? content : mediaUrl || content; // Use media if uploaded

//   const message = await Prisma.message.create({
//     data: {
//       conversationId,
//       senderId,
//       type: type as any,
//       content: finalContent,
//       propertyId: type === 'PROPERTY_SHARE' ? propertyId : null,
//       videoCallDetails: type === 'VIDEO_CALL_SCHEDULE' ? JSON.parse(videoCallDetails as string) : null,
//       readByIds: [senderId],
//     },
//     include: {
//       sender: { select: { id: true, fullname: true, avatar: true } },
//       property: type === 'PROPERTY_SHARE' ? { select: { id: true, title: true } } : false,
//     },
//   }) as MessageWithRelations;

//   await Prisma.conversation.update({
//     where: { id: conversationId },
//     data: { lastMessage: message.id, updatedAt: new Date() },
//   });

//   // Broadcast
//   if (io) {
//     io.to(conversationId).emit('newMessage', message);
//     const conversation = await Prisma.conversation.findUnique({
//       where: { id: conversationId },
//       select: { userIds: true },
//     });
//     conversation?.userIds.forEach((pId) => {
//       if (pId !== senderId) {
//         io.to(`user_${pId}`).emit('conversationUpdated', { conversationId });
//       }
//     });
//   }

//   res.json(message);
// });

// chatRoutes.post('/mark-read/:messageId', authenticate, async (req, res) => {
//   const { messageId } = req.params;
//   const { conversationId } = req.body;
//   const userId = req.user!.id;

//   const message = await Prisma.message.findUnique({
//     where: { id: messageId },
//     include: { conversation: true },
//   });
//   if (!message || message.conversationId !== conversationId) {
//     return res.status(400).json({ error: 'Invalid message' });
//   }

//   if (!message.readByIds.includes(userId)) {
//     await Prisma.message.update({
//       where: { id: messageId },
//       data: { readByIds: [...message.readByIds, userId] },
//     });
//   }

//   if (io) {
//     io.to(conversationId).emit('messageRead', { messageId, userId });
//   }

//   res.json({ success: true });
// });

// chatRoutes.get('/messages/:conversationId', authenticate, async (req, res) => {
//   const { conversationId } = req.params;
//   const { page = '0', limit = '20' } = req.query;
//   const userId = req.user!.id;
//   const skip = parseInt(page as string) * parseInt(limit as string);
//   const take = parseInt(limit as string);

//   const messages = await Prisma.message.findMany({
//     where: { conversationId },
//     include: {
//       sender: { select: { id: true, fullname: true, avatar: true } },
//       property: true,
//     },
//     orderBy: { createdAt: 'desc' },
//     skip,
//     take,
//   });

//   const unreadMessages = messages.filter(m => !m.readByIds.includes(userId));
//   if (unreadMessages.length > 0) {
//     const updates = unreadMessages.map(async (m) => {
//       const newIds = [...new Set([...m.readByIds, userId])];
//       await Prisma.message.update({
//         where: { id: m.id },
//         data: { readByIds: newIds },
//       });
//     });
//     await Promise.all(updates);
//   }

//   res.json(messages);
// });




// interface ConversationWithRelations {
//   id: string;
//   type: string;
//   userIds: string[];
//   users: any[]; // Other user only
//   lastMessage?: any;
//   unreadCount?: number;
//   otherUser?: any;
//   updatedAt: Date;
// }

// interface MessageWithRelations {
//   id: string;
//   content?: string;
//   type: string;
//   conversationId: string;
//   senderId: string;
//   readByIds: string[];
//   sender: { id: string; fullname: string; avatar: string };
//   property?: { id: string; title: string };
//   createdAt: Date;
// }

// Helper
const mapLastMessage = (conversation: any) => ({
  ...conversation,
  lastMessage: conversation.messages?.[0] || undefined,
});

// Chat Routes (optimized: batch unread, select minimal fields)
const chatRoutes = Router();

chatRoutes.post('/conversations', authenticate, async (req, res) => {
  const { participantIds } = req.body;
  const userId = req?.user?.id!; // From JWT payload

  if (participantIds.length !== 2 || !participantIds.includes(userId)) {
    return res.status(400).json({ error: 'Invalid participants' });
  }

  let conversation = await Prisma.conversation.findFirst({
    where: {
      userIds: { hasEvery: participantIds },
      messages: { some: {} },
    },
    select: {
      id: true,
      type: true,
      userIds: true,
      updatedAt: true,
      users: { where: { id: { not: userId } }, select: { id: true, fullname: true, avatar: true, online: true, lastSeen: true } },
      messages: {
        take: 50,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, content: true, type: true, createdAt: true,
          sender: { select: { id: true, fullname: true, avatar: true } }
        }
      },
    },
  });

  if (!conversation) {
    conversation = await Prisma.conversation.create({
      data: { type: 'ONE_ON_ONE', userIds: participantIds },
      select: {
        id: true,
        type: true,
        userIds: true,
        updatedAt: true,
        users: { where: { id: { not: userId } }, select: { id: true, fullname: true, avatar: true, online: true, lastSeen: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          select: { id: true, content: true, type: true, createdAt: true, sender: { select: { id: true, fullname: true, avatar: true } } }
        },
      },
    });
    if (conversation.messages.length === 0) {
      return res.json({ id: conversation.id, message: 'Conversation created, send a message to start' });
    }
  }

  res.json(mapLastMessage(conversation));
});

// OPTIMIZED: Batch unread counts with Prisma.$transaction
chatRoutes.get('/conversations', authenticate, async (req, res) => {
  const userId = req?.user?.id!;
  const conversations = await Prisma.conversation.findMany({
    where: { userIds: { has: userId }, messages: { some: {} } },
    select: {
      id: true,
      type: true,
      userIds: true,
      updatedAt: true,
      users: { where: { id: { not: userId } }, select: { id: true, fullname: true, avatar: true, online: true, lastSeen: true } },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
        select: { id: true, content: true, type: true, createdAt: true, sender: { select: { id: true, fullname: true, avatar: true } } },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Batch unread: One query per convo ID
  const convoIds = conversations.map(c => c.id);
  const unreadCounts = await Prisma.message.groupBy({
    by: ['conversationId'],
    where: {
      conversationId: { in: convoIds },
      NOT: { readByIds: { has: userId } },
      senderId: { not: userId }, // Only incoming
    },
    _count: { id: true },
  });

  // const countMap: Record<string, number> = unreadCounts.reduce((map, { conversationId, _count }) => {
  //   map[conversationId] = _count.id;
  //   return map;
  // }, {});
  const countMap = unreadCounts.reduce((map, { conversationId, _count }) => {
    map[conversationId] = _count.id;
    return map;
  }, {} as Record<string, number>);

  const convosWithUnread = conversations.map(conv => ({
    ...mapLastMessage(conv),
    unreadCount: countMap[conv.id] || 0,
    otherUser: conv.users[0],
  }));

  res.json(convosWithUnread);
});

// Upload (unchanged)
chatRoutes.post('/upload-media', authenticate, singleupload, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  console.log(req.file)


  let avatar = await processImage({
    folder: "chat_container",
    image: req.file,
    photoType: "CHAT",
    type: req.body.type || 'FILE'
  });


  res.json({ url: avatar, type: req.body.type || 'FILE' });
});

// Send Message (optimized: use socket.to for exclude sender, minimal include)

chatRoutes.post('/messages', authenticate, upload.single('media'), async (req, res) => {
  const { conversationId, type = 'TEXT', content, propertyId, videoCallDetails } = req.body;
  const senderId = req?.user?.id!;
  let mediaUrl = req.file ? (req.file as any).path : null;
  const finalContent = type === 'TEXT' ? content : mediaUrl || content;

  try {
    const message = await Prisma.message.create({
      data: {
        conversationId,
        senderId,
        type,
        content: finalContent,
        propertyId: type === 'PROPERTY_SHARE' ? propertyId : null,
        videoCallDetails: type === 'VIDEO_CALL_SCHEDULE' ? JSON.parse(videoCallDetails) : null,
        readByIds: [senderId],
      },
      // select: { // Minimal select
      //   id: true, content: true, type: true, conversationId: true, senderId: true, readByIds: true, videoCallDetails: true,
      //   sender: { select: { id: true, fullname: true, avatar: true } },
      //   property: type === 'PROPERTY_SHARE' ? { select: { id: true, title: true } } : false,
      //   createdAt: true,
      // },

      select: { // FIXED: Explicit select for all scalars + nested relations
        id: true,
        content: true,
        type: true,
        conversationId: true,
        senderId: true,
        propertyId: true,
        videoCallDetails: true, // FIXED: Include Json field
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
            id: true,
            title: true
          }
        },
      },
    });



    await Prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessage: message.id, updatedAt: new Date() },
    });

    // Broadcast exclude sender
    if (io) {
      io.to(conversationId).emit('newMessage', message); // socket.to if per-socket
      const conversation = await Prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { userIds: true },
      });
      conversation?.userIds.forEach((pId) => {
        if (pId !== senderId) io.to(`user_${pId}`).emit('conversationUpdated', { conversationId });
      });
    }




    let broadcastMessage = { ...message };

    // FIXED: Safe parse for videoCallDetails
    if (message.videoCallDetails && typeof message.videoCallDetails === 'string') {
      try {
        broadcastMessage.videoCallDetails = JSON.parse(message.videoCallDetails);
      } catch (parseErr) {
        console.error('JSON parse error:', parseErr);
        broadcastMessage.videoCallDetails = null;
      }
    } else {
      broadcastMessage.videoCallDetails = message.videoCallDetails || null;
    }

    io.to(conversationId).emit('newMessage', broadcastMessage);
    res.json(broadcastMessage);




  } catch (err) {
    console.error('Message create error:', err);
    res.status(500).json({ error: 'Failed to send' });
  }
});

chatRoutes.post('/mark-read/:messageId', authenticate, async (req, res) => {
  const { messageId } = req.params;
  const { conversationId } = req.body;
  const userId = req?.user?.id!;

  const message = await Prisma.message.findUnique({
    where: { id: messageId },
    select: { conversationId: true, readByIds: true },
  });
  if (!message || message.conversationId !== conversationId || message.readByIds.includes(userId)) {
    return res.status(400).json({ error: 'Invalid message' });
  }

  await Prisma.message.update({
    where: { id: messageId },
    data: { readByIds: { push: userId } },
  });

  if (io) {
    io.to(conversationId).emit('messageRead', { messageId, userId });
    // Notify list update
    io.to(`user_${userId}`).emit('conversationUpdated', { conversationId }); // Self for consistency
  }

  res.json({ success: true });
});

chatRoutes.get('/messages/:conversationId', authenticate, async (req, res) => {
  const { conversationId } = req.params;
  const page = req.query.page ? String(req.query.page) : '0';
  const limit = req.query.limit ? String(req.query.limit) : '20';
  const userId = req?.user?.id!;
  const skip = parseInt(page) * parseInt(limit);
  const take = parseInt(limit);

  const messages = await Prisma.message.findMany({
    where: { conversationId },
    select: { // Minimal
      id: true, content: true, type: true, senderId: true, readByIds: true,
      sender: { select: { id: true, fullname: true, avatar: true } },
      // property: true,
      videoCallDetails: true,
      createdAt: true,
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
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });

  // Batch auto-mark unread
  const unreadMessages = messages.filter(m => !m.readByIds.includes(userId) && m.senderId !== userId);
  if (unreadMessages.length > 0) {
    const updates = unreadMessages.map(m =>
      Prisma.message.update({ where: { id: m.id }, data: { readByIds: { push: userId } } })
    );
    await Promise.all(updates);
  }

  res.json(messages.reverse()); // Chrono order
});


chatRoutes.get('/user/:userid', authenticate, async (req, res) => {
  const { userid } = req.params;


  const user = await Prisma.user.findUnique({
    where: { id: userid },
    select: {
      id: true, fullname: true, avatar: true, online: true

    },

  });



  res.json(user);
});








export default chatRoutes;

