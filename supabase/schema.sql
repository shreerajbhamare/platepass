-- PlatePass Database Schema
-- Supabase PostgreSQL

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- ============================================
-- ENUMS
-- ============================================

create type user_role as enum ('lister', 'seeker', 'runner', 'org', 'admin');
create type listing_status as enum ('active', 'claimed', 'expired', 'cancelled');
create type food_category as enum ('prepared', 'produce', 'packaged', 'baked', 'beverages', 'other');
create type storage_type as enum ('hot', 'cold', 'room_temp', 'frozen');
create type claim_status as enum ('reserved', 'picked_up', 'completed', 'cancelled', 'expired');
create type delivery_status as enum ('requested', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled');

-- ============================================
-- USERS / PROFILES
-- ============================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  role user_role not null default 'seeker',
  phone text,
  preferred_radius_km numeric(4,1) default 2.0,
  dietary_preferences text[] default '{}',
  allergens text[] default '{}',
  notification_enabled boolean default true,
  location geography(point, 4326),
  impact_score integer default 0,
  meals_shared integer default 0,
  meals_claimed integer default 0,
  deliveries_completed integer default 0,
  streak_days integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- LISTINGS
-- ============================================

create table listings (
  id uuid primary key default uuid_generate_v4(),
  lister_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  description text,
  photo_url text,
  photo_alt_text text,
  food_category food_category not null default 'other',
  dietary_tags text[] default '{}',
  allergens text[] default '{}',
  quantity_total integer not null default 1,
  quantity_remaining integer not null default 1,
  storage storage_type not null default 'room_temp',
  is_flash boolean default false,
  pickup_address text not null,
  pickup_instructions text,
  location geography(point, 4326) not null,
  pickup_start timestamptz not null default now(),
  pickup_end timestamptz not null,
  prepared_at timestamptz,
  rot_score integer default 100,
  status listing_status not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Geospatial index for proximity queries
create index idx_listings_location on listings using gist(location);
-- Filter active listings quickly
create index idx_listings_status on listings(status) where status = 'active';
-- Time-based expiry queries
create index idx_listings_pickup_end on listings(pickup_end) where status = 'active';
-- Lister's own listings
create index idx_listings_lister on listings(lister_id);

-- ============================================
-- CLAIMS
-- ============================================

create table claims (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references listings(id) on delete cascade,
  claimer_id uuid references profiles(id) on delete set null,
  claimer_name text, -- for anonymous claims
  claimer_phone text, -- for pickup coordination
  quantity integer not null default 1,
  status claim_status not null default 'reserved',
  reserved_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '15 minutes'),
  picked_up_at timestamptz,
  created_at timestamptz default now()
);

create index idx_claims_listing on claims(listing_id);
create index idx_claims_claimer on claims(claimer_id);
create index idx_claims_status on claims(status) where status = 'reserved';

-- ============================================
-- DELIVERIES (Runner System)
-- ============================================

create table deliveries (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references listings(id) on delete cascade,
  claim_id uuid references claims(id) on delete set null,
  runner_id uuid references profiles(id) on delete set null,
  requester_id uuid references profiles(id) on delete set null,
  pickup_location geography(point, 4326) not null,
  dropoff_location geography(point, 4326),
  dropoff_address text,
  status delivery_status not null default 'requested',
  accepted_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

create index idx_deliveries_runner on deliveries(runner_id);
create index idx_deliveries_status on deliveries(status) where status in ('requested', 'accepted', 'in_transit');

-- ============================================
-- NOTIFICATIONS
-- ============================================

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null, -- 'flash_alert', 'claim_update', 'delivery_update', 'thank_you', 'freshness_alert'
  title text not null,
  body text,
  data jsonb default '{}',
  read boolean default false,
  created_at timestamptz default now()
);

create index idx_notifications_user on notifications(user_id, read);

-- ============================================
-- THANK YOU NOTES
-- ============================================

create table thank_yous (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references listings(id) on delete cascade,
  from_user_id uuid references profiles(id) on delete set null,
  message text not null,
  created_at timestamptz default now()
);

-- ============================================
-- IMPACT STATS (Aggregated)
-- ============================================

create table impact_stats (
  id uuid primary key default uuid_generate_v4(),
  date date not null default current_date,
  neighborhood text,
  meals_saved integer default 0,
  lbs_diverted numeric(10,2) default 0,
  co2_prevented_lbs numeric(10,2) default 0,
  active_listings integer default 0,
  total_claims integer default 0,
  total_deliveries integer default 0,
  unique (date, neighborhood)
);

-- ============================================
-- PUSH SUBSCRIPTIONS (PWA)
-- ============================================

create table push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  endpoint text not null,
  keys jsonb not null, -- { p256dh, auth }
  alert_radius_km numeric(4,1) default 2.0,
  flash_alerts boolean default true,
  created_at timestamptz default now()
);

