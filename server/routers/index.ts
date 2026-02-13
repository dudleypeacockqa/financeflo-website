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
import { outreachRouter } from "./outreach";
import { pipelineRouter } from "./pipeline";
import { aibaRouter } from "./aiba";
import { automationRouter } from "./automation";
import { deliveryRouter } from "./delivery";
import { aiRouter } from "./ai";

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

  // Phase 3: Outreach Automation
  outreach: outreachRouter,

  // Phase 4: Sales Pipeline & AIBA
  pipeline: pipelineRouter,
  aiba: aibaRouter,

  // Phase 5: Marketing Automation
  automation: automationRouter,

  // Phase 6: Service Delivery
  delivery: deliveryRouter,

  // AI Features: Chat, Meeting Prep, Content Generation
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
