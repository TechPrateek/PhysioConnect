"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Home,
  Loader2,
  MapPin,
  Navigation,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  addressSchema,
  AddressInput,
  ETAWAH_LOCALITIES,
} from "@/features/patients/schemas";
import {
  AddressRecord,
  createAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/actions/patients/addresses";
import { checkLocationServiceability } from "@/lib/geo";

interface AddressManagerProps {
  initialAddresses: AddressRecord[];
}

export function PatientAddressManager({ initialAddresses }: AddressManagerProps) {
  const router = useRouter();
  const [addresses, setAddresses] = React.useState<AddressRecord[]>(initialAddresses);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "Home",
      street: "",
      landmark: "",
      area: "Friends Colony",
      city: "Etawah",
      state: "Uttar Pradesh",
      pincode: "206001",
      isDefault: false,
    },
  });

  const onSubmit = async (data: AddressInput) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await createAddressAction(data);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to save address");
        setIsLoading(false);
        return;
      }

      setSuccessMessage("Address saved successfully.");
      reset();
      setShowAddForm(false);
      setIsLoading(false);
      router.refresh();
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSetDefault = async (addrId: string) => {
    try {
      const res = await setDefaultAddressAction(addrId);
      if (res.success) {
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, isDefault: a.id === addrId }))
        );
        router.refresh();
      } else {
        alert(res.error || "Failed to set default address");
      }
    } catch (e) {
      alert("Error setting default address");
    }
  };

  const handleDelete = async (addrId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await deleteAddressAction(addrId);
      if (res.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== addrId));
        router.refresh();
      } else {
        alert(res.error || "Failed to delete address");
      }
    } catch (e) {
      alert("Error deleting address");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Saved Addresses for Home Visits
          </h3>
          <p className="text-xs text-muted-foreground">
            Manage your residential addresses in Etawah for door-to-door physiotherapy sessions.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>{showAddForm ? "Cancel" : "Add New Address"}</span>
        </Button>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Add Address Form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 rounded-xl border bg-card p-5 shadow-sm"
        >
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            New Address in Etawah
          </h4>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="label">Address Label (e.g. Home, Parents, Work)</Label>
              <Input
                id="label"
                type="text"
                placeholder="e.g. Home"
                disabled={isLoading}
                {...register("label")}
                className={errors.label ? "border-destructive" : ""}
              />
              {errors.label && (
                <p className="text-[11px] text-destructive">{errors.label.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="area">Area / Locality in Etawah</Label>
              <select
                id="area"
                disabled={isLoading}
                {...register("area")}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {ETAWAH_LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
              {errors.area && (
                <p className="text-[11px] text-destructive">{errors.area.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="street">House / Flat No., Building, Street & Lane</Label>
            <Input
              id="street"
              type="text"
              placeholder="e.g. House No. 104, Lane 3, Near Water Tank"
              disabled={isLoading}
              {...register("street")}
              className={errors.street ? "border-destructive" : ""}
            />
            {errors.street && (
              <p className="text-[11px] text-destructive">{errors.street.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input
                id="landmark"
                type="text"
                placeholder="e.g. Opposite Gyan Mandir School"
                disabled={isLoading}
                {...register("landmark")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                value="Etawah"
                disabled
                className="bg-muted"
                {...register("city")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                type="text"
                placeholder="206001"
                disabled={isLoading}
                {...register("pincode")}
                className={errors.pincode ? "border-destructive" : ""}
              />
              {errors.pincode && (
                <p className="text-[11px] text-destructive">{errors.pincode.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isDefault"
              {...register("isDefault")}
              className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
            />
            <label htmlFor="isDefault" className="text-xs text-muted-foreground cursor-pointer">
              Set as primary address for home visit bookings
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Address"
              )}
            </Button>
          </div>
        </form>
      )}

      {/* Address Cards List */}
      <div className="space-y-3">
        {addresses.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground text-xs space-y-2">
            <MapPin className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="font-medium text-foreground">No saved addresses yet</p>
            <p>
              Add your home address in Etawah so verified physiotherapists can visit your doorstep.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`relative flex flex-col justify-between rounded-xl border p-5 shadow-sm transition-all ${
                  addr.isDefault
                    ? "border-primary/50 bg-primary/[0.02]"
                    : "bg-card"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Home className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {addr.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {checkLocationServiceability({ city: addr.city, pincode: addr.pincode }).isServiceable ? (
                        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-cyan-300 text-[10px]">
                          ✓ Etawah (Active)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px]">
                          Coming Soon ({addr.city})
                        </Badge>
                      )}
                      {addr.isDefault && (
                        <Badge variant="success" className="text-[10px]">
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1 pt-1">
                    <p className="font-medium text-foreground">{addr.street}</p>
                    {addr.landmark && (
                      <p className="text-[11px]">Landmark: {addr.landmark}</p>
                    )}
                    <p>
                      {addr.area}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-3 mt-4 text-xs">
                  {!addr.isDefault ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-xs h-8 px-2 text-primary hover:text-primary"
                    >
                      <Star className="mr-1 h-3.5 w-3.5" />
                      Set as Default
                    </Button>
                  ) : (
                    <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Primary Visit Location
                    </span>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(addr.id)}
                    className="h-8 px-2 text-muted-foreground hover:text-destructive"
                    title="Delete Address"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
