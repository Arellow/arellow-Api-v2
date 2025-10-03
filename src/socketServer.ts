// import { Server } from "socket.io";
// import { Server as HttpServer } from "http";
import { Prisma } from "./lib/prisma";

// export const onlineUsers = new Map<string, string>();
// export const userLastSeen = new Map<string, Date>();

// export function setupSocket(httpServer: HttpServer) {
//   const io = new Server(httpServer, { cors: { origin: "*" } });

//   io.on("connection", (socket) => {
//     const userId = socket.handshake.query.userId as string;
//     if (!userId) return socket.disconnect();

//     console.log(`✅ User ${userId} connected`);
//     onlineUsers.set(userId, socket.id);
//     io.emit("user:online", { userId });

//     socket.on("joinChats", (chatIds: string[]) => {
//       chatIds.forEach((chatId) => socket.join(chatId));
//     });

//     socket.on("message:send", async (data) => {
//       const { chatId, senderId, content, type, attachmentUrl } = data;
//       const message = await Prisma.message.create({
//         data: { chatId, senderId, content, type, attachmentUrl },
//         include: { sender: true },
//       });
//       io.to(chatId).emit("message:new", message);
//     });

//     socket.on("message:read", async ({ chatId, userId }) => {
//       await Prisma.chatParticipant.updateMany({
//         where: { chatId, userId },
//         data: { lastReadAt: new Date() },
//       });
//       io.to(chatId).emit("message:read", { chatId, userId });
//     });

//     socket.on("disconnect", () => {
//       console.log(`❌ User ${userId} disconnected`);
//       onlineUsers.delete(userId);
//       userLastSeen.set(userId, new Date());
//       io.emit("user:offline", { userId, lastSeen: userLastSeen.get(userId) });
//     });
//   });

//   return io;
// }




// socketServer.ts
import { Server } from "socket.io";
import { Server as HttpServer } from "http";


let io: Server; // <-- hold io instance

export const onlineUsers = new Map<string, string>();
export const userLastSeen = new Map<string, Date>();

export function setupSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: "*" }, // TODO: restrict in prod
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;
    if (!userId) {
      socket.disconnect();
      return;
    }

    console.log(`✅ User ${userId} connected`);
    onlineUsers.set(userId, socket.id);
    io.emit("user:online", { userId });

    socket.on("joinChats", (chatIds: string[]) => {
      chatIds.forEach((chatId) => socket.join(chatId));
    });

    socket.on("message:send", async (data) => {
      const { chatId, senderId, content, type, attachmentUrl } = data;

      const message = await Prisma.message.create({
        data: { chatId, senderId, content, type, attachmentUrl },
        include: { sender: true },
      });

      io.to(chatId).emit("message:new", message);
    });

    socket.on("message:read", async ({ chatId, userId }) => {
      await Prisma.chatParticipant.updateMany({
        where: { chatId, userId },
        data: { lastReadAt: new Date() },
      });

      io.to(chatId).emit("message:read", { chatId, userId });
    });

    socket.on("disconnect", () => {
      console.log(`❌ User ${userId} disconnected`);
      onlineUsers.delete(userId);
      userLastSeen.set(userId, new Date());

      io.emit("user:offline", {
        userId,
        lastSeen: userLastSeen.get(userId),
      });
    });
  });

  return io;
}

// ✅ helper to access io in routes
export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.io not initialized! Call setupSocket() first.");
  }
  return io;
}
