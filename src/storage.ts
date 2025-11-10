import type { Entry } from "./types";

const ENTRIES_KEY = "reflectr_entries";
const ACTIVITIES_KEY = "reflectr_activities";
const DEFAULT_ACTIVITIES = ["work", "study", "exercise", "social", "commute", "chores"];

// Generate UUID with fallback
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Normalize activity string to canonical form (lowercase, hyphenated)
function normalizeActivity(activity: string): string {
  return activity.trim().toLowerCase().replace(/\s+/g, "-");
}

// Get canonical form for deduplication, but preserve display label
function getCanonicalActivity(activity: string): string {
  return normalizeActivity(activity);
}

export function getEntries(): Entry[] {
  try {
    const stored = localStorage.getItem(ENTRIES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries: Entry[]): void {
  try {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error("Failed to save entries:", error);
  }
}

export function getActivities(): string[] {
  try {
    const stored = localStorage.getItem(ACTIVITIES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with defaults if none found
    saveActivities(DEFAULT_ACTIVITIES);
    return DEFAULT_ACTIVITIES;
  } catch {
    const defaults = DEFAULT_ACTIVITIES;
    saveActivities(defaults);
    return defaults;
  }
}

export function saveActivities(activities: string[]): void {
  try {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
  } catch (error) {
    console.error("Failed to save activities:", error);
  }
}

export function addActivity(activity: string): string {
  const trimmed = activity.trim();
  if (!trimmed) return trimmed;

  const activities = getActivities();
  const canonical = getCanonicalActivity(trimmed);

  // Check if activity already exists (case-insensitive)
  const exists = activities.some((a) => getCanonicalActivity(a) === canonical);
  if (exists) {
    // Return the existing activity with its original casing
    return activities.find((a) => getCanonicalActivity(a) === canonical) || trimmed;
  }

  // Add new activity (preserve user's original casing for display)
  const updated = [...activities, trimmed];
  saveActivities(updated);
  return trimmed;
}

export function addEntry(partial: Omit<Entry, "id" | "user_id"> & { timestamp?: string }): Entry {
  const entry: Entry = {
    ...partial,
    id: generateUUID(),
    user_id: "local_user",
    timestamp: partial.timestamp || new Date().toISOString(),
  };

  const entries = getEntries();
  entries.push(entry);
  saveEntries(entries);

  return entry;
}

export function deleteEntry(id: string): void {
  const entries = getEntries();
  const filtered = entries.filter((e) => e.id !== id);
  saveEntries(filtered);
}

