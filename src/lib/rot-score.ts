import { FoodCategory, StorageType } from "./types";

const BASE_HOURS: Record<FoodCategory, number> = {
  prepared: 4,
  produce: 24,
  baked: 48,
  packaged: 168,
  beverages: 72,
  other: 6,
};

const STORAGE_MULTIPLIER: Record<StorageType, number> = {
  frozen: 10,
  cold: 3,
  hot: 0.8,
  room_temp: 1,
};

export function calculateRotScore(
  foodCategory: FoodCategory,
  storage: StorageType,
  preparedAt: Date | string,
  ambientTempF: number = 72
): number {
  const now = new Date();
  const prepared = new Date(preparedAt);
  const hoursElapsed = (now.getTime() - prepared.getTime()) / (1000 * 60 * 60);

  let baseHours = BASE_HOURS[foodCategory] * STORAGE_MULTIPLIER[storage];

  // Temperature factor
  const tempMultiplier =
    ambientTempF > 90 ? 0.5 :
    ambientTempF > 80 ? 0.7 :
    ambientTempF > 70 ? 1.0 :
    ambientTempF < 40 ? 2.0 : 1.2;

  baseHours *= tempMultiplier;

  const score = Math.max(0, Math.min(100, Math.round(100 * (1 - hoursElapsed / baseHours))));
  return score;
}

export function getRotColor(score: number): string {
  if (score >= 75) return "#22c55e"; // green
  if (score >= 50) return "#eab308"; // yellow
  if (score >= 25) return "#f97316"; // orange
  return "#ef4444"; // red
}

export function getRotLabel(score: number): string {
  if (score >= 75) return "Fresh";
  if (score >= 50) return "Good";
  if (score >= 25) return "Eat Soon";
  return "Last Chance";
}

export function getTimeRemaining(pickupEnd: string): string {
  const end = new Date(pickupEnd);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) return "Expired";

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}
