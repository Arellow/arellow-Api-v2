import { Prisma } from '@prisma/client';

export type MessageType = 'TEXT' | 'PHOTO' | 'AUDIO' | 'VOICE_RECORDING' | 'VIDEO' | 'FILE' | 'PROPERTY_SHARE' | 'VIDEO_CALL_SCHEDULE';

export interface MessageWithRelations extends Prisma.MessageGetPayload<{
  include: { 
    sender: { select: { id: true; fullname: true; avatar: true; online: true; lastSeen: true } }; 
    property: true 
  };
}> {}

export type ConversationWithRelations = Prisma.ConversationGetPayload<{
  include: {
    users: { select: { id: true; fullname: true; avatar: true; online: true; lastSeen: true } };
    messages: { 
      take: 1,
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: { id: true; fullname: true; avatar: true } } };
    };
  };
}> & {
  lastMessage?: MessageWithRelations;
  unreadCount?: number;
  otherUser?: UserWithRelations;
};

export interface UserWithRelations extends Prisma.UserGetPayload<{
  select: { id: true; fullname: true; avatar: true; online: true; lastSeen: true };
}> {}