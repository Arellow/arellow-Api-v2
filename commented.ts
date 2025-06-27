// // npx prisma db push

// generator client {
//   provider = "prisma-client-js"
// }

// datasource db {
//   provider = "mongodb"
//   url      = env("DATABASE_URL")
// }

// model User {
    

//   banner                 String?
//   gender                 String?
//   city                   String?
//   country                String?
//   biography              String?
//   rating                 Int               @default(0)
//   createdAt              DateTime          @default(now())
//   notifications          Notification[]
//   projects               Project[]
//   chat                   UserChat[]
//   blogs                  Blog[]
//   blogs2                  Blog2[]
//   Campaign                  Campaign[]
//   UserChatGroup          UserChatGroup[]
//   conversationsIds       String[]
//   // conversations Conversation[]
//   messages               ChatMessage[]
//   isMessageReadedCounter Int               @default(0)
//   PrevUserChat           PrevUserChat[]
//   supportTickets SupportTicket[]
//   kyc_status             KycStatus?        @default(pending)
//   nin_status             KycStatus?        @default(pending)
//   nin_number             String?
//   nin_slip_url           String?
//   cac_status             KycStatus?        @default(pending)
//   cac_number             String?
//   cac_doc_url            String?
//   badge                 String?
//   face_status            KycStatus?        @default(pending)
//   face_image_url         String?
//   kyc_verified_at        DateTime?




// }

// model UserRating {
//   id     String @id @default(auto()) @map("_id") @db.ObjectId
//   rating Int    @default(0)
//   rateby String
//   userId String @db.ObjectId
// }

// model Notification {
//   id           String             @id @default(auto()) @map("_id") @db.ObjectId
//   senderId     String
//   fullname     String
//   phone_number String
//   email        String
//   message      String
//   isreaded     Boolean            @default(false)
//   status       NotificationStatus @default(message)
//   date         String?
//   time         String?
//   prodId       String?
//   createdAt    DateTime           @default(now())
//   receiverId   String             @db.ObjectId
//   receiver     User               @relation(fields: [receiverId], references: [id], onDelete: Cascade)
// }

// enum NotificationStatus {
//   tour
//   message
// }

// enum Role {
//   admin
//   user
//   agent
//   realtor
//   buyer
//   superadmin
// }

// model ResetPassword {
//   id          String @id @default(auto()) @map("_id") @db.ObjectId
//   userId      String
//   resetString String
//   createdAt   Int
//   expiresAt   Int
// }

// model Project {
//   id String @id @default(auto()) @map("_id") @db.ObjectId
//   category            String?
//   title               String?
//   description         String?
//   features            String[]
//   amenities           String[]
//   property_location   String?
//   neighborhood        String?
//   number_of_bedrooms  Int?
//   number_of_bathrooms Int?
//   number_of_floors    Int?
//   square              Float?
//   price               Float?
//   outside_view_images   String[]  // “Outside view” (1–5 images)
//   living_room_images    String[]  // “Living Room” (5–10 images)
//   kitchen_room_images   String[]  // “Kitchen Room” (5–10 images)
//   primary_room_images   String[]  // “Primary Room” (5–10 images)
//   floor_plan_images     String[]  // “Floor Plan” (1 image)
//   tour_3d_images        String[]  // “3D Tour” (5–10 images)
//   other_images          String[]  // “Others” (1–5 images)
//   banner              String?
//   youTube_link        String?
//   youTube_thumbnail   String?
//   property_type       String?
//   listing_type        String?
//   property_status     String?
//   property_age        Int?
//   furnishing          String?
//   parking_spaces      Int?
//   total_floors        Int?
//   available_floor     Int?
//   facing_direction    String?
//   street_width        Float?
//   plot_area           Float?
//   construction_status String?
//   possession_status   String?
//   transaction_type    String?
//   ownership_type      String?
//   expected_pricing    Float?
//   price_per_sqft      Float?
//   booking_amount      Float?
//   maintenance_monthly Float?
//   price_negotiable    Boolean   @default(false)
//   available_from      DateTime?
//   isFeatured          Boolean            @default(false)
//   longitude                 String?
//   latitude                  String?
//   distance_between_facility Json?
//   country String?
//   region  String?
//   city    String?

