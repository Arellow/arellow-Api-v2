import express from "express";
import authenticate, { isAdmin } from "../../../middlewares/auth.middleware";
// import { getUserEarnings, withdrawReward } from "../contollers/reward";
// import { getRewardDetails, getRewardsOverview } from "../contollers/rewardDashboard";


const rewardRoutes = express.Router();

// rewardRoutes.post("/withdraw",authenticate, withdrawReward);
// rewardRoutes.get("/earnings", authenticate, getUserEarnings);

//super admin routes
// rewardRoutes.get("/rewardOverview", authenticate, isAdmin, getRewardsOverview);
// rewardRoutes.get("/rewardDetails/:userId", authenticate, isAdmin, getRewardDetails);


export default rewardRoutes;