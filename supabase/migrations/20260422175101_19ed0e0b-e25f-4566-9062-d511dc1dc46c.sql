
-- Roles enum and user_roles table
create type public.app_role as enum ('admin', 'customer');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create policy "Users view their own roles" on public.user_roles
  for select using (auth.uid() = user_id);

create policy "Admins view all roles" on public.user_roles
  for select using (public.has_role(auth.uid(), 'admin'));

-- Auto-assign admin role to specific email + customer to others
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email = 'amrfathylithy2030@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'customer');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null check (price >= 0),
  description text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Anyone can view products" on public.products
  for select using (true);

create policy "Admins manage products" on public.products
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Orders
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  phone text not null,
  address text not null,
  total_amount numeric(10,2) not null,
  status text not null default 'pending',
  receipt_url text not null,
  items jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Users view their own orders" on public.orders
  for select using (auth.uid() = user_id);

create policy "Admins view all orders" on public.orders
  for select using (public.has_role(auth.uid(), 'admin'));

create policy "Authenticated users create orders" on public.orders
  for insert with check (auth.uid() = user_id);

create policy "Admins update orders" on public.orders
  for update using (public.has_role(auth.uid(), 'admin'));

-- Storage buckets
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
insert into storage.buckets (id, name, public) values ('receipts', 'receipts', true);

create policy "Public can view product images" on storage.objects
  for select using (bucket_id = 'product-images');

create policy "Admins upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins update product images" on storage.objects
  for update using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

create policy "Admins delete product images" on storage.objects
  for delete using (bucket_id = 'product-images' and public.has_role(auth.uid(), 'admin'));

create policy "Public can view receipts" on storage.objects
  for select using (bucket_id = 'receipts');

create policy "Authenticated upload receipts" on storage.objects
  for insert with check (bucket_id = 'receipts' and auth.role() = 'authenticated');
