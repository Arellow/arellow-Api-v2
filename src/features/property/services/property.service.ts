import { deleteMatchingKeys } from '../../../lib/cache';
import { Prisma, } from '../../../lib/prisma';
import { locationService } from './location.service';
import { mediaService } from './media.service';

type Amenity = {
    name: string;
    photoUrl: string; 
}



export const propertyService = {

  async createProperty({ user, body, files }: any) {

    const location = await locationService.resolve(
      body.neighborhood,
      body.city
    );

    const property = await Prisma.$transaction(async (tx) => {

      const created = await tx.property.create({
        data: {
          ...body,
          userId: user.id,
          location,

          amenities: {
            create: body.amenities.map((a: Amenity) => ({
              name: a.name.trim(),
              photoUrl: a.photoUrl.trim()
            }))
          },

          features: body.features.map((f: string) => f.trim()),

          bedrooms: Number(body.bedrooms),
          bathrooms: Number(body.bathrooms),
          floors: Number(body.floors),
          yearBuilt: Number(body.yearBuilt),

          price: {
            amount: Number(body.price.amount),
            currency: body.price.currency
          },

          isFeatureProperty: ["ADMIN", "SUPER_ADMIN"].includes(user.role)
        }
      });

      const adminPermission = await tx.adminPermission.findUnique({
        where: { userId: user.id }
      });

      if (adminPermission?.action?.includes("PROPERTY")) {

        await tx.property.update({
          where: { id: created.id },
          data: {
            status: "APPROVED",
            approvedBy: { connect: { id: user.id } }
          }
        });

      }

      return created;

    });

    if (files) {
      await mediaService.queueUploads(property.id, files);
    }

    await deleteMatchingKeys(`getPropertiesByUser:${user.id}`);

    return property;

  }

};