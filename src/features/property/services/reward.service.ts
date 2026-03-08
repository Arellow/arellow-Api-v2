import { Prisma } from "../../../lib/prisma";

export const rewardService = {

  async debitPropertyPoints(property: any) {

    let points = 10;

    const state = property.state.toLowerCase();

    if (
      state === "lagos" ||
      state === "enugu" ||
      state === "abuja"
    ) {
      points = 5;
    }

    await Prisma.rewardHistory.create({
      data: {
        userId: property.userId,
        points,
        reason: "ArellowPoints Used",
        type: "DEBIT"
      }
    });

  }

};