import { NextFunction, Request, Response } from "express";
import { Prisma, } from '../../../lib/prisma';
import CustomResponse from "../../../utils/helpers/response.util";
import { InternalServerError, UnAuthorizedError } from "../../../lib/appError";
import { deleteImage, processImage } from "../../../utils/imagesprocess";
import {Prisma as prisma, actionRole, BlogCategory, BlogStatus } from "@prisma/client";
import { getDateRange } from "../../../utils/getDateRange";
import { deleteMatchingKeys, swrCache } from "../../../lib/cache";
import { mailController } from "../../../utils/nodemailer";
import { BlogRejectiontMailOption } from "../../../utils/mailer";

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


export const getBlogsContributors = async (req: Request, res: Response, next: NextFunction) => {
  try {
  
    const { page = "1", limit = "10", filterTime = "this_year" } = req.query;
  const search = (req.query.search as string) || "";

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    
    const cacheKey = `getBlogsContributors:${JSON.stringify(req.query)}`;

        const filters: prisma.BlogWhereInput = {
          status: "APPROVED",
          AND: [
            search
              ? {
                OR: [
                  { user: {fullname:  iSearch(search)} },
                  { user: {description:  iSearch(search)} },
                ].filter(Boolean)
              }
              : undefined,
    
           
          ].filter(Boolean) as prisma.BlogWhereInput[]
        };


    const result = await swrCache(cacheKey, async () => {
     
      const [ total, contributorsRaw] = await Promise.all([
        Prisma.blog.count({ where: filters}),
        Prisma.blog.findMany({
          where: filters,
          distinct: ["userId"], 
          select: {user: {select: {id: true, fullname: true, avatar: true, description: true}}}   
        }),

      ]);


      const totalPages = Math.ceil(total / pageSize);
      const contributors = contributorsRaw.map(c => c.user).slice(0,4);

      return {
       data: contributors,
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
    console.log(error);
    next(new InternalServerError("Server Error", 500));
  }
};



export const getBlogContributorDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const { id: userId } = req.params;
    const { page = "1", limit = "10", } = req.query;
  const search = (req.query.search as string) || "";

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

 
    const cacheKey = `getBlogs:${userId}:${JSON.stringify(req.query)}`;

        const filters: prisma.BlogWhereInput = {
          status:  "APPROVED",
          AND: [
            search
              ? {
                OR: [
                  { title: iSearch(search) },
                ].filter(Boolean)
              }
              : undefined,
    
           
          ].filter(Boolean) as prisma.BlogWhereInput[]
        };


    const result = await swrCache(cacheKey, async () => {
     
      const [data, total, userDetail] = await Promise.all([
        Prisma.blog.findMany({
          where: filters,   
          orderBy: { createdAt: "desc" },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize
        }),
        Prisma.blog.count({ where: filters}),
        Prisma.user.findUnique({
          where: {id: userId},
           select: {id: true, fullname: true, avatar: true, description: true}
        })

      ]);


      const totalPages = Math.ceil(total / pageSize);
      

      return {
        ...{
          userDetail,
          blogs: data,
        },
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
    // console.error(error);
    next(new InternalServerError("Server Error", 500));
  }
};


export const getBlogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { page = "1", limit = "10", filterTime = "this_year" } = req.query;
  const search = (req.query.search as string) || "";

    const { current, previous } = getDateRange(filterTime.toString());
    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    
    const isAdmin = req.user?.role == "SUPER_ADMIN" || req.user?.role == "ADMIN"; 
    
    const cacheKey = `getBlogs:${isAdmin ? "admin": userId}:${JSON.stringify(req.query)}`;

        const filters: prisma.BlogWhereInput = {
          ...req?.query?.isLanding !== "true" &&  {category : req?.query?.category as BlogCategory || "INTERNAL"}, 
          ...req?.query?.isLanding !== "true" &&  {status: req?.query?.status as BlogStatus},
          ...req?.query?.isLanding !== "true" &&  {createdAt: { gte: current.start, lte: current.end }},
          ...req?.query?.isLanding !== "true" &&  {userId: isAdmin ? undefined : userId},
          AND: [
            search
              ? {
                OR: [
                  { title: iSearch(search) },
                ].filter(Boolean)
              }
              : undefined,
    
           
          ].filter(Boolean) as prisma.BlogWhereInput[]
        };


    const result = await swrCache(cacheKey, async () => {
     
      const [data, total, contributorsRaw] = await Promise.all([
        Prisma.blog.findMany({
          where: filters,   
          orderBy: { createdAt: "desc" },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize
        }),
        Prisma.blog.count({ where: filters}),
        Prisma.blog.findMany({
          where: {status: "APPROVED"},
          distinct: ["userId"], 
          select: {user: {select: {id: true, fullname: true, avatar: true, description: true}}}   
        }),

      ]);


      const totalPages = Math.ceil(total / pageSize);
      const contributors = contributorsRaw.map(c => c.user).slice(0,4);

      return {
        ...{
          blogs: data,
           ...req?.query?.isLanding === "true" && {contributors},
        },
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




export const changeBlogStatus = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  const blogId = req.params.id;
  const { blogStatus , rejectionReason} = req.body;

  const isAdmin = req.user?.role === "ADMIN" || req.user?.role === "SUPER_ADMIN";


    if (blogStatus == BlogStatus.REJECTED && !rejectionReason) {
      return next(new InternalServerError("Rejection reason is required", 400));
    }


  try {

    const blog = await Prisma.blog.findUnique({ where: { id: blogId }, select: {userId: true, user: {select: {email:true, username: true}}} });
    if (!blog) {
      return next(new InternalServerError("blog not found", 404));
    }


    // Ownership check:
    if (!isAdmin && blog.userId !== userId) {

      return next(new UnAuthorizedError("Forbidden: only owner can update status", 403));
    }

    await Prisma.blog.update({
      where: { id: blogId },
      data: {
        status: blogStatus,
      },
    });

    if(blogStatus == BlogStatus.REJECTED){

          const mailOptions = await BlogRejectiontMailOption({
                       email: blog.user.email,
                       rejectionReason,
                       userName: blog.user.username
                       
                       });
            
                       
        mailController({from: "info@arellow.com", ...mailOptions});


    }

    

      const cacheKey = `getBlogs`;
        await deleteMatchingKeys(cacheKey);


    new CustomResponse(200, true, `status updated to ${blogStatus}`, res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }
};


export const deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id;

  const blogId = req.params.id;
  const isAdmin = await adminRequireRole(req, res);



  try {

    const blog = await Prisma.blog.findUnique({ where: { id: blogId }, select: {userId: true, user: {select: {email:true, username: true}}} });
    if (!blog) {
      return next(new InternalServerError("blog not found", 404));
    }


    // Ownership check:
    if (!isAdmin && blog.userId !== userId) {

      return next(new UnAuthorizedError("Forbidden: only owner can update status", 403));
    }

    await Prisma.blog.delete({
      where: { id: blogId },

    });
    

      const cacheKey = `getBlogs`;
        await deleteMatchingKeys(cacheKey);


    new CustomResponse(200, true, `blog deleted successfully`, res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }
};



export const blogDetail = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

   

    try {

        // find single
        const blog = await Prisma.blog.findUnique({
            where: { id },
            include: {
              user: {
                select: {
                  id: true,
                  fullname: true,
                  description: true,
                  avatar: true, 
                }
              }
            }
        });



        if (!blog) {
            return next(new InternalServerError("blog request not found", 404));
        }


          const recommendedblog = await Prisma.blog.findMany({
            where: { tags: {hasSome: blog.tags}, status: "APPROVED" },
            include: {
              user: {
                select: {
                  id: true,
                  fullname: true,
                  description: true,
                  avatar: true, 
                }
              }
            },
            take: 3
        });


        new CustomResponse(200, true, "successfully", res, {blog, recommendedblog});
    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
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

const iSearch = (field?: string) =>
  field ? { contains: field, mode: "insensitive" } : undefined;
