import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getRiskColor(category: string): string {
  switch (category?.toUpperCase()) {
    case "LOW": return "#22c55e";
    case "MODERATE": return "#f59e0b";
    case "HIGH": return "#ef4444";
    case "CRITICAL": return "#dc2626";
    default: return "#6b7280";
  }
}

export function getRiskBadgeClass(category: string): string {
  switch (category?.toUpperCase()) {
    case "LOW": return "badge-low";
    case "MODERATE": return "badge-moderate";
    case "HIGH": return "badge-high";
    case "CRITICAL": return "badge-critical";
    default: return "";
  }
}
