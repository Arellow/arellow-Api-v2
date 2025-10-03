
import { NextFunction, Request, Response, Router } from "express";
const chatRoutes = Router();

import { getIO, onlineUsers, userLastSeen } from "../../../socketServer";
import authenticate from "../../../middlewares/auth.middleware";
import { Prisma } from "../../../lib/prisma";


// import prisma from "../utils/prisma";
// import { isLoginUser } from "../middlewares/auth.middleware";
// import { getIO } from "../socketServer";



// ✅ Start chat
chatRoutes.post("/start", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;
  const myId = req?.user?.id!;

  let chat = await Prisma.chat.findFirst({
    where: {
      participants: {
        every: { userId: { in: [myId, userId] } },
      },
    },
    include: { participants: true },
  });

  if (!chat) {
    chat = await Prisma.chat.create({
      data: {
        participants: {
          create: [{ userId: myId }, { userId }],
        },
      },
      include: { participants: true },
    });
  }

  res.json(chat);
});

// ✅ Send message
chatRoutes.post("/:chatId/messages", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  const { chatId } = req.params;
  const { content, type } = req.body;

  const message = await Prisma.message.create({
    data: { chatId, senderId: req?.user?.id!, content, type },
    include: { sender: true },
  });

  getIO().to(chatId).emit("message:new", message);
  res.json(message);
});

// ✅ Mark as read
chatRoutes.post("/:chatId/read", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  const { chatId } = req.params;
  await Prisma.chatParticipant.updateMany({
    where: { chatId, userId: req?.user?.id },
    data: { lastReadAt: new Date() },
  });
  getIO().to(chatId).emit("message:read", { chatId, userId: req?.user?.id });
  res.json({ success: true });
});

// ✅ List chats
chatRoutes.get("/", authenticate, async (req: Request, res: Response, next: NextFunction) => {
  const chats = await Prisma.chat.findMany({
    where: { participants: { some: { userId: req?.user?.id } } },
    include: {
      participants: { include: { user: true } },
      messages: { take: 1, orderBy: { createdAt: "desc" } },
    },
  });
  res.json(chats);
});




chatRoutes.post("/users/online",  async (req, res, next) => {
  try {
    const { userIds } = req.body as { userIds: string[] };

    if (!Array.isArray(userIds)) {
      return res.status(400).json({ error: "userIds must be an array" });
    }

    const result = userIds.map((id) => ({
      userId: id,
      isOnline: onlineUsers.has(id),
      lastSeen: onlineUsers.has(id) ? null : userLastSeen.get(id) ?? null,
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
});



export default chatRoutes;
