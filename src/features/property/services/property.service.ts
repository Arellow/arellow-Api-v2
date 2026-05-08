import { InternalServerError } from '../../../lib/appError';
import { deleteMatchingKeys } from '../../../lib/cache';
import { Prisma, } from '../../../lib/prisma';
import { CreatePropertyInput } from '../routes/property.validate';
import { cacheService } from './cache.service';
import { locationService } from './location.service';
import { mediaService } from './media.service';
import { rewardService } from './reward.service';

type Amenity = {
    name: string;
    photoUrl: string; 
}



export const propertyService = {


  async createProperty({ user, body, files }: any) {

    const DEFAULT_LOCATION = { lat: 9.6000359, lng: 7.9999721 };

    // Strip frontend-only fields that are not in the Prisma schema
    const { retainedImageUrls: _r, ...propertyBody } = body;

    const property = await Prisma.$transaction(async (tx) => {

      const created = await tx.property.create({
        data: {
          ...propertyBody,
          userId: user.id,
          location: DEFAULT_LOCATION,

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

    // Respond immediately — resolve geocoding and queue media in the background
    setImmediate(async () => {
      try {
        const location = await locationService.resolve(body.neighborhood, body.city);
        await Prisma.property.update({ where: { id: property.id }, data: { location } });
      } catch {}

      try {
        if (files) await mediaService.queueUploads(property.id, files);
      } catch {}
    });

    await cacheService.clearPropertyCache(property.id, property.userId);

    return property;

  },


async updateProperty({ propertyId, user, body, files }: any) {

  const property = await Prisma.property.findUnique({
    where: { id: propertyId }
  });

  if (!property) {
    throw new InternalServerError("Property not found", 404);
  }

  const location = await locationService.resolve(
    body.neighborhood,
    body.city
  );

  const retainedImageUrls: string[] = body.retainedImageUrls
    ? JSON.parse(body.retainedImageUrls)
    : [];

  // Strip frontend-only fields before spreading into Prisma
  const { retainedImageUrls: _r, ...propertyBody } = body;

  await mediaService.deletePropertyMedia(propertyId, retainedImageUrls);

 const updatedProperty = await Prisma.$transaction(async (tx) => {




  const updated = await tx.property.update({
    where: { id: propertyId },
    data: {
      status: "PENDING",
      rejectionReason: null,
      approvedBy: undefined,

      ...propertyBody,

      location,

       amenities: {
      deleteMany: {}, 
      create: body.amenities.map((a: Amenity) => ({
        name: a.name.trim(),
        photoUrl: a.photoUrl.trim(),
      })),
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
    }
  });



    const adminPermission = await tx.adminPermission.findUnique({
        where: { userId: user.id }
      });

      if (adminPermission?.action?.includes("PROPERTY")) {

        await tx.property.update({
          where: { id: updated.id },
          data: {
            status: "APPROVED",
            approvedBy: { connect: { id: user.id } }
          }
        });

      }

return updated;
})

  // Queue media uploads in the background — don't block the response
  setImmediate(async () => {
    try {
      if (files && Object.keys(files).length > 0) {
        await mediaService.queueUploads(updatedProperty.id, files);
      }
    } catch {}
  });

  await rewardService.debitPropertyPoints(updatedProperty);

  await cacheService.clearPropertyCache(
    updatedProperty.id,
    updatedProperty.userId
  );

  return updatedProperty;

},




async createProject({ user, body, files }: any) {

  const location = await locationService.resolve(
    body.neighborhood,
    body.city
  );

  const project = await Prisma.property.create({

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

      price: {
        amount: Number(body.price.amount),
        currency: body.price.currency
      },

      stagePrice: {
        amount: Number(body.stagePrice.amount),
        currency: body.stagePrice.currency
      },

      is_Property_A_Project: true,
      isFeatureProperty: true,
      status: "APPROVED"
    }

  });

  if (files) {

    await mediaService.queueUploads(project.id, files);

  }

  await deleteMatchingKeys(`getPropertiesByUser:${user.id}`);


     await cacheService.clearPropertyCache(
    project.id,
    project.userId
  );

  return project;

},



async updateProject({ propertyId, user, body, files }: any) {




  const property = await Prisma.property.findUnique({
    where: { id: propertyId }
  });

  if (!property) {
    throw new InternalServerError("Property not found", 404);
  }

  const location = await locationService.resolve(
    body.neighborhood,
    body.city
  );

  await mediaService.deletePropertyMedia(propertyId);

 const updatedProject = await Prisma.$transaction(async (tx) => {

  


  const updated = await tx.property.update({
    where: { id: propertyId },
    data: {
      ...body,

      userId: user.id,

      location,

      amenities: {
        deleteMany: {}, 
        create: body.amenities.map((a: Amenity) => ({
          name: a.name.trim(),
          photoUrl: a.photoUrl.trim()
        }))
      },

      features: body.features.map((f: string) => f.trim()),

      bedrooms: Number(body.bedrooms),
      bathrooms: Number(body.bathrooms),
      floors: Number(body.floors),

      price: {
        amount: Number(body.price.amount),
        currency: body.price.currency
      },

      stagePrice: {
        amount: Number(body.stagePrice.amount),
        currency: body.stagePrice.currency
      },

      is_Property_A_Project: true,
      isFeatureProperty: true,
      status: "APPROVED"
    }
  });

return updated;
})

  if (files) {
    await mediaService.queueUploads(updatedProject.id, files);
  }

  await rewardService.debitPropertyPoints(updatedProject);

  await cacheService.clearPropertyCache(
    updatedProject.id,
    updatedProject.userId
  );



  

  return updatedProject;

},





// test scalbility

async createPropertyBusBoy({ user, body }: CreatePropertyInput) {
    const location = await locationService.resolve(body.neighborhood, body.city);


    console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
    console.log({user, body})
    console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")

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

    return property;
  },


};