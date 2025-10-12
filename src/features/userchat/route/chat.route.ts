
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

import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
import { Router } from "express";
import { Prisma } from "../../../lib/prisma";
import authenticate from "../../../middlewares/auth.middleware";
import upload from "./middleware.upload";
import { getIO } from "./socketServer";
import { processImage } from "../../../utils/imagesprocess";
import { singleupload } from "../../../middlewares/multer";
import { InternalServerError } from '../../../lib/appError';

let io = getIO();



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
    // console.error('Message create error:', err);
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




chatRoutes.post('/token', authenticate, async(req, res) => {


  // const { channelName , privilegeExpiredTs} = req.body;
  // const userId = req.user?.id!;

  // const appID = process.env.AGORA_APP_ID!;
  // const appCertificate = process.env.AGORA_APP_CERTIFICATE!;
  // const role = RtcRole.PUBLISHER;


  // const uid1 = hashUid(req.body.uid);
  // const uid2 = hashUid(userId);



  // const creatortoken =  RtcTokenBuilder.buildTokenWithUid(
  //   appID,
  //   appCertificate,
  //   channelName,
  //   uid1,
  //   role,
  //   privilegeExpiredTs
  // );
  // const recipienttoken =  RtcTokenBuilder.buildTokenWithUid(
  //   appID,
  //   appCertificate,
  //   channelName,
  //   uid2,
  //   role,
  //   privilegeExpiredTs
  // );

  // res.json({ creatortoken,  recipienttoken});



  const { channelName, privilegeExpiredTs, uid } = req.body;
  const userId = req.user?.id!;

  if (!channelName || typeof channelName !== 'string') {
    return res.status(400).json({ error: 'Channel name is required and must be a string' });
  }
  if (!uid || typeof uid !== 'string') {
    return res.status(400).json({ error: 'Creator UID is required and must be a string' });
  }
  if (!privilegeExpiredTs || !Number.isInteger(privilegeExpiredTs)) {
    return res.status(400).json({ error: 'Privilege expiration timestamp is required and must be an integer' });
  }

  const now = Math.floor(Date.now() / 1000);
  if (privilegeExpiredTs <= now || privilegeExpiredTs > now + 24 * 3600) {
    return res.status(400).json({ error: 'Invalid privilege expiration time' });
  }

  const appID = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;
  if (!appID || !appCertificate) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const role = RtcRole.PUBLISHER;

  try {
    const uid1 = hashUid(userId); // Creator's UID
    const uid2 = hashUid(uid); // Recipient's UID

    if (!uid1 || !uid2 || uid1 === uid2) {
      return res.status(400).json({ error: 'Invalid or duplicate UIDs' });
    }

    const creatortoken = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
      uid1,
      role,
      privilegeExpiredTs
    );
    const recipienttoken = RtcTokenBuilder.buildTokenWithUid(
      appID,
      appCertificate,
      channelName,
      uid2,
      role,
      privilegeExpiredTs
    );

    res.json({ creatortoken, recipienttoken });
  } catch (error) {
    console.error('Token generation failed:', error);
    res.status(500).json({ error: 'Failed to generate tokens' });
  }


});



chatRoutes.post('/tour-status', authenticate, async(req, res, next) => {
  const { id , callStatus} = req.body;

  try {
    let message = await Prisma.message.findUnique({where: {id}});
  
    if(!message) throw new Error("invalid schedule");
  

      const parsedvideoCallDetails: {
        date:string
     duration: number,
     startTime: string,
     endTime: string,
      id: string,
     title: string,
     channelName: string,
     createdAt: string,
     token: string,
     callStatus: string,
  
      } = typeof message?.videoCallDetails === 'string' ? JSON.parse(message?.videoCallDetails) : message?.videoCallDetails;
  
      let videoCallDetails = {
    ...parsedvideoCallDetails,
     callStatus
   }
  
   await Prisma.message.update({where: {id}, data: {videoCallDetails}});


   res.json({ message });
    
  } catch (error) {
     return next(new InternalServerError("Server Error", 500));
  }

});


chatRoutes.get('/aiconversation', authenticate, async(req, res, next) => {
  const userId = req?.user?.id!;

  try {
     const previousMessages = await Prisma.aiMessage.findMany({
      where: {
        userId,
        //  NOT: {
        //   content: null, 
        // },
      },

      include:{
        properties: {
          select: {
            property: {
              select: {
                id:true,
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
            }
          }

        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });


    const chatHistory = previousMessages.map((msg) => ({
  ...msg, properties: msg.properties.map(v => v.property)
}));
    
   res.json(chatHistory);


  } catch (err) {
    console.error('chatHistory:', err);
    res.status(500).json({ error: 'Failed chatHistory' });
  }

})


export default chatRoutes;



function hashUid(str: string): number {
  
  if (!str || typeof str !== 'string') {
    throw new Error('Invalid input: UID must be a non-empty string');
  }

  let hash = 2166136261; 
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 16777619) >>> 0; 
  }

  return (hash % 4294967294) + 1;
}


