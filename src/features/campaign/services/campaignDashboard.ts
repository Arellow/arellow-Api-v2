
import { Prisma, PrismaClient } from "@prisma/client";
import { InternalServerError } from "../../../lib/appError";
import { AnalyticsResponse } from "../dtos/dashboard";

const prisma = new PrismaClient();

// export class CampaignAnalyticsService {
//   private prisma: PrismaClient = prisma;

//   async getAnalytics(): Promise<AnalyticsResponse> {
//     try {
//       // Campaign Overview (aggregated metrics)
//       const overview = await this.prisma.campaign.aggregate({
//         _sum: {
//           clicks: true,
//           conversions: true,
//           spend: true,
//         },
//       });

//       // Check if data is present (all sums are 0 or undefined indicates no data)
//       const hasData = overview._sum?.clicks !== undefined && 
//                      (overview._sum?.clicks || 0) > 0 || 
//                      (overview._sum?.conversions || 0) > 0 || 
//                      (overview._sum?.spend || 0) > 0;

//       if (!hasData) {
//         // Mock data when no real data is present
//         const mockData: AnalyticsResponse = {
//           overview: {
//             totalClicks: 50000,
//             totalConversions: 40000,
//             totalBudgetSpent: 1000000,
//             trendData: [
//               { date: "2025-01-01", clicks: 8000, conversions: 6000 },
//               { date: "2025-02-01", clicks: 8500, conversions: 6500 },
//               { date: "2025-03-01", clicks: 9000, conversions: 7000 },
//               { date: "2025-04-01", clicks: 9500, conversions: 7500 },
//               { date: "2025-05-01", clicks: 10000, conversions: 8000 },
//               { date: "2025-06-01", clicks: 10500, conversions: 8500 },
//             ],
//           },
//           topPerforming: [
//             { campaignName: "Summer Sale", platform: "Instagram", percentage: 45 },
//             { campaignName: "Winter Promo", platform: "Facebook", percentage: 35 },
//             { campaignName: "Holiday Deals", platform: "X", percentage: 20 },
//           ],
//           performance: [
//             {
//               campaignName: "Summer Sale",
//               impressions: 1000,
//               clicks: 250,
//               conversions: 200,
//               cpc: 20.0,
//               spend: 5000,
              
//             },
//             {
//               campaignName: "Winter Promo",
//               impressions: 1200,
//               clicks: 300,
//               conversions: 250,
//               cpc: 16.67,
//               spend: 5000,
              
//             },
//           ],
//         };
//         return mockData;
//       }

//       // Trend Data (simplified monthly aggregation for the last 6 months)
//       const trendData = await this.prisma.campaign.groupBy({
//         by: ["startDate"],
//         _sum: {
//           clicks: true,
//           conversions: true,
//         },
//         orderBy: {
//           startDate: "asc",
//         },
//         take: 6,
//       }).then(data =>
//         data.map(item => ({
//           date: item.startDate.toISOString().split("T")[0],
//           clicks: item._sum.clicks || 0,
//           conversions: item._sum.conversions || 0,
//         }))
//       );

//       // Top 3 Performing Campaigns (based on conversions, example logic)
//       const topPerforming = await this.prisma.campaign.groupBy({
//         by: ["localMediaName", "mediaPlatforms"],
//         _sum: {
//           conversions: true,
//         },
//         orderBy: {
//           _sum: { conversions: "desc" },
//         },
//         take: 3,
//       }).then(data => {
//         const totalConversions = data.reduce((sum, item) => sum + (item._sum.conversions || 0), 0);
//         return data.map(item => ({
//           campaignName: item.localMediaName,
//           platform: (item.mediaPlatforms as string[])[0] || "Unknown",
//           percentage: totalConversions > 0 ? ((item._sum.conversions || 0) / totalConversions) * 100 : 0,
//         }));
//       });

//       // Campaign Performance (detailed metrics)
//       const performance = await this.prisma.campaign.findMany({
//         select: {
//           localMediaName: true,
//           impressions: true,
//           clicks: true,
//           conversions: true,
//           cpc: true,
//           spend: true,
         
//         },
//       }).then(data =>
//         data.map(item => ({
//           campaignName: item.localMediaName,
//           impressions: item.impressions || 0,
//           clicks: item.clicks || 0,
//           conversions: item.conversions || 0,
//           cpc: item.cpc || 0,
//           spend: item.spend || 0,
//           budgetSpent: item.spend || 0,
//         }))
//       );

//       return {
//         overview: {
//           totalClicks: overview._sum?.clicks || 0,
//           totalConversions: overview._sum?.conversions || 0,
//           totalBudgetSpent: overview._sum?.spend || 0,
//           trendData,
//         },
//         topPerforming,
//         performance,
//       };
//     } catch (error) {
//       console.error("[getAnalytics] Prisma error:", error);
//       throw new InternalServerError("Failed to fetch campaign analytics.");
//     }
//   }}