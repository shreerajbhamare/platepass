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
  center = [41.8781, -87.6298], // Chicago default
  zoom = 13,
}: ListingMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(loc);
          if (mapRef.current) {
            mapRef.current.setView(loc, 14);
          }
        },
        () => {
          // Use default Chicago center
        }
      );
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView(center, zoom);
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
