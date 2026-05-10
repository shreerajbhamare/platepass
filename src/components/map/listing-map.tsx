"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Listing } from "@/lib/types";
import { getRotColor, getRotLabel, getTimeRemaining } from "@/lib/rot-score";

interface ListingMapProps {
  listings: Listing[];
  onListingClick?: (listing: Listing) => void;
  center?: [number, number];
  zoom?: number;
}

export default function ListingMap({
  listings,
  onListingClick,
}: ListingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const hasFlewIn = useRef(false);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          // Use default — will fly to densest listing area instead
        }
      );
    }
  }, []);

  // Initialize map — start zoomed out to show the whole US
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView([39.8283, -98.5795], 4); // Center of US, zoomed out
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when listings change
  useEffect(() => {
    if (!markersRef.current) return;
    markersRef.current.clearLayers();

    listings.forEach((listing) => {
      const color = getRotColor(listing.rot_score);
      const label = getRotLabel(listing.rot_score);
      const timeLeft = getTimeRemaining(listing.pickup_end);

      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${color};
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            ${listing.is_flash ? "animation: pulse 1.5s infinite;" : ""}
          ">
            ${listing.is_flash ? "⚡" : "🍽️"}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(
        [listing.location.lat, listing.location.lng],
        { icon }
      );

      marker.bindPopup(`
        <div style="min-width: 200px;">
          ${listing.photo_url ? `<img src="${listing.photo_url}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px;" alt="${listing.photo_alt_text || listing.title}" />` : ""}
          <strong>${listing.title}</strong>
          <div style="display:flex;gap:8px;margin-top:4px;">
            <span style="background:${color};color:white;padding:2px 6px;border-radius:4px;font-size:11px;">${label}</span>
            ${listing.is_flash ? '<span style="background:#7c3aed;color:white;padding:2px 6px;border-radius:4px;font-size:11px;">⚡ Flash</span>' : ""}
          </div>
          <p style="margin:4px 0;font-size:13px;color:#666;">${listing.quantity_remaining} of ${listing.quantity_total} servings left</p>
          <p style="margin:2px 0;font-size:12px;color:#888;">${timeLeft}</p>
          <p style="margin:2px 0;font-size:12px;">${listing.pickup_address}</p>
        </div>
      `);

      marker.on("click", () => {
        if (onListingClick) onListingClick(listing);
      });

      markersRef.current!.addLayer(marker);
    });

    // User location marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: "user-marker",
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker(userLocation, { icon: userIcon }).addTo(markersRef.current);
    }

    // Animated fly-in: start wide, then zoom to user's area with nearby listings
    if (listings.length > 0 && mapRef.current && !hasFlewIn.current) {
      hasFlewIn.current = true;

      // Find the densest listing area near the user (or just nearest listings)
      let flyTarget: [number, number];
      let flyZoom = 12;

      if (userLocation) {
        flyTarget = userLocation;
        // Find listings within ~50 miles and determine zoom
        const nearby = listings.filter((l) => {
          const dist = Math.sqrt(
            Math.pow(l.location.lat - userLocation[0], 2) +
            Math.pow(l.location.lng - userLocation[1], 2)
          );
          return dist < 1; // ~1 degree ≈ 69 miles
        });
        flyZoom = nearby.length > 5 ? 12 : nearby.length > 0 ? 11 : 10;
      } else {
        // No user location — fly to the densest cluster of listings
        // Simple approach: find the centroid of the most clustered listings
        const lats = listings.map((l) => l.location.lat);
        const lngs = listings.map((l) => l.location.lng);
        flyTarget = [
          lats.reduce((a, b) => a + b, 0) / lats.length,
          lngs.reduce((a, b) => a + b, 0) / lngs.length,
        ];
        flyZoom = 5;
      }

      // Delay the fly animation so user sees the full map first
      setTimeout(() => {
        mapRef.current?.flyTo(flyTarget, flyZoom, {
          duration: 2.5,
          easeLinearity: 0.25,
        });
      }, 1500);
    }
  }, [listings, userLocation, onListingClick]);

  return (
    <>
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
      `}</style>
      <div ref={containerRef} className="w-full h-full min-h-[400px] rounded-lg z-0" />
    </>
  );
}
