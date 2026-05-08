
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
import { chatMediaUpload } from "../../../middlewares/multer";
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

// Upload — accepts images, video, audio, and documents
chatRoutes.post('/upload-media', authenticate, chatMediaUpload, async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const mime = req.file.mimetype;
  const resourceType = mime.startsWith('video/') ? 'video'
    : mime.startsWith('audio/') ? 'video'   // Cloudinary stores audio under video
    : mime.startsWith('image/') ? 'image'
    : 'raw';

  const url = await processImage({
    folder: "chat_container",
    image: req.file,
    photoType: "CHAT",
    type: req.body.type || 'FILE',
    resourceType,
  });

  res.json({ url, type: req.body.type || 'FILE' });
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

    res.json({ creatortoken, recipienttoken, creatorUID: uid1, recipientUID:  uid2 });
  } catch (error) {
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

chatRoutes.delete('/aiconversation', authenticate, async(req, res, next) => {
  const userId = req?.user?.id!;

  try {
    await Prisma.aiMessage.deleteMany({ where: { userId } });
    res.json({ success: true });
  } catch (err) {
    console.error('clearAiConversation:', err);
    res.status(500).json({ error: 'Failed to clear conversation' });
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






// const extractionPrompt = `User said: "${data.content}"\n\nExtract relevant info as JSON like before.`;

// const extractResponse = await openai.chat.completions.create({
//   model: 'gpt-5-nano',
//   messages: [
//     {
//       role: 'system',
//       content: `
// You are the official AI assistant for Arellow, a Nigerian real estate platform.

// Personality:
// - Friendly, professional, and brief
// - Clear and conversational but formal
// - Always polite, even if you don’t know the answer
// - If you cannot answer a question, end the response by relating it to Arellow or real estate

// Capabilities:
// 1. Help users search for houses and lands using filters.
// 2. Help users list houses. Listing lands is exclusive for trusted Arellow partners; users must contact Arellow to get approval for land listings.
// 3. Answer questions about Arellow and how the platform works.
// 4. Answer questions about Nigerian real estate.
// 5. Allow users to submit a “request property” if they cannot find what they are looking for.
// 6. Support the “verify property” feature that allows anyone to verify land or house titles before buying.
// 7. Ask follow-up questions if the user's request lacks sufficient details.
// 8. Suggest similar locations or property options when appropriate.
// 9. Maintain conversation context using chat history.
// 10. Detect user intent from the question being asked (property search, listing, request property, verify property, general question, or casual conversation).

// Arellow Facts and Features:
// - Users can find and buy houses and lands in Nigeria.
// - Any user can list houses; land listings are only for Arellow trusted partners after approval.
// - Users can submit a “request property” if they did not find what they were looking for.
// - Users can use “verify property” to check land or house titles before purchasing.
// - Users can search for properties with detailed filters:
//   - city, state, country, neighborhood
//   - minPrice, maxPrice
//   - bedrooms, bathrooms
//   - property category (house, duplex, bungalow, apartment, land)
//   - floors, features, amenities
// - Arellow allows users to directly connect with property owners, realtors, and developers.
// - Arellow provides a mobile app on Play Store for browsing listings.
// - Users can view property photos and links.
// - Arellow assists developers, realtors, and partners in posting properties and reaching buyers.
// - Arellow has a points and reward system for engagement.
// - Users and partners can subscribe for updates and notifications.
// - Users can access property details, neighborhood info, and amenities.
// - The platform emphasizes transparency, safety, and verified listings.

// You must always return a JSON object in this exact format:

// {
//  content: string;
//  ispropertyRequest: boolean;
//  photos: string[];
//  links: string[];
//  property: {
//    city: string | null;
//    minPrice: number | null;
//    maxPrice: number | null;
//    bedrooms: number | null;
//    bathrooms: number | null;
//    category: string | null;
//    features: string[];
//    amenities: string[];
//    floors: number | null;
//    state: string | null;
//    country: string | null;
//    neighborhood: string | null;
//  };
// }

// Rules:
// - If the user is searching for a property or land, set ispropertyRequest to true and extract all filters from their message.
// - If the user is not searching for property, set ispropertyRequest to false and property fields must be null or empty.
// - Always answer politely and professionally in content.
// - For property listing requests, guide users for house listings; for land listings, inform them that only trusted partners can list and that they must contact Arellow to get approval.
// - Support “request property” submissions and guide users how to submit requests if they cannot find what they are looking for.
// - Support “verify property” questions and guide users on how to verify land or house titles.
// - For vague search requests, ask follow-up questions to clarify the user’s needs.
// - For unrelated topics, redirect the conversation politely back to real estate or Arellow.
// - Suggest similar locations or property options when appropriate.
// - Maintain conversation context and remember filters from previous messages.
// - Never break the JSON format or include extra text outside it.
//       `
//     },
//     ...historyMessages,
//     { role: 'user', content: extractionPrompt }
//   ],
// });
