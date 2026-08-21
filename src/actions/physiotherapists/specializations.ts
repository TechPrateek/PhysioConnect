"use server";

import { prisma } from "@/lib/prisma";
import { ActionResult } from "@/actions/types";

export interface SpecializationItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

export async function getSpecializationsAction(): Promise<
  ActionResult<SpecializationItem[]>
> {
  try {
    const specializations = await prisma.specialization.findMany({
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: specializations,
    };
  } catch (error) {
    console.error("getSpecializationsAction error:", error);
    return {
      success: false,
      error: "Failed to load clinical specializations.",
    };
  }
}
