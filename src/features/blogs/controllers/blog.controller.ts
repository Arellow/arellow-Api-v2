import { NextFunction, Request, Response } from "express";
import { Prisma, } from '../../../lib/prisma';
import CustomResponse from "../../../utils/helpers/response.util";
import { InternalServerError } from "../../../lib/appError";
import { deleteImage, processImage } from "../../../utils/imagesprocess";
import { actionRole } from "@prisma/client";
import { getDateRange } from "../../../utils/getDateRange";
import { swrCache } from "../../../lib/cache";


export const createBlog = async (req: Request, res: Response, next: NextFunction) => {

    const {
        title,
        content,
    } = req.body;

  const timeToRead = calculateTimeToRead(content);

    const isAdmin = await adminRequireRole(req, res);

    try {

        const userId = req.user?.id!;

        const parsedTags: [] = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags || '[]') : req.body.tags;
    
    const parsedsocialMediaLinks = typeof req.body.socialMediaLinks === 'string' ? JSON.parse(req.body.socialMediaLinks || '{}') : req.body.socialMediaLinks;



        if (!req.file) {
            return next(new InternalServerError("Avatar not found", 404));
        }


        const banner = await processImage({
            folder: "blog_container",
            image: req.file,
            photoType: "BLOG",
            type: "PHOTO"
        });



        if (!banner) {
            return next(new InternalServerError("Avatar upload failed", 404));
        }

      

        await Prisma.blog.create({
            data: {
                userId,
                title,
                content,

                socialMediaLinks: parsedsocialMediaLinks,
                tags: parsedTags,
                banner,
                category: isAdmin ? "INTERNAL" : "EXTERNAL",
                status: isAdmin ? "APPROVED" : "PENDING",
                timeToRead    
            }
        })



        new CustomResponse(201, true, "Blog created", res,);

    } catch (error: any) {
        next(new InternalServerError("Internal server error", 500));
    }

};



export const editBlog = async (req: Request, res: Response, next: NextFunction) => {

    const {
        title,
        content,
    } = req.body;

  const timeToRead = calculateTimeToRead(content);

    const isAdmin = await adminRequireRole(req, res);
     const { id } = req.params;

    try {

        const userId = req.user?.id!;

        const parsedTags: [] = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags || '[]') : req.body.tags;
    
    const parsedsocialMediaLinks = typeof req.body.socialMediaLinks === 'string' ? JSON.parse(req.body.socialMediaLinks || '{}') : req.body.socialMediaLinks;



        if (!req.file) {
            return next(new InternalServerError("Avatar not found", 404));
        }


        const banner = await processImage({
            folder: "blog_container",
            image: req.file,
            photoType: "BLOG",
            type: "PHOTO"
        });



        if (!banner) {
            return next(new InternalServerError("Avatar upload failed", 404));
        }

          const blog = await Prisma.blog.findUnique({ where: { id } });
        
            if (blog) {
              await deleteImage(blog.banner);

            }

      

        await Prisma.blog.update({
            where: {id},
            data: {
                title,
                content,

                socialMediaLinks: parsedsocialMediaLinks,
                tags: parsedTags,
                banner,
                category: isAdmin ? "INTERNAL" : "EXTERNAL",
                status: isAdmin ? "APPROVED" : "PENDING",
                timeToRead    
            }
        })



        new CustomResponse(201, true, "Blog updated", res,);

    } catch (error: any) {
        next(new InternalServerError("Internal server error", 500));
    }

};







export const getBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { page = "1", limit = "10", filterTime = "this_year" } = req.query;

    const { current, previous } = getDateRange(filterTime.toString());
    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    const cacheKey = `getBlogs`;

    const result = await swrCache(cacheKey, async () => {
      const baseWhere = { userId, archived: false };

      const [data, total] = await Promise.all([
        Prisma.blog.findMany({
          where: baseWhere,
          
          orderBy: { createdAt: "desc" },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize
        }),
        Prisma.property.count({ where: baseWhere })
      ]);

    

      const totalPages = Math.ceil(total / pageSize);

      return {
        data,
        pagination: {
          total,
          page: pageNumber,
          pageSize,
          totalPages,
          nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
          prevPage: pageNumber > 1 ? pageNumber - 1 : null,
          canGoNext: pageNumber < totalPages,
          canGoPrev: pageNumber > 1
        }
      };
    });

    new CustomResponse(200, true, "success", res, result);
  } catch (error) {
    console.error(error);
    next(new InternalServerError("Server Error", 500));
  }
};








const adminRequireRole = async (req: Request, res: Response) => {

    const user = req.user;


    const allowedRoles: actionRole[] = ["BLOG"];


    if (!user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }


    if (user?.role == "SUPER_ADMIN") {
        return true;
    }

    try {
        const adminPermission = await Prisma.adminPermission.findUnique({
            where: { userId: user.id },
        });

        if (!adminPermission || !adminPermission.action.length) {
            return false
        }

        const hasAccess = adminPermission.action.some((role) =>
            allowedRoles.includes(role)
        );

        if (!hasAccess) {
            return false
        }


        return true;
    } catch (error) {
        // console.error("adminRequireRole error:", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }

};

const calculateTimeToRead = (content: string) => {
    const wordsPerMinute = 200; 
    const wordCount = content.split(/\s+/).length; 
    return Math.ceil(wordCount / wordsPerMinute);  
};

