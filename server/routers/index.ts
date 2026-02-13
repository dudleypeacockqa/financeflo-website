import { router } from "../trpc";
import { systemRouter } from "../systemRouter";
import { authRouter } from "./auth";
import { leadRouter } from "./lead";
import { assessmentRouter } from "./assessment";
import { proposalRouter } from "./proposal";
import { adminRouter } from "./admin";
import { workshopRouter } from "./workshop";
import { knowledgeRouter } from "./knowledge";
import { promptsRouter } from "./prompts";
import { jobsRouter } from "./jobs";
import { leadgenRouter } from "./leadgen";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  lead: leadRouter,
  assessment: assessmentRouter,
  proposal: proposalRouter,
  admin: adminRouter,
  workshop: workshopRouter,

  // Phase 1: Foundation
  knowledge: knowledgeRouter,
  prompts: promptsRouter,
  jobs: jobsRouter,

  // Phase 2: Lead Engine
  leadgen: leadgenRouter,
});

export type AppRouter = typeof appRouter;
