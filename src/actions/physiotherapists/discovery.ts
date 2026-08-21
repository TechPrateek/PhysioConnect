"use server";

import { prisma } from "@/lib/prisma";
import {
  searchPhysioSchema,
  SearchPhysioInput,
  slotQuerySchema,
  SlotQueryInput,
} from "@/features/physiotherapists/schemas";
import { ActionResult } from "@/actions/types";
import { DayOfWeek, VerificationStatus, Prisma } from "@prisma/client";

export interface PhysioSearchResult {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  experienceYears: number;
  consultationFee: number;
  bio: string | null;
  languages: string[];
  clinicAddress: string | null;
  homeVisitAvailable: boolean;
  clinicVisitAvailable: boolean;
  averageRating: number;
  totalReviews: number;
  city: string;
  state: string;
  specializations: { id: string; name: string; slug: string }[];
}

export interface TimeSlotOption {
  timeSlot: string; // e.g. "10:00 AM"
  rawTime: string;  // e.g. "10:00"
  isAvailable: boolean;
  reason?: string;
}

export async function searchPhysiotherapistsAction(
  input: Partial<SearchPhysioInput> = {}
): Promise<ActionResult<PhysioSearchResult[]>> {
  try {
    const validated = searchPhysioSchema.safeParse(input);
    const filters: SearchPhysioInput = validated.success
      ? validated.data
      : { visitType: "ALL", sortBy: "rating" };

    const whereClause: Prisma.PhysiotherapistWhereInput = {
      verificationStatus: VerificationStatus.APPROVED,
      deletedAt: null,
      city: { equals: "Etawah", mode: "insensitive" },
    };

    if (filters.visitType === "HOME_VISIT") {
      whereClause.homeVisitAvailable = true;
    } else if (filters.visitType === "CLINIC_VISIT") {
      whereClause.clinicVisitAvailable = true;
    }

    if (filters.maxFee && filters.maxFee > 0) {
      whereClause.consultationFee = { lte: filters.maxFee };
    }

    if (filters.specialization && filters.specialization !== "all") {
      whereClause.specializations = {
        some: {
          specialization: {
            OR: [
              { slug: filters.specialization },
              { id: filters.specialization },
            ],
          },
        },
      };
    }

    if (filters.query && filters.query.trim().length > 0) {
      const q = filters.query.trim();
      whereClause.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { bio: { contains: q, mode: "insensitive" } },
        { clinicAddress: { contains: q, mode: "insensitive" } },
      ];
    }

    let orderBy: Prisma.PhysiotherapistOrderByWithRelationInput = {
      averageRating: "desc",
    };

    if (filters.sortBy === "experience") {
      orderBy = { experienceYears: "desc" };
    } else if (filters.sortBy === "fee_asc") {
      orderBy = { consultationFee: "asc" };
    } else if (filters.sortBy === "fee_desc") {
      orderBy = { consultationFee: "desc" };
    }

    const physios = await prisma.physiotherapist.findMany({
      where: whereClause,
      orderBy,
      include: {
        specializations: {
          include: {
            specialization: true,
          },
        },
      },
    });

    return {
      success: true,
      data: physios.map((p) => ({
        id: p.id,
        fullName: p.fullName,
        phone: p.phone,
        email: p.email,
        experienceYears: p.experienceYears,
        consultationFee: p.consultationFee,
        bio: p.bio,
        languages: p.languages,
        clinicAddress: p.clinicAddress,
        homeVisitAvailable: p.homeVisitAvailable,
        clinicVisitAvailable: p.clinicVisitAvailable,
        averageRating: p.averageRating,
        totalReviews: p.totalReviews,
        city: p.city,
        state: p.state,
        specializations: p.specializations.map((s) => ({
          id: s.specialization.id,
          name: s.specialization.name,
          slug: s.specialization.slug,
        })),
      })),
    };
  } catch (error) {
    console.error("searchPhysiotherapistsAction error:", error);
    return {
      success: false,
      error: "Failed to search physiotherapists in Etawah.",
    };
  }
}

export async function getPhysiotherapistDetailsAction(
  physioId: string
): Promise<
  ActionResult<
    PhysioSearchResult & {
      availability: {
        dayOfWeek: DayOfWeek;
        startTime: string;
        endTime: string;
        isHomeVisit: boolean;
        isClinicVisit: boolean;
      }[];
      recentReviews: {
        id: string;
        rating: number;
        comment: string | null;
        patientName: string;
        createdAt: Date;
      }[];
    }
  >
