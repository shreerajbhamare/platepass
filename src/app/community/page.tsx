"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface Post {
  id: string;
  author_name: string;
  author_avatar: string | null;
  content: string;
  image_url: string | null;
  category: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

interface Comment {
  id: string;
  author_name: string;
  author_avatar: string | null;
  content: string;
  created_at: string;
}

interface CommunityEvent {
  id: string;
  organizer_name: string;
  title: string;
  description: string;
  image_url: string | null;
  category: string;
  event_date: string;
  location_address: string;
  max_volunteers: number;
  current_volunteers: number;
  status: string;
  created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  food_drive: "🍲 Food Drive",
  cloth_donation: "👕 Cloth Donation",
  waste_collection: "♻️ Waste Collection",
  beach_cleaning: "🏖️ Beach Cleaning",
  tree_planting: "🌳 Tree Planting",
  general: "📢 General",
};

const CATEGORY_COLORS: Record<string, string> = {
  food_drive: "bg-green-100 text-green-800",
  cloth_donation: "bg-purple-100 text-purple-800",
  waste_collection: "bg-yellow-100 text-yellow-800",
  beach_cleaning: "bg-blue-100 text-blue-800",
  tree_planting: "bg-emerald-100 text-emerald-800",
  general: "bg-gray-100 text-gray-800",
};

