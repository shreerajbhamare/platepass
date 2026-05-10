"use client";

import { Listing } from "@/lib/types";
import { getRotColor, getRotLabel, getTimeRemaining } from "@/lib/rot-score";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ListingCardProps {
  listing: Listing;
  onClaim?: (listing: Listing) => void;
  distance?: string;
}

export default function ListingCard({ listing, onClaim, distance }: ListingCardProps) {
  const rotColor = getRotColor(listing.rot_score);
  const rotLabel = getRotLabel(listing.rot_score);
  const timeLeft = getTimeRemaining(listing.pickup_end);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow" role="article" aria-label={`${listing.title}, ${listing.quantity_remaining} servings, ${rotLabel}`}>
      <div className="relative">
        {listing.photo_url && (
          <img
            src={listing.photo_url}
            alt={listing.photo_alt_text || listing.title}
            className="w-full h-36 object-cover"
          />
        )}
        {!listing.photo_url && (
          <div className="w-full h-36 bg-muted flex items-center justify-center text-4xl">
            🍽️
          </div>
        )}
        {listing.is_flash && (
          <Badge className="absolute top-2 right-2 bg-purple-600 text-white animate-pulse">
            ⚡ Flash
          </Badge>
        )}
        <div
          className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-xs font-medium text-white"
          style={{ backgroundColor: rotColor }}
        >
          {rotLabel} &middot; {timeLeft}
        </div>
      </div>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight">{listing.title}</h3>
          {distance && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">{distance}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          <Badge variant="secondary" className="text-xs">
            {listing.food_category}
          </Badge>
          {listing.dietary_tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{listing.quantity_remaining} of {listing.quantity_total} servings</span>
            <span>{Math.round((listing.quantity_remaining / listing.quantity_total) * 100)}%</span>
          </div>
          <Progress
            value={(listing.quantity_remaining / listing.quantity_total) * 100}
            className="h-1.5"
          />
        </div>

        <p className="text-xs text-muted-foreground truncate">
          📍 {listing.pickup_address}
        </p>

        {onClaim && listing.quantity_remaining > 0 && (
          <Button
            size="sm"
            className="w-full mt-1 cursor-pointer"
            onClick={() => onClaim(listing)}
          >
            Claim Pickup
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
