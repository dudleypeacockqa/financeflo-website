import { publicProcedure, protectedProcedure, router } from "../trpc";
import { z } from "zod";
import {
  createWorkshopRegistration, getWorkshopRegistrationsByWorkshopId,
  updateWorkshopStatus,
} from "../db";
import { sendToGHL } from "../ghl";

export const workshopRouter = router({
  register: publicProcedure
    .input(z.object({
      leadId: z.number(),
      workshopId: z.string(),
      workshopTitle: z.string(),
    }))
    .mutation(async ({ input }) => {
      const reg = await createWorkshopRegistration({
        leadId: input.leadId,
        workshopId: input.workshopId,
        workshopTitle: input.workshopTitle,
      });

      sendToGHL("workshop_registered", {
        registrationId: reg.id,
        leadId: input.leadId,
        workshopId: input.workshopId,
        workshopTitle: input.workshopTitle,
      }).catch(err => console.error("[GHL] Failed to send workshop reg:", err));

      return reg;
    }),

  listByWorkshop: protectedProcedure
    .input(z.object({ workshopId: z.string() }))
    .query(async ({ input }) => {
      return getWorkshopRegistrationsByWorkshopId(input.workshopId);
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["registered", "confirmed", "attended", "no_show", "cancelled"]),
    }))
    .mutation(async ({ input }) => {
      await updateWorkshopStatus(input.id, input.status);
      return { success: true };
    }),
});
