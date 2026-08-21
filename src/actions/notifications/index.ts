"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { ActionResult } from "@/actions/types";

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

export async function getUserNotificationsAction(): Promise<
  ActionResult<{ notifications: NotificationRecord[]; unreadCount: number }>
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.notification.count({
        where: { userId: user.id, isRead: false },
      }),
    ]);

    return {
      success: true,
      data: {
        notifications: notifications.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          type: n.type,
          link: n.link,
          isRead: n.isRead,
          createdAt: n.createdAt,
        })),
        unreadCount,
      },
    };
  } catch (error) {
    console.error("getUserNotificationsAction error:", error);
    return {
      success: false,
      error: "Failed to load notifications.",
    };
  }
}

export async function markNotificationReadAction(
  notificationId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.notification.updateMany({
      where: { id: notificationId, userId: user.id },
      data: { isRead: true },
    });

    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("markNotificationReadAction error:", error);
    return { success: false, error: "Failed to update notification." };
  }
}

export async function markAllNotificationsReadAction(): Promise<
  ActionResult<{ success: boolean }>
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });

    return { success: true, data: { success: true } };
  } catch (error) {
    console.error("markAllNotificationsReadAction error:", error);
    return { success: false, error: "Failed to clear unread notifications." };
  }
}
