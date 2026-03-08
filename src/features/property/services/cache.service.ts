import { deleteMatchingKeys } from "../../../lib/cache";

export const cacheService = {

  async clearPropertyCache(propertyId: string, userId: string) {

    await deleteMatchingKeys(`property:${propertyId}:*`);

    await deleteMatchingKeys(`getAllProperties:*`);

    await deleteMatchingKeys(
      `getPropertiesByUser:${userId}:*`
    );

  }

};