-- Create profiles table
create table profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  primary key (id)
);

alter table profiles enable row level security;

create policy "Users can view their own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Trigger to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create waitlist table
create table waitlist (
  id uuid not null default gen_random_uuid(),
  email text not null unique,
  source text,
  created_at timestamp with time zone not null default now(),
  primary key (id)
);

alter table waitlist enable row level security;

create policy "Waitlist insert only for anon" on waitlist
  for insert with check (true);

-- Create purchases table
create table purchases (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  store text not null,
  item_name text not null,
  purchase_price numeric,
  purchase_date date,
  receipt_url text,
  category text,
  return_deadline date,
  return_policy_days integer,
  status text not null default 'active',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  primary key (id)
);

alter table purchases enable row level security;

create policy "Users can view their own purchases" on purchases
  for select using (auth.uid() = user_id);

create policy "Users can insert their own purchases" on purchases
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own purchases" on purchases
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own purchases" on purchases
  for delete using (auth.uid() = user_id);

create index purchases_user_id_idx on purchases(user_id);

-- Create subscriptions table
create table subscriptions (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  service_name text not null,
  monthly_cost numeric,
  billing_date date,
  last_used date,
  is_active boolean not null default true,
  category text,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  primary key (id)
);

alter table subscriptions enable row level security;

create policy "Users can view their own subscriptions" on subscriptions
  for select using (auth.uid() = user_id);

create policy "Users can insert their own subscriptions" on subscriptions
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own subscriptions" on subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own subscriptions" on subscriptions
  for delete using (auth.uid() = user_id);

create index subscriptions_user_id_idx on subscriptions(user_id);

-- Create warranties table
create table warranties (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  product_name text not null,
  brand text,
  purchase_date date,
  warranty_months integer not null default 12,
  expiry_date date,
  receipt_url text,
  status text not null default 'active',
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  primary key (id)
);

alter table warranties enable row level security;

create policy "Users can view their own warranties" on warranties
  for select using (auth.uid() = user_id);

create policy "Users can insert their own warranties" on warranties
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own warranties" on warranties
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own warranties" on warranties
  for delete using (auth.uid() = user_id);

create index warranties_user_id_idx on warranties(user_id);

-- Create price_alerts table
create table price_alerts (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  purchase_id uuid not null references purchases on delete cascade,
  original_price numeric,
  current_price numeric,
  price_drop numeric,
  alert_status text not null default 'pending',
  checked_at timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  primary key (id)
);

alter table price_alerts enable row level security;

create policy "Users can view their own price alerts" on price_alerts
  for select using (auth.uid() = user_id);

create policy "Users can insert their own price alerts" on price_alerts
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own price alerts" on price_alerts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own price alerts" on price_alerts
  for delete using (auth.uid() = user_id);

create index price_alerts_user_id_idx on price_alerts(user_id);
create index price_alerts_purchase_id_idx on price_alerts(purchase_id);

-- Create delivery_tracking table
create table delivery_tracking (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  carrier text,
  tracking_number text,
  expected_date date,
  actual_date date,
  is_late boolean not null default false,
  credit_amount numeric,
  status text not null default 'tracking',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  primary key (id)
);

alter table delivery_tracking enable row level security;

create policy "Users can view their own deliveries" on delivery_tracking
  for select using (auth.uid() = user_id);

create policy "Users can insert their own deliveries" on delivery_tracking
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own deliveries" on delivery_tracking
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own deliveries" on delivery_tracking
  for delete using (auth.uid() = user_id);

create index delivery_tracking_user_id_idx on delivery_tracking(user_id);

-- Create outage_claims table
create table outage_claims (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  provider text not null,
  outage_date date,
  duration_hours numeric,
  credit_amount numeric,
  status text not null default 'pending',
  created_at timestamp with time zone not null default now(),
  primary key (id)
);

alter table outage_claims enable row level security;

create policy "Users can view their own outage claims" on outage_claims
  for select using (auth.uid() = user_id);

create policy "Users can insert their own outage claims" on outage_claims
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own outage claims" on outage_claims
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own outage claims" on outage_claims
  for delete using (auth.uid() = user_id);

create index outage_claims_user_id_idx on outage_claims(user_id);

-- Create recovery_log table
create table recovery_log (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  channel text,
  amount numeric,
  description text,
  status text not null default 'recovered',
  created_at timestamp with time zone not null default now(),
  primary key (id)
);

alter table recovery_log enable row level security;

create policy "Users can view their own recovery logs" on recovery_log
  for select using (auth.uid() = user_id);

create policy "Users can insert their own recovery logs" on recovery_log
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own recovery logs" on recovery_log
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete their own recovery logs" on recovery_log
  for delete using (auth.uid() = user_id);

create index recovery_log_user_id_idx on recovery_log(user_id);