//   views        Int                @default(0)
//   archive      Boolean            @default(false)
//   status       Status             @default(selling)
//   isapproved   AdminApproveStatus @default(pending)
//   rejectreason String             @default("")

//   userId    String   @db.ObjectId
//   user      User     @relation(fields: [userId], references: [id])
//   createdAt DateTime @default(now())

//   chatid String[] @db.ObjectId
//   chats  Chat[]   @relation(fields: [chatid], references: [id])

//   likes         LikeUser[]
//   UserChatGroup UserChatGroup[]
//   ChatMessage   ChatMessage[]
//   PrevUserChat  PrevUserChat[]
//   rewardHistories RewardHistory[] 

// }

// model ArellowImages {
//   id        String @id @default(auto()) @map("_id") @db.ObjectId
//   photoUrl  String
//   public_id String
// }

// model LikeUser {
//   id        String   @id @default(auto()) @map("_id") @db.ObjectId
//   userId    String
//   Project   Project? @relation(fields: [projectId], references: [id])
//   projectId String?  @db.ObjectId
//    User       User ?    @relation(fields: [userId], references: [id])
//     @@unique([userId, projectId])
// }

// model ReportPost {
//   id      String @id @default(auto()) @map("_id") @db.ObjectId
//   userId  String
//   prodId  String
//   message String
// }

// model Blog {
//   id String @id @default(auto()) @map("_id") @db.ObjectId

//   title           String
//   avatar          String
//   post            String
//   tags            String[]
//   features_avatar String
//   categories      String[]

//   userId    String   @db.ObjectId
//   user      User     @relation(fields: [userId], references: [id])
//   createdAt DateTime @default(now())
// }

// model Blog2 {
//   id        String   @id @default(auto()) @map("_id") @db.ObjectId
//   userId    String   @db.ObjectId
//   user      User     @relation(fields: [userId], references: [id])
//   title     String
//   content   String
//   category  String   @default("Internal Blog")
//   imageUrl  String?
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt
//   @@index([userId])
// }


// model Contact_Us {
//   id      String @id @default(auto()) @map("_id") @db.ObjectId
//   name    String
//   email   String
//   mobile  String
//   message String
// }

// enum Status {
//   selling
//   sold
// }

// enum AdminApproveStatus {
//   pending
//   rejected
//   approved
// }

// model Chat {
//   id          String    @id @default(auto()) @map("_id") @db.ObjectId
//   projects    Project[] @relation(fields: [projectsIds], references: [id])
//   projectsIds String[]  @db.ObjectId
//   messageId   String[]  @db.ObjectId
//   messages    Message[] @relation(fields: [messageId], references: [id])
//   createdAt   DateTime  @default(now())
// }

// model Message {
//   id        String   @id @default(auto()) @map("_id") @db.ObjectId
//   chatid    String[] @db.ObjectId
//   chats     Chat[]   @relation(fields: [chatid], references: [id])
//   text      String
//   userId    String
//   createdAt DateTime @default(now())
// }

// model Subscribe {
//   id    String  @id @default(auto()) @map("_id") @db.ObjectId
//   email String?
//   phone String?
// }

// model UserChat {
//   id          String        @id @default(auto()) @map("_id") @db.ObjectId
//   message     String?
//   imageUrl    String?
//   messageType messageStatus
//   users       String[]
//   senderId    String        @db.ObjectId
//   sender      User          @relation(fields: [senderId], references: [id], onDelete: Cascade)
//   createdAt   DateTime      @default(now())
// }

// enum messageStatus {
//   text
//   image
// }

// model UserChatGroup {
//   id          String   @id @default(auto()) @map("_id") @db.ObjectId
//   senderId    String   @db.ObjectId
//   recipientId String   @db.ObjectId
//   recipient   User     @relation(fields: [recipientId], references: [id], onDelete: Cascade)
//   Project     Project  @relation(fields: [projectId], references: [id])
//   projectId   String   @db.ObjectId
//   lastMessage String
//   createdAt   DateTime @default(now())
//   isSelf      Boolean  @default(false)
//   isReaded    Boolean  @default(false)
// }

