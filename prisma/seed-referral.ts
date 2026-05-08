import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(__dirname, "../.env") });

import { PrismaClient } from "../generated/prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

const generateReferralCode = (username: string): string =>
  (username.slice(0, 4) + crypto.randomBytes(3).toString("hex")).toUpperCase();

async function main() {
  const allUsers = await prisma.user.findMany({
    select: { id: true, username: true, referralCode: true },
  });

  const users = allUsers.filter((u) => !u.referralCode);
  console.log(`Total users: ${allUsers.length}, without referral code: ${users.length}`);

  console.log(`Found ${users.length} users without a referral code.`);

  let updated = 0;
  let skipped = 0;

  for (const user of users) {
    let code = generateReferralCode(user.username);

    // Retry on collision (extremely unlikely but safe)
    let attempts = 0;
    while (attempts < 5) {
      const exists = await prisma.user.findUnique({ where: { referralCode: code } });
      if (!exists) break;
      code = generateReferralCode(user.username + Date.now());
      attempts++;
    }

    if (attempts === 5) {
      console.warn(`Skipped user ${user.id} — could not generate unique code after 5 attempts`);
      skipped++;
      continue;
    }

    await prisma.user.update({ where: { id: user.id }, data: { referralCode: code } });
    updated++;
  }

  console.log(`Done. Updated: ${updated}, Skipped: ${skipped}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
