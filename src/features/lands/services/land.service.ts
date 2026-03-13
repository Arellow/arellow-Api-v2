import { Prisma } from '../../../lib/prisma';
import { deleteMatchingKeys } from '../../../lib/cache';
import { locationService } from '../../property/services/location.service';
import { mediaService } from './media.service';

export const landService = {
  async createLand({ userId, body, files, approvedById }: any) {
    const { title, description, category, city, country, state, neighborhood, landmark, squareMeters, price,  } = body;

   
      const location = await locationService.resolve(
        body.neighborhood,
        body.city
      );
    

    // Create DB record
    const newLand = await Prisma.lands.create({
      data: {
        title,
        description,
        userId,
        category,
        city,
        country,
        state,
        neighborhood,
        landmark,
        squareMeters,
        location,
        price: {amount: Number(price.amount), currency: price.currency},
        status: 'APPROVED',
        salesStatus: 'SELLING'
      }
    });


     await Prisma.lands.update({
              where: { id: newLand.id },
              data: {    
             approvedBy: { connect: { id: approvedById} },
              },
            });

    

    // Queue media uploads
    if (files) {
      await mediaService.queueUploads(newLand.id, files, 'LANDS');
    }

    // Clear cache
    await deleteMatchingKeys(`lastestland:${userId}`);

    return newLand;
  }
};