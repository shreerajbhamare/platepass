export type UserRole = "lister" | "seeker" | "runner" | "org" | "admin";
export type ListingStatus = "active" | "claimed" | "expired" | "cancelled";
export type FoodCategory = "prepared" | "produce" | "packaged" | "baked" | "beverages" | "other";
export type StorageType = "hot" | "cold" | "room_temp" | "frozen";
export type ClaimStatus = "reserved" | "picked_up" | "completed" | "cancelled" | "expired";
export type DeliveryStatus = "requested" | "accepted" | "picked_up" | "in_transit" | "delivered" | "cancelled";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  preferred_radius_km: number;
  dietary_preferences: string[];
  allergens: string[];
  notification_enabled: boolean;
  impact_score: number;
  meals_shared: number;
  meals_claimed: number;
  deliveries_completed: number;
  streak_days: number;
  created_at: string;
}

export interface Listing {
  id: string;
  lister_id: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  photo_alt_text: string | null;
  food_category: FoodCategory;
  dietary_tags: string[];
  allergens: string[];
  quantity_total: number;
  quantity_remaining: number;
  storage: StorageType;
  is_flash: boolean;
  pickup_address: string;
  pickup_instructions: string | null;
  location: { lat: number; lng: number };
  pickup_start: string;
  pickup_end: string;
  prepared_at: string | null;
  rot_score: number;
  status: ListingStatus;
  created_at: string;
  updated_at: string;
  // Joined
  profiles?: Pick<Profile, "display_name" | "avatar_url">;
}

export interface Claim {
  id: string;
  listing_id: string;
  claimer_id: string | null;
  claimer_name: string | null;
  claimer_phone: string | null;
  quantity: number;
  status: ClaimStatus;
  reserved_at: string;
  expires_at: string;
  picked_up_at: string | null;
}

export interface Delivery {
  id: string;
  listing_id: string;
  claim_id: string | null;
  runner_id: string | null;
  requester_id: string | null;
  status: DeliveryStatus;
  accepted_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  notes: string | null;
}