> {
  try {
    const physio = await prisma.physiotherapist.findUnique({
      where: { id: physioId },
      include: {
        specializations: {
          include: {
            specialization: true,
          },
        },
        availability: {
          where: { isActive: true },
        },
        reviews: {
          where: { isPublished: true },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            patient: {
              select: { fullName: true },
            },
          },
        },
      },
    });

    if (!physio || physio.deletedAt) {
      return {
        success: false,
        error: "Physiotherapist not found.",
      };
    }

    return {
      success: true,
      data: {
        id: physio.id,
        fullName: physio.fullName,
        phone: physio.phone,
        email: physio.email,
        experienceYears: physio.experienceYears,
        consultationFee: physio.consultationFee,
        bio: physio.bio,
        languages: physio.languages,
        clinicAddress: physio.clinicAddress,
        homeVisitAvailable: physio.homeVisitAvailable,
        clinicVisitAvailable: physio.clinicVisitAvailable,
        averageRating: physio.averageRating,
        totalReviews: physio.totalReviews,
        city: physio.city,
        state: physio.state,
        specializations: physio.specializations.map((s) => ({
          id: s.specialization.id,
          name: s.specialization.name,
          slug: s.specialization.slug,
        })),
        availability: physio.availability.map((a) => ({
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
          isHomeVisit: a.isHomeVisit,
          isClinicVisit: a.isClinicVisit,
        })),
        recentReviews: physio.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          patientName: r.patient.fullName,
          createdAt: r.createdAt,
        })),
      },
    };
  } catch (error) {
    console.error("getPhysiotherapistDetailsAction error:", error);
    return {
      success: false,
      error: "Failed to load practitioner profile.",
    };
  }
}

// Map JavaScript getDay() (0=Sunday, 1=Monday, ..., 6=Saturday) to Prisma DayOfWeek
const JS_DAY_TO_ENUM: Record<number, DayOfWeek> = {
  0: DayOfWeek.SUNDAY,
  1: DayOfWeek.MONDAY,
  2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY,
  4: DayOfWeek.THURSDAY,
  5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
};

function formatMinutesToTime(totalMinutes: number): string {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  const minuteStr = minute > 0 ? `:${minute.toString().padStart(2, "0")}` : ":00";
  return `${displayHour}${minuteStr} ${period}`;
}

function parseTimeToMinutes(timeStr: string): number {
  const parts = timeStr.split(":");
  const hour = parseInt(parts[0], 10) || 0;
  const minute = parseInt(parts[1] || "0", 10) || 0;
  return hour * 60 + minute;
}

export async function getAvailableSlotsAction(
  input: SlotQueryInput
): Promise<ActionResult<{ slots: TimeSlotOption[]; message?: string }>> {
  try {
    const validated = slotQuerySchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid slot query parameters",
      };
    }

    const { physiotherapistId, date, appointmentType } = validated.data;

    // Parse date as midnight UTC or local date
    const targetDate = new Date(`${date}T00:00:00.000Z`);
    const jsDay = targetDate.getUTCDay();
    const dayOfWeekEnum = JS_DAY_TO_ENUM[jsDay];

    // 1. Fetch practitioner availability intervals for this day of week
    const availabilities = await prisma.availability.findMany({
      where: {
        physiotherapistId,
        dayOfWeek: dayOfWeekEnum,
        isActive: true,
      },
    });

    if (!availabilities || availabilities.length === 0) {
      return {
        success: true,
        data: {
          slots: [],
          message: `The physiotherapist is not available on ${dayOfWeekEnum.toLowerCase()}s. Please select another date.`,
        },
      };
    }

    // Filter intervals matching the requested appointment type
    const matchingIntervals = availabilities.filter((a) =>
      appointmentType === "HOME_VISIT" ? a.isHomeVisit : a.isClinicVisit
    );

    if (matchingIntervals.length === 0) {
      return {
        success: true,
        data: {
          slots: [],
          message: `${
            appointmentType === "HOME_VISIT" ? "Home visits" : "Clinic consultations"
          } are not available on this day for this practitioner.`,
        },
      };
    }

    // 2. Fetch existing booked slots for this exact date
    const existingBookings = await prisma.booking.findMany({
      where: {
        physiotherapistId,
        appointmentDate: targetDate,
        status: {
          notIn: ["CANCELLED", "REJECTED"],
        },
      },
      select: {
        timeSlot: true,
      },
    });

    const bookedSlotSet = new Set(
      existingBookings.map((b) => b.timeSlot.trim().toUpperCase())
    );

    // 3. Generate slots across all valid intervals for the day
    const slots: TimeSlotOption[] = [];
    const generatedRawTimes = new Set<string>();

    for (const interval of matchingIntervals) {
      const startMin = parseTimeToMinutes(interval.startTime);
      const endMin = parseTimeToMinutes(interval.endTime);
      const step = interval.slotDurationMinutes > 0 ? interval.slotDurationMinutes : 60;

      for (let currMin = startMin; currMin + step <= endMin; currMin += step) {
        const hour = Math.floor(currMin / 60);
        const min = currMin % 60;
        const rawTime = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;

        if (generatedRawTimes.has(rawTime)) continue;
        generatedRawTimes.add(rawTime);

        const formattedSlot = formatMinutesToTime(currMin);
        const isBooked = bookedSlotSet.has(formattedSlot.toUpperCase());

        slots.push({
          timeSlot: formattedSlot,
          rawTime,
          isAvailable: !isBooked,
          reason: isBooked ? "Already Booked" : undefined,
        });
      }
    }

    // Sort slots chronologically
    slots.sort((a, b) => a.rawTime.localeCompare(b.rawTime));

    return {
      success: true,
      data: {
        slots,
      },
    };
  } catch (error) {
    console.error("getAvailableSlotsAction error:", error);
    return {
      success: false,
      error: "Failed to load availability slots.",
    };
  }
}
