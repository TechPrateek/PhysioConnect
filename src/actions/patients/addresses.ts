"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { addressSchema, AddressInput } from "@/features/patients/schemas";
import { ActionResult } from "@/actions/types";

export interface AddressRecord {
  id: string;
  patientId: string;
  label: string;
  street: string;
  landmark: string | null;
  area: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: Date;
}

export async function getPatientAddressesAction(): Promise<
  ActionResult<AddressRecord[]>
> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PATIENT") {
      return {
        success: false,
        error: "Unauthorized access.",
      };
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return {
        success: false,
        error: "Patient record not found.",
      };
    }

    const addresses = await prisma.address.findMany({
      where: {
        patientId: patient.id,
        deletedAt: null,
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return {
      success: true,
      data: addresses.map((addr) => ({
        id: addr.id,
        patientId: addr.patientId,
        label: addr.label,
        street: addr.street,
        landmark: addr.landmark,
        area: addr.area,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        isDefault: addr.isDefault,
        createdAt: addr.createdAt,
      })),
    };
  } catch (error) {
    console.error("getPatientAddressesAction error:", error);
    return {
      success: false,
      error: "Failed to load addresses.",
    };
  }
}

export async function createAddressAction(
  input: AddressInput
): Promise<ActionResult<{ addressId: string; message: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PATIENT") {
      return {
        success: false,
        error: "Unauthorized access.",
      };
    }

    const validated = addressSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid address data",
      };
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return {
        success: false,
        error: "Patient record not found.",
      };
    }

    const existingCount = await prisma.address.count({
      where: { patientId: patient.id, deletedAt: null },
    });

    // If this is the first address, make it default automatically
    const shouldBeDefault = existingCount === 0 || validated.data.isDefault;

    const newAddress = await prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        // Unset previous defaults
        await tx.address.updateMany({
          where: { patientId: patient.id },
          data: { isDefault: false },
        });
      }

      const created = await tx.address.create({
        data: {
          patientId: patient.id,
          label: validated.data.label,
          street: validated.data.street,
          landmark: validated.data.landmark || null,
          area: validated.data.area,
          city: validated.data.city,
          state: validated.data.state,
          pincode: validated.data.pincode,
          isDefault: shouldBeDefault,
        },
      });

      return created;
    });

    revalidatePath("/dashboard/patient");
    revalidatePath("/dashboard/patient/addresses");

    return {
      success: true,
      data: {
        addressId: newAddress.id,
        message: "Address saved successfully.",
      },
    };
  } catch (error) {
    console.error("createAddressAction error:", error);
    return {
      success: false,
      error: "Failed to create address.",
    };
  }
}

export async function updateAddressAction(
  addressId: string,
  input: AddressInput
): Promise<ActionResult<{ success: boolean; message: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PATIENT") {
      return {
        success: false,
        error: "Unauthorized access.",
      };
    }

    const validated = addressSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid address data",
      };
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return {
        success: false,
        error: "Patient record not found.",
      };
    }

    // Verify ownership
    const existing = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existing || existing.patientId !== patient.id) {
      return {
        success: false,
        error: "Address not found or unauthorized.",
      };
    }

    await prisma.$transaction(async (tx) => {
      if (validated.data.isDefault && !existing.isDefault) {
        await tx.address.updateMany({
          where: { patientId: patient.id },
          data: { isDefault: false },
        });
      }

      await tx.address.update({
        where: { id: addressId },
        data: {
          label: validated.data.label,
          street: validated.data.street,
          landmark: validated.data.landmark || null,
          area: validated.data.area,
          city: validated.data.city,
          state: validated.data.state,
          pincode: validated.data.pincode,
          isDefault: validated.data.isDefault,
        },
      });
    });

    revalidatePath("/dashboard/patient/addresses");

    return {
      success: true,
      data: {
        success: true,
        message: "Address updated successfully.",
      },
    };
  } catch (error) {
    console.error("updateAddressAction error:", error);
    return {
      success: false,
      error: "Failed to update address.",
    };
  }
}

export async function deleteAddressAction(
  addressId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PATIENT") {
      return {
        success: false,
        error: "Unauthorized access.",
      };
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return {
        success: false,
        error: "Patient record not found.",
      };
    }

    const existing = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!existing || existing.patientId !== patient.id) {
      return {
        success: false,
        error: "Address not found or unauthorized.",
      };
    }

    // Soft delete address
    await prisma.address.update({
      where: { id: addressId },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/dashboard/patient");
    revalidatePath("/dashboard/patient/addresses");

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error("deleteAddressAction error:", error);
    return {
      success: false,
      error: "Failed to delete address.",
    };
  }
}

export async function setDefaultAddressAction(
  addressId: string
): Promise<ActionResult<{ success: boolean }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "PATIENT") {
      return {
        success: false,
        error: "Unauthorized access.",
      };
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) {
      return {
        success: false,
        error: "Patient record not found.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { patientId: patient.id },
        data: { isDefault: false },
      });

      await tx.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });
    });

    revalidatePath("/dashboard/patient/addresses");

    return {
      success: true,
      data: { success: true },
    };
  } catch (error) {
    console.error("setDefaultAddressAction error:", error);
    return {
      success: false,
      error: "Failed to set default address.",
    };
  }
}