export default function CommunityPage() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [tab, setTab] = useState<"feed" | "events">("feed");
  const [showNewPost, setShowNewPost] = useState(false);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchEvents();
  }, []);

  async function fetchPosts() {
    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPosts(data);
  }

  async function fetchEvents() {
    const { data } = await supabase
      .from("community_events")
      .select("*")
      .order("event_date", { ascending: true });
    if (data) setEvents(data);
  }

  async function fetchComments(postId: string) {
    const { data } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (data) setComments(data);
  }

  async function handleLike(postId: string) {
    if (!user) {
      toast.error("Please sign in to like posts");
      return;
    }

    if (likedPosts.has(postId)) {
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
      setLikedPosts((prev) => { const n = new Set(prev); n.delete(postId); return n; });
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes_count: p.likes_count - 1 } : p));
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
      setLikedPosts((prev) => new Set([...prev, postId]));
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));
    }
  }

  async function handleComment(postId: string) {
    if (!user || !commentText.trim()) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single();

    await supabase.from("post_comments").insert({
      post_id: postId,
      author_id: user.id,
      author_name: profile?.display_name || "Anonymous",
      author_avatar: profile?.avatar_url,
      content: commentText.trim(),
    });

    // Update comment count
    await supabase
      .from("community_posts")
      .update({ comments_count: posts.find((p) => p.id === postId)!.comments_count + 1 })
      .eq("id", postId);

    setCommentText("");
    fetchComments(postId);
    fetchPosts();
    toast.success("Comment posted!");
  }

  async function handleVolunteer(eventId: string) {
    if (!user) {
      toast.error("Please sign in to volunteer");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    const { error } = await supabase.from("event_volunteers").insert({
      event_id: eventId,
      user_id: user.id,
      user_name: profile?.display_name || "Volunteer",
    });

    if (error) {
      if (error.code === "23505") toast.info("You're already registered!");
      else toast.error("Failed to register");
      return;
    }

    // Update volunteer count
    const event = events.find((e) => e.id === eventId);
    if (event) {
      await supabase
        .from("community_events")
        .update({ current_volunteers: event.current_volunteers + 1 })
        .eq("id", eventId);
    }

    fetchEvents();
    toast.success("You're registered as a volunteer!");
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return `${Math.floor(diff / 60000)}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between bg-white/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2">
          <a href="/" className="text-xl font-bold text-green-700">🍽️ PlatePass</a>
          <Badge variant="secondary">Community</Badge>
        </div>
        <div className="flex items-center gap-2">
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground">← Map</a>
          {user && (
            <Button size="sm" onClick={() => tab === "feed" ? setShowNewPost(true) : setShowNewEvent(true)} className="cursor-pointer">
              + {tab === "feed" ? "Post" : "Event"}
            </Button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as "feed" | "events")} className="flex-1 flex flex-col min-h-0">
        <TabsList className="mx-4 mt-2 w-fit shrink-0">
          <TabsTrigger value="feed">📢 Feed</TabsTrigger>
          <TabsTrigger value="events">📅 Events</TabsTrigger>
        </TabsList>

        {/* Feed Tab */}
        <TabsContent value="feed" className="flex-1 min-h-0 overflow-auto p-4">
          <div className="max-w-2xl mx-auto space-y-4">
            {posts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-4xl mb-2">🌱</p>
                <p>No posts yet. Be the first to share!</p>
              </div>
            )}
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardContent className="p-4">
                  {/* Author */}
                  <div className="flex items-center gap-2 mb-2">
                    {post.author_avatar ? (
                      <img src={post.author_avatar} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-sm">
                        {post.author_name[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{post.author_name}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(post.created_at)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[post.category] || CATEGORY_COLORS.general}`}>
                      {CATEGORY_LABELS[post.category] || post.category}
                    </span>
                  </div>

                  {/* Content */}
                  <p className="text-sm mb-3 whitespace-pre-line">{post.content}</p>

                  {/* Image */}
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Post image"
                      className="w-full h-48 object-cover rounded-lg mb-3"
                    />
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 text-sm">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1 cursor-pointer transition-colors ${likedPosts.has(post.id) ? "text-red-500" : "text-muted-foreground hover:text-red-500"}`}
                    >
                      {likedPosts.has(post.id) ? "❤️" : "🤍"} {post.likes_count}
                    </button>
                    <button
                      onClick={() => {
                        if (expandedComments === post.id) {
                          setExpandedComments(null);
                        } else {
                          setExpandedComments(post.id);
                          fetchComments(post.id);
                        }
                      }}
                      className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 cursor-pointer transition-colors"
                    >
                      💬 {post.comments_count}
                    </button>
                  </div>

                  {/* Comments Section */}
                  {expandedComments === post.id && (
                    <div className="mt-3 pt-3 border-t space-y-2">
                      {comments.map((c) => (
                        <div key={c.id} className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs shrink-0">
                            {c.author_avatar ? (
                              <img src={c.author_avatar} alt="" className="w-6 h-6 rounded-full" />
                            ) : (
                              c.author_name[0]
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs">
                              <span className="font-medium">{c.author_name}</span>{" "}
                              <span className="text-muted-foreground">{timeAgo(c.created_at)}</span>
                            </p>
                            <p className="text-sm">{c.content}</p>
                          </div>
                        </div>
                      ))}
                      {user && (
                        <div className="flex gap-2 mt-2">
                          <Input
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 h-8 text-sm"
                            onKeyDown={(e) => e.key === "Enter" && handleComment(post.id)}
                          />
                          <Button size="sm" onClick={() => handleComment(post.id)} className="h-8 cursor-pointer">
                            Post
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="flex-1 min-h-0 overflow-auto p-4">
          <div className="max-w-2xl mx-auto space-y-4">
            {events.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-4xl mb-2">📅</p>
                <p>No events yet. Create one to rally volunteers!</p>
              </div>
            )}
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                {event.image_url && (
                  <img src={event.image_url} alt={event.title} className="w-full h-40 object-cover" />
                )}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-xs text-muted-foreground">by {event.organizer_name}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${CATEGORY_COLORS[event.category] || CATEGORY_COLORS.general}`}>
                      {CATEGORY_LABELS[event.category] || event.category}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{event.description}</p>

                  <div className="space-y-1 text-sm mb-3">
                    <p>📅 {new Date(event.event_date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                    <p>📍 {event.location_address}</p>
                    <p>👥 {event.current_volunteers}/{event.max_volunteers} volunteers registered</p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-2 mb-3">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (event.current_volunteers / event.max_volunteers) * 100)}%` }}
                    />
                  </div>

                  <Button
                    onClick={() => handleVolunteer(event.id)}
                    disabled={event.current_volunteers >= event.max_volunteers}
                    className="w-full cursor-pointer"
                    variant={event.current_volunteers >= event.max_volunteers ? "secondary" : "default"}
                  >
                    {event.current_volunteers >= event.max_volunteers
                      ? "Event Full"
                      : "🙋 Register as Volunteer"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Post Modal */}
      {showNewPost && <NewPostModal onClose={() => setShowNewPost(false)} onSuccess={() => { setShowNewPost(false); fetchPosts(); }} user={user} />}

      {/* New Event Modal */}
      {showNewEvent && <NewEventModal onClose={() => setShowNewEvent(false)} onSuccess={() => { setShowNewEvent(false); fetchEvents(); }} user={user} />}
    </div>
  );
}

function NewPostModal({ onClose, onSuccess, user }: { onClose: () => void; onSuccess: () => void; user: User | null }) {
  const supabase = createClient();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [customCategory, setCustomCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !content.trim()) return;
    setLoading(true);

    const finalCategory = category === "others" ? (customCategory || "others") : category;

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single();

    let photo_url = imageUrl || null;

    // Upload image if file selected
    const file = fileRef.current?.files?.[0];
    if (file) {
      const path = `community/${user.id}/${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("food-photos").upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from("food-photos").getPublicUrl(path);
        photo_url = urlData.publicUrl;
      }
    }

    await supabase.from("community_posts").insert({
      author_id: user.id,
      author_name: profile?.display_name || "Anonymous",
      author_avatar: profile?.avatar_url,
      content: content.trim(),
      image_url: photo_url,
      category: finalCategory,
    });

    setLoading(false);
    toast.success("Post shared!");
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-lg rounded-t-lg p-4 max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Share with Community</h2>
          <button onClick={onClose} className="text-muted-foreground text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share about a recent drive, donation event, or community initiative..."
            rows={4}
            required
          />
          <div className="space-y-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-9 rounded-md border px-3 text-sm"
            >
              <option value="general">📢 General</option>
              <option value="food_drive">🍲 Food Drive</option>
              <option value="cloth_donation">👕 Cloth Donation</option>
              <option value="waste_collection">♻️ Waste Collection</option>
              <option value="beach_cleaning">🏖️ Beach Cleaning</option>
              <option value="tree_planting">🌳 Tree Planting</option>
              <option value="others">📝 Others</option>
            </select>
            {category === "others" && (
              <Input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter category name (e.g., Blood Drive, Mentorship, etc.)"
                required
              />
            )}
          </div>
          <div className="flex gap-2 items-center">
            <Input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="flex-1 text-sm"
            />
            <span className="text-xs text-muted-foreground">or</span>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Image URL"
              className="flex-1 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 cursor-pointer">Cancel</Button>
            <Button type="submit" disabled={loading || !content.trim()} className="flex-1 cursor-pointer">
              {loading ? "Posting..." : "Share Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NewEventModal({ onClose, onSuccess, user }: { onClose: () => void; onSuccess: () => void; user: User | null }) {
  const supabase = createClient();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "food_drive",
    customCategory: "",
    event_date: "",
    location_address: "",
    max_volunteers: 20,
    image_url: "",
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    const finalCategory = form.category === "others" ? (form.customCategory || "others") : form.category;

    await supabase.from("community_events").insert({
      organizer_id: user.id,
      organizer_name: profile?.display_name || "Anonymous",
      title: form.title,
      description: form.description,
      category: finalCategory,
      event_date: new Date(form.event_date).toISOString(),
      location_address: form.location_address,
      max_volunteers: form.max_volunteers,
      image_url: form.image_url || null,
    });

    setLoading(false);
    toast.success("Event created! Nearby volunteers will be notified.");
    onSuccess();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-lg rounded-t-lg p-4 max-h-[80vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Create Event</h2>
          <button onClick={onClose} className="text-muted-foreground text-xl">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Event title"
            required
          />
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe the event, what volunteers should bring, etc."
            rows={3}
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="h-9 rounded-md border px-3 text-sm"
            >
              <option value="food_drive">🍲 Food Drive</option>
              <option value="cloth_donation">👕 Cloth Donation</option>
              <option value="waste_collection">♻️ Waste Collection</option>
              <option value="beach_cleaning">🏖️ Beach Cleaning</option>
              <option value="tree_planting">🌳 Tree Planting</option>
              <option value="others">📝 Others</option>
            </select>
            <Input
              type="number"
              value={form.max_volunteers}
              onChange={(e) => setForm({ ...form, max_volunteers: parseInt(e.target.value) || 20 })}
              placeholder="Max volunteers"
              min={5}
              max={500}
            />
          </div>
          {form.category === "others" && (
            <Input
              value={form.customCategory}
              onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
              placeholder="Enter event type (e.g., Blood Drive, Mentorship, etc.)"
              required
            />
          )}
          <Input
            type="datetime-local"
            value={form.event_date}
            onChange={(e) => setForm({ ...form, event_date: e.target.value })}
            required
          />
          <Input
            value={form.location_address}
            onChange={(e) => setForm({ ...form, location_address: e.target.value })}
            placeholder="Event location address"
            required
          />
          <Input
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="Cover image URL (optional)"
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 cursor-pointer">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1 cursor-pointer">
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
