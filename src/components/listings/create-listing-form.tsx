"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FoodCategory, StorageType } from "@/lib/types";
import { toast } from "sonner";
import VoiceInput from "@/components/voice/voice-input";

interface CreateListingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />;
}

export default function CreateListingForm({ onSuccess, onCancel }: CreateListingFormProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [aiDetecting, setAiDetecting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    food_category: "prepared" as FoodCategory,
    storage: "room_temp" as StorageType,
    quantity_total: 5,
    servings_per_item: 1,
    dietary_tags: [] as string[],
    allergens: [] as string[],
    pickup_address: "",
    pickup_instructions: "",
    pickup_hours: 2,
    is_flash: false,
    lat: 41.8781,
    lng: -87.6298,
  });

  const handlePhotoCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // AI food detection
    await detectFoodFromPhoto(file);
  };

  const detectFoodFromPhoto = async (file: File) => {
    setAiDetecting(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch("/api/detect-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.title) {
          setForm((prev) => ({
            ...prev,
            title: data.title || prev.title,
            description: data.description || prev.description,
            food_category: data.food_category || prev.food_category,
            quantity_total: data.quantity || prev.quantity_total,
            dietary_tags: data.dietary_tags || prev.dietary_tags,
          }));
          toast.success("AI auto-filled your listing! Review and edit if needed.");
        }
      }
    } catch {
      // AI detection is optional, fail silently
    } finally {
      setAiDetecting(false);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setForm((prev) => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }));
        toast.success("Location detected!");
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to list food");
        return;
      }

      let photoUrl: string | null = null;

      // Upload photo
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `listings/${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("food-photos")
          .upload(path, photoFile);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("food-photos")
            .getPublicUrl(path);
          photoUrl = urlData.publicUrl;
        }
      }

      const pickupEnd = new Date();
      pickupEnd.setHours(pickupEnd.getHours() + form.pickup_hours);

      const totalServings = form.quantity_total * form.servings_per_item;

      const { error } = await supabase.from("listings").insert({
        lister_id: user.id,
        title: form.title,
        description: form.description || null,
        photo_url: photoUrl,
        food_category: form.food_category,
        storage: form.storage,
        quantity_total: totalServings,
        quantity_remaining: totalServings,
        dietary_tags: form.dietary_tags,
        allergens: form.allergens,
        pickup_address: form.pickup_address,
        pickup_instructions: form.pickup_instructions || null,
        pickup_end: pickupEnd.toISOString(),
        prepared_at: new Date().toISOString(),
        is_flash: form.is_flash,
        location: `POINT(${form.lng} ${form.lat})`,
        rot_score: 100,
      });

      if (error) throw error;

      toast.success("Food listed! It's now visible on the map.");
      onSuccess?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create listing";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo Capture — prominent, full-width */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-green-300 rounded-lg text-center cursor-pointer hover:border-green-500 transition-colors relative overflow-hidden bg-green-50/50"
        >
          {photoPreview ? (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Food preview"
                className={`w-full h-48 object-cover transition-all ${aiDetecting ? "blur-sm scale-[1.02]" : ""}`}
              />
              {aiDetecting && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="bg-white/90 px-4 py-2 rounded-full text-sm font-medium animate-pulse">
                    🤖 AI analyzing your food...
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-muted-foreground">
              <p className="text-4xl mb-2">📸</p>
              <p className="font-medium text-foreground">Tap to take a photo</p>
              <p className="text-xs mt-1">AI will auto-detect food type, quantity & tags</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoCapture}
          className="hidden"
        />

          {/* AI Loading Skeleton State */}
          {aiDetecting && (
            <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground">Auto-filling form...</p>
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-16 w-full" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-9" />
                <Skeleton className="h-9" />
              </div>
            </div>
          )}

          {/* Form fields — shown after AI or immediately if no photo */}
          {!aiDetecting && (
            <>
              {/* Voice Input */}
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <VoiceInput
                  label="Describe your food"
                  onTranscript={(text) => {
                    setForm((f) => ({
                      ...f,
                      title: text.split(".")[0].slice(0, 80) || f.title,
                      description: text.length > 80 ? text : f.description,
                    }));
                    toast.success("Voice captured!");
                  }}
                />
                <span className="text-xs text-muted-foreground">or type below</span>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <Label htmlFor="title">What food?</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., 8 slices of pepperoni pizza"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Label htmlFor="desc">Details (optional)</Label>
                <Textarea
                  id="desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Any details about the food..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Food Category */}
                <div className="space-y-1">
                  <Label>Category</Label>
                  <Select
                    value={form.food_category}
                    onValueChange={(v) => setForm((f) => ({ ...f, food_category: v as FoodCategory }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prepared">Prepared Meal</SelectItem>
                      <SelectItem value="produce">Produce</SelectItem>
                      <SelectItem value="baked">Baked Goods</SelectItem>
                      <SelectItem value="packaged">Packaged</SelectItem>
                      <SelectItem value="beverages">Beverages</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Storage */}
                <div className="space-y-1">
                  <Label>Storage</Label>
                  <Select
                    value={form.storage}
                    onValueChange={(v) => setForm((f) => ({ ...f, storage: v as StorageType }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="room_temp">Room Temp</SelectItem>
                      <SelectItem value="hot">Kept Hot</SelectItem>
                      <SelectItem value="cold">Refrigerated</SelectItem>
                      <SelectItem value="frozen">Frozen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Quantity */}
                <div className="space-y-1">
                  <Label htmlFor="qty">Quantity</Label>
                  <Input
                    id="qty"
                    type="number"
                    min={1}
                    max={500}
                    value={form.quantity_total}
                    onChange={(e) => setForm((f) => ({ ...f, quantity_total: parseInt(e.target.value) || 1 }))}
                  />
                </div>

                {/* Servings per item */}
                <div className="space-y-1">
                  <Label htmlFor="servings">Servings each</Label>
                  <Input
                    id="servings"
                    type="number"
                    min={1}
                    max={20}
                    value={form.servings_per_item}
                    onChange={(e) => setForm((f) => ({ ...f, servings_per_item: parseInt(e.target.value) || 1 }))}
                  />
                </div>

                {/* Pickup Hours */}
                <div className="space-y-1">
                  <Label htmlFor="hours">Hours avail.</Label>
                  <Input
                    id="hours"
                    type="number"
                    min={0.5}
                    max={24}
                    step={0.5}
                    value={form.pickup_hours}
                    onChange={(e) => setForm((f) => ({ ...f, pickup_hours: parseFloat(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              {form.quantity_total > 1 || form.servings_per_item > 1 ? (
                <p className="text-xs text-muted-foreground">
                  Total: {form.quantity_total * form.servings_per_item} servings ({form.quantity_total} items × {form.servings_per_item} serving{form.servings_per_item > 1 ? "s" : ""} each)
                </p>
              ) : null}

              {/* Pickup Address */}
              <div className="space-y-1">
                <Label htmlFor="address">Pickup Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="address"
                    value={form.pickup_address}
                    onChange={(e) => setForm((f) => ({ ...f, pickup_address: e.target.value }))}
                    placeholder="123 Main St or Building name"
                    required
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleGetLocation} className="cursor-pointer">
                    📍
                  </Button>
                </div>
              </div>

              {/* Pickup Instructions */}
              <div className="space-y-1">
                <Label htmlFor="instructions">Pickup Instructions (optional)</Label>
                <Input
                  id="instructions"
                  value={form.pickup_instructions}
                  onChange={(e) => setForm((f) => ({ ...f, pickup_instructions: e.target.value }))}
                  placeholder="e.g., Ring doorbell, lobby table, etc."
                />
              </div>

              {/* Flash Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="flash">⚡ Flash Drop</Label>
                  <p className="text-xs text-muted-foreground">Under 1 hour — notify nearby users</p>
                </div>
                <Switch
                  id="flash"
                  checked={form.is_flash}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, is_flash: v, pickup_hours: v ? 1 : f.pickup_hours }))}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel} className="flex-1 cursor-pointer">
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={loading} className="flex-1 cursor-pointer">
                  {loading ? "Posting..." : "Share Food 🍽️"}
                </Button>
              </div>
            </>
          )}
        </form>
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
