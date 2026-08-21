import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function formatTime(timeString: string): string {
  // expects "HH:mm"
  const [hourStr, minuteStr] = timeString.split(":");
  const hour = parseInt(hourStr, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minuteStr} ${period}`;
}

export function formatTimeSlot(timeSlot: string): string {
  if (!timeSlot) return "";
  if (timeSlot.includes("AM") || timeSlot.includes("PM") || timeSlot.includes("Immediate")) {
    return timeSlot;
  }
  if (timeSlot.includes(":")) {
    return formatTime(timeSlot);
  }
  return timeSlot;
}
