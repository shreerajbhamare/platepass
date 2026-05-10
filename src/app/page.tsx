"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { Listing } from "@/lib/types";
import ListingCard from "@/components/listings/listing-card";
import ListingDetail from "@/components/listings/listing-detail";
import CreateListingForm from "@/components/listings/create-listing-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

const ListingMap = dynamic(() => import("@/components/map/listing-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-muted animate-pulse rounded-lg" />
  ),
});

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

export default function HomePage() {
  const supabase = createClient();
  const isDesktop = useIsDesktop();
  const [listings, setListings] = useState<Listing[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [view, setView] = useState<"map" | "feed">("map");

  // Fetch user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch listings
  const fetchListings = useCallback(async () => {
    const { data, error } = await supabase
      .from("listings_with_coords")
      .select("*")
      .eq("status", "active")
      .gte("pickup_end", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (!error && data) {
      const parsed = data.map((l: Record<string, unknown>) => ({
        ...l,
        location: { lat: l.lat as number, lng: l.lng as number },
      })) as Listing[];
      setListings(parsed);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("listings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "listings" },
        () => {
          fetchListings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchListings]);

  const handleClaim = async (listing: Listing) => {
    if (!user) {
      toast.error("Please sign in to claim food");
      return;
    }

    const { error } = await supabase.from("claims").insert({
      listing_id: listing.id,
      claimer_id: user.id,
      quantity: 1,
      status: "reserved",
    });

    if (error) {
      toast.error("Failed to claim. Try again.");
    } else {
      toast.success("Claimed! Pick up within 15 minutes.");
      setSelectedListing(null);
      fetchListings();
    }
  };

  const handleRequestDelivery = async (listing: Listing) => {
    if (!user) {
      toast.error("Please sign in to request delivery");
      return;
    }

    const { error } = await supabase.from("deliveries").insert({
      listing_id: listing.id,
      requester_id: user.id,
      pickup_location: `SRID=4326;POINT(${listing.location.lng} ${listing.location.lat})`,
      status: "requested",
      notes: `Delivery requested for: ${listing.title}`,
    });

    if (error) {
      toast.error("Failed to request delivery. Try again.");
    } else {
      toast.success("Delivery requested! A runner will pick it up for you.");
      setSelectedListing(null);
    }
  };

  const filteredListings = listings.filter((l) => {
    if (filter === "all") return true;
    if (filter === "flash") return l.is_flash;
    return l.food_category === filter;
  });

  const totalMealsSaved = listings.reduce(
    (sum, l) => sum + (l.quantity_total - l.quantity_remaining),
    0
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden" id="main-content">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between bg-white/80 backdrop-blur-sm z-50 shrink-0" role="banner">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-green-700">🍽️ PlatePass</h1>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {listings.length} active
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <a
                href="/impact"
                className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded-md border border-border hover:bg-muted transition-colors"
              >
                🌍 Impact
              </a>
              <a
                href="/runner"
                className="inline-flex items-center justify-center h-8 px-3 text-sm font-medium rounded-md border border-border hover:bg-muted transition-colors"
              >
                🏃 Runner
              </a>
              <Button
                size="sm"
                className="cursor-pointer"
                onClick={() => setShowCreateForm(true)}
              >
                + Share Food
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => supabase.auth.signOut()}
                className="cursor-pointer"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <a
              href="/login"
              className="inline-flex items-center justify-center h-7 px-3 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Sign In
            </a>
          )}
        </div>
      </header>

      {/* Impact Bar */}
      <div className="bg-green-50 border-b px-4 py-2 flex items-center justify-between text-sm shrink-0">
        <span className="text-green-800 font-medium">
          🌍 {totalMealsSaved} meals saved today in your area
        </span>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(v) => v && setFilter(v)}>
            <SelectTrigger className="h-7 text-xs w-28">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Food</SelectItem>
              <SelectItem value="flash">⚡ Flash Only</SelectItem>
              <SelectItem value="prepared">Prepared</SelectItem>
              <SelectItem value="produce">Produce</SelectItem>
              <SelectItem value="baked">Baked</SelectItem>
              <SelectItem value="packaged">Packaged</SelectItem>
              <SelectItem value="beverages">Beverages</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ============ MOBILE LAYOUT ============ */}
      <main className="flex-1 min-h-0 lg:hidden" role="main" aria-label="Food listings">
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as "map" | "feed")}
          className="h-full flex flex-col"
        >
          <TabsList className="mx-4 mt-2 w-fit shrink-0">
            <TabsTrigger value="map">🗺️ Map</TabsTrigger>
            <TabsTrigger value="feed">📋 Feed</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="flex-1 min-h-0 m-0 p-0">
            <div className="h-full">
              <ListingMap
                listings={filteredListings}
                onListingClick={setSelectedListing}
              />
            </div>
          </TabsContent>

          <TabsContent value="feed" className="flex-1 min-h-0 m-0 overflow-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredListings.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <p className="text-4xl mb-2">🍽️</p>
                  <p>No food listings nearby right now.</p>
                  <p className="text-sm mt-1">Be the first to share!</p>
                </div>
              )}
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onClaim={handleClaim}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

      </main>

      {/* ============ DESKTOP LAYOUT ============ */}
      <main className="flex-1 min-h-0 hidden lg:flex" role="main" aria-label="Food map and listings">
        {/* Map — fills remaining space */}
        <div className="flex-1 min-h-0 relative">
          <ListingMap
            listings={filteredListings}
            onListingClick={setSelectedListing}
          />
        </div>

        {/* Sidebar — fixed width, independently scrollable */}
        <div className="w-[380px] border-l flex flex-col min-h-0 bg-white">
          {selectedListing ? (
            /* Detail view replaces the feed */
            <ListingDetail
              listing={selectedListing}
              onClaim={handleClaim}
              onRequestDelivery={handleRequestDelivery}
              onClose={() => setSelectedListing(null)}
            />
          ) : (
            /* Feed list */
            <>
              <div className="p-3 border-b shrink-0">
                <h2 className="font-semibold text-sm">
                  Nearby Food ({filteredListings.length})
                </h2>
              </div>
              <div className="flex-1 overflow-auto p-3 space-y-3">
                {filteredListings.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-4xl mb-2">🍽️</p>
                    <p>No food listings nearby right now.</p>
                    <p className="text-sm mt-1">Be the first to share!</p>
                  </div>
                )}
                {filteredListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onClaim={handleClaim}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Create Listing Sheet */}
      <Sheet open={showCreateForm} onOpenChange={setShowCreateForm}>
        <SheetContent side="bottom" className="h-[90vh] !gap-2">
          <SheetHeader className="shrink-0 pb-0">
            <SheetTitle>Share Surplus Food</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-auto px-4 pb-4">
            <CreateListingForm
              onSuccess={() => {
                setShowCreateForm(false);
                fetchListings();
              }}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile only: Selected listing bottom sheet */}
      {!isDesktop && selectedListing && (
        <Sheet
          open={!!selectedListing}
          onOpenChange={() => setSelectedListing(null)}
        >
          <SheetContent side="bottom" className="h-[70vh] p-0">
            <ListingDetail
              listing={selectedListing}
              onClaim={handleClaim}
              onRequestDelivery={handleRequestDelivery}
              onClose={() => setSelectedListing(null)}
            />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