create index idx_push_user on push_subscriptions(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

alter table profiles enable row level security;
alter table listings enable row level security;
alter table claims enable row level security;
alter table deliveries enable row level security;
alter table notifications enable row level security;
alter table thank_yous enable row level security;
alter table push_subscriptions enable row level security;

-- PROFILES: anyone can read, users can update own
create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- LISTINGS: anyone can read active, listers can create/update own
create policy "Active listings are viewable by everyone"
  on listings for select using (status = 'active' or lister_id = auth.uid());

create policy "Authenticated users can create listings"
  on listings for insert with check (auth.uid() = lister_id);

create policy "Listers can update own listings"
  on listings for update using (auth.uid() = lister_id);

-- CLAIMS: lister + claimer can see, authenticated can create
create policy "Claims viewable by lister and claimer"
  on claims for select using (
    claimer_id = auth.uid() or
    listing_id in (select id from listings where lister_id = auth.uid())
  );

create policy "Authenticated users can create claims"
  on claims for insert with check (auth.uid() = claimer_id or claimer_id is null);

create policy "Claimer can update own claims"
  on claims for update using (claimer_id = auth.uid());

-- DELIVERIES: runner + requester can see
create policy "Deliveries viewable by participants"
  on deliveries for select using (
    runner_id = auth.uid() or requester_id = auth.uid()
  );

create policy "Authenticated users can create delivery requests"
  on deliveries for insert with check (auth.uid() = requester_id);

create policy "Runners can update accepted deliveries"
  on deliveries for update using (runner_id = auth.uid() or requester_id = auth.uid());

-- NOTIFICATIONS: users see own only
create policy "Users see own notifications"
  on notifications for select using (user_id = auth.uid());

create policy "Users can update own notifications"
  on notifications for update using (user_id = auth.uid());

-- THANK YOUS: anyone can read, authenticated can create
create policy "Thank yous are public"
  on thank_yous for select using (true);

create policy "Authenticated users can send thank yous"
  on thank_yous for insert with check (auth.uid() = from_user_id or from_user_id is null);

-- PUSH SUBSCRIPTIONS: users manage own
create policy "Users manage own push subscriptions"
  on push_subscriptions for all using (user_id = auth.uid());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Find nearby active listings within radius
create or replace function nearby_listings(
  user_lat double precision,
  user_lng double precision,
  radius_km double precision default 5.0
)
returns setof listings
language sql
stable
as $$
  select *
  from listings
  where status = 'active'
    and pickup_end > now()
    and st_dwithin(
      location,
      st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000
    )
  order by location <-> st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography;
$$;

-- Function: Calculate rot score
create or replace function calculate_rot_score(
  p_food_category food_category,
  p_storage storage_type,
  p_prepared_at timestamptz,
  p_ambient_temp_f numeric default 72
)
returns integer
language plpgsql
as $$
declare
  hours_elapsed numeric;
  base_hours numeric;
  temp_multiplier numeric;
  score numeric;
begin
  hours_elapsed := extract(epoch from (now() - p_prepared_at)) / 3600.0;

  -- Base safe hours by food category
  base_hours := case p_food_category
    when 'prepared' then 4.0
    when 'produce' then 24.0
    when 'baked' then 48.0
    when 'packaged' then 168.0
    when 'beverages' then 72.0
    else 6.0
  end;

  -- Storage multiplier
  base_hours := base_hours * case p_storage
    when 'frozen' then 10.0
    when 'cold' then 3.0
    when 'hot' then 0.8
    when 'room_temp' then 1.0
    else 1.0
  end;

  -- Temperature factor (food spoils faster in heat)
  temp_multiplier := case
    when p_ambient_temp_f > 90 then 0.5
    when p_ambient_temp_f > 80 then 0.7
    when p_ambient_temp_f > 70 then 1.0
    when p_ambient_temp_f < 40 then 2.0
    else 1.2
  end;

  base_hours := base_hours * temp_multiplier;

  -- Calculate score (100 = fresh, 0 = expired)
  score := greatest(0, least(100, 100 * (1 - (hours_elapsed / base_hours))));

  return score::integer;
end;
$$;

-- Function: Auto-expire listings (called by cron or edge function)
create or replace function expire_stale_listings()
returns void
language sql
as $$
  update listings
  set status = 'expired', updated_at = now()
  where status = 'active'
    and pickup_end < now();
$$;

-- Function: Expire stale claim reservations
create or replace function expire_stale_claims()
returns void
language sql
as $$
  update claims
  set status = 'expired'
  where status = 'reserved'
    and expires_at < now();
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Update quantity_remaining when claim is made
create or replace function update_listing_quantity()
returns trigger
language plpgsql
as $$
begin
  if TG_OP = 'INSERT' and new.status = 'reserved' then
    update listings
    set quantity_remaining = quantity_remaining - new.quantity,
        updated_at = now()
    where id = new.listing_id;
  elsif TG_OP = 'UPDATE' and old.status = 'reserved' and new.status = 'cancelled' then
    update listings
    set quantity_remaining = quantity_remaining + old.quantity,
        updated_at = now()
    where id = old.listing_id;
  end if;
  return new;
end;
$$;

create trigger on_claim_change
  after insert or update on claims
  for each row execute function update_listing_quantity();

-- Update profile impact stats on completed claim
create or replace function update_impact_stats()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'completed' and old.status != 'completed' then
    -- Update claimer stats
    update profiles
    set meals_claimed = meals_claimed + new.quantity,
        impact_score = impact_score + (new.quantity * 10),
        updated_at = now()
    where id = new.claimer_id;

    -- Update lister stats
    update profiles
    set meals_shared = meals_shared + new.quantity,
        impact_score = impact_score + (new.quantity * 15),
        updated_at = now()
    where id = (select lister_id from listings where id = new.listing_id);
  end if;
  return new;
end;
$$;

create trigger on_claim_completed
  after update on claims
  for each row execute function update_impact_stats();

-- ============================================
-- REALTIME
-- ============================================

-- Enable realtime on listings for live map updates
alter publication supabase_realtime add table listings;
alter publication supabase_realtime add table claims;
alter publication supabase_realtime add table deliveries;
