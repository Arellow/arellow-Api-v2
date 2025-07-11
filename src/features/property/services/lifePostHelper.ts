import { Prisma } from "../../../lib/prisma";

export const likePostHelper = async(userId:string) => {

     const likes = await Prisma.userPropertyLike.findMany({
          where: { userId, },
          include: {
            property: {
              include: {
                media: {
                  select: {
                    url: true,
                    altText: true,
                    type: true,
                    photoType: true,
                    sizeInKB: true
    
                  }
                },
                user: {
                  select: {
                    email: true,
                    fullname: true,
                    username: true,
                    is_verified: true,
                    avatar: true,
                    approvedProperties: {
                      include: {
                        _count: true
                      }
                    }
    
                  }
                }
              },
            }
          },
        });


        console.log({likes})
    
    // return  likes.map((like) => like.property);
    return likes;

}