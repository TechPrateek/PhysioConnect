"use server";

import { destroySession } from "@/lib/auth/session";
import { ActionResult } from "@/actions/types";

export async function logoutAction(): Promise<ActionResult<{ success: boolean }>> {
  try {
    await destroySession();
    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error("logoutAction error:", error);
    return {
      success: false,
      error: "Failed to logout cleanly.",
    };
  }
}