// // new chat project

// model Conversation {
//   id        String   @id @default(auto()) @map("_id") @db.ObjectId
//   createdAt DateTime @default(now())
//   updatedAt DateTime @updatedAt

//   participantsIds String[]
//   // participants User[] 

//   messageIds String[]
//   messages   ChatMessage[]

//   // User   User?   @relation(fields: [userId], references: [id])
//   // userId String? @db.ObjectId
// }

// model ChatMessage {
//   id String @id @default(auto()) @map("_id") @db.ObjectId

//   senderId String @db.ObjectId
//   sender   User   @relation(fields: [senderId], references: [id], onDelete: Cascade)

//   conversation    Conversation @relation(fields: [conversationIds], references: [id])
//   conversationIds String       @db.ObjectId

//   Project   Project @relation(fields: [projectId], references: [id])
//   projectId String  @db.ObjectId

//   body        String  @default("")
//   image       String  @default("")
//   received    Boolean @default(false)
//   showProject Boolean @default(false)

//   messageType messageStatus @default(text)
//   createdAt   DateTime      @default(now())
//   updatedAt   DateTime      @updatedAt
// }

// model PrevUserChat {
//   id     String @id @default(auto()) @map("_id") @db.ObjectId
//   userId String @db.ObjectId

//   Project   Project @relation(fields: [projectId], references: [id])
//   projectId String  @db.ObjectId

//   recipientId            String   @db.ObjectId
//   recipient              User     @relation(fields: [recipientId], references: [id], onDelete: Cascade)
//   participantsIds        String[]
//   body                   String
//   isReaded               Boolean  @default(false)
//   isSelf                 Boolean  @default(false)
//   isMessageReadedCounter Int      @default(0)
//   createdAt              DateTime @default(now())
//   updatedAt              DateTime @updatedAt
// }


// model State {
//   id    String @id @default(auto()) @map("_id") @db.ObjectId
//   name  String @unique
//   image String
// }

// enum KycStatus {
//   pending
//   verified
//   failed
// }


// model SupportTicket {
//   id          String   @id @default(auto()) @map("_id") @db.ObjectId
//   userId      String?  @db.ObjectId
//   user        User?    @relation(fields: [userId], references: [id])
//   name        String
//   email       String
//   category    String
//   description String
//   imageUrl    String?
//   status      String   @default("Open")
//   createdAt   DateTime @default(now())
// }


// model RewardHistory {
//   id          String   @id @default(auto()) @map("_id") @db.ObjectId
//   userId      String   @db.ObjectId
//   points      Int @default(0)
//   reason        String  
//   description String?
//   createdAt   DateTime @default(now())
//   user        User     @relation(fields: [userId], references: [id])
//   projectId   String   // This is a foreign key
//   project     Project  @relation(fields: [projectId], references: [id])
// }


// model RewardWithdrawal {
//   id                 String    @id @default(auto()) @map("_id") @db.ObjectId
//   user               User      @relation(fields: [userId], references: [id])
//   userId             String    @db.ObjectId
//   points             Int       // amount the user requested to withdraw
//   bankAccountName    String
//   bankAccountNumber  String
//   bankName           String
//   status             String    @default("pending") 
//   createdAt          DateTime  @default(now())
//   updatedAt          DateTime  @updatedAt

//   @@index([userId])
// }



/**
 * old script
 */
// "scripts": {
//     "postinstall": "prisma generate",
//     "start": "ts-node src/server.ts",
//     "dev": "nodemon --exec ts-node src/server.ts",
//     "build": "prisma generate && prisma migrate deploy",
//     "prisma:generate": "prisma generate"
//   },

//  "scripts": {
//   "postinstall": "prisma generate && prisma db push",
//   "start": "ts-node src/server.ts",
//   "dev": "nodemon --exec ts-node src/server.ts",
//   "build": "prisma generate && prisma db push",
//   "prisma:generate": "prisma generate"
// },


// {
//   "rewrites": [{ "source": "/api/(.*)", "destination": "/api" }]
// }
