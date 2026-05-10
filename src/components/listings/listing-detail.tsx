"use client";

import { Listing } from "@/lib/types";
import { getRotColor, getRotLabel, getTimeRemaining } from "@/lib/rot-score";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import ListenButton from "@/components/voice/listen-button";

interface ListingDetailProps {
  listing: Listing;
  onClaim?: (listing: Listing) => void;
  onRequestDelivery?: (listing: Listing) => void;
  onClose?: () => void;
}

export default function ListingDetail({ listing, onClaim, onRequestDelivery, onClose }: ListingDetailProps) {
  const rotColor = getRotColor(listing.rot_score);
  const rotLabel = getRotLabel(listing.rot_score);
  const timeLeft = getTimeRemaining(listing.pickup_end);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm truncate pr-2">{listing.title}</h3>
        <div className="flex items-center gap-1 shrink-0">
          <ListenButton
            listingId={listing.id}
            text={`${listing.title}. ${listing.description || ""} ${listing.quantity_remaining} servings available. Pick up at ${listing.pickup_address}. ${listing.allergens.length > 0 ? `Allergen warning: ${listing.allergens.join(", ")}` : ""}`}
          />
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-lg leading-none"
            aria-label="Close"
          >
            x
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {/* Photo */}
        {listing.photo_url ? (
          <img
            src={listing.photo_url}
            alt={listing.photo_alt_text || listing.title}
            className="w-full h-44 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-44 bg-muted flex items-center justify-center text-5xl rounded-lg">
            🍽️
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <Badge
            style={{ backgroundColor: rotColor, color: "white" }}
          >
            {rotLabel}
          </Badge>
          {listing.is_flash && (
            <Badge className="bg-purple-600 text-white animate-pulse">
              ⚡ Flash
            </Badge>
          )}
          <Badge variant="secondary">{listing.food_category}</Badge>
          {listing.dietary_tags.map((tag) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>

        {/* Time */}
        <div className="text-sm text-muted-foreground">{timeLeft}</div>

        {/* Description */}
        {listing.description && (
          <p className="text-sm">{listing.description}</p>
        )}

        <Separator />

        {/* Quantity */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Servings available</span>
            <span>{listing.quantity_remaining} of {listing.quantity_total}</span>
          </div>
          <Progress
            value={(listing.quantity_remaining / listing.quantity_total) * 100}
            className="h-2"
          />
        </div>

        {/* Freshness Score */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Freshness</span>
            <span style={{ color: rotColor }}>{listing.rot_score}/100</span>
          </div>
          <Progress
            value={listing.rot_score}
            className="h-2"
          />
        </div>

        <Separator />

        {/* Pickup Info */}
        <div className="space-y-1">
          <p className="text-sm font-medium">Pickup Location</p>
          <p className="text-sm text-muted-foreground">📍 {listing.pickup_address}</p>
          {listing.pickup_instructions && (
            <p className="text-sm text-muted-foreground">📝 {listing.pickup_instructions}</p>
          )}
        </div>

        {/* Allergens */}
        {listing.allergens.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Allergen Warning</p>
            <div className="flex flex-wrap gap-1">
              {listing.allergens.map((a) => (
                <Badge key={a} variant="destructive" className="text-xs">{a}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons — sticky bottom */}
      {listing.quantity_remaining > 0 && (onClaim || onRequestDelivery) && (
        <div className="p-3 border-t space-y-2">
          {onClaim && (
            <Button
              className="w-full cursor-pointer"
              onClick={() => onClaim(listing)}
            >
              Claim Pickup - {listing.quantity_remaining} left
            </Button>
          )}
          {onRequestDelivery && (
            <Button
              variant="outline"
              className="w-full cursor-pointer"
              onClick={() => onRequestDelivery(listing)}
            >
              🏃 Request Delivery
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
