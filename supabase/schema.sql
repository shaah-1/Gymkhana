create extension if not exists pgcrypto;

create table if not exists public.products (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  category text not null default '',
  price numeric(12, 2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image text not null default '',
  description text not null default '',
  detailed_description text not null default '',
  benefits text[] not null default '{}',
  features text[] not null default '{}',
  how_to_use text not null default '',
  additional_info text not null default '',
  sizes text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text not null default '',
  first_name text not null default '',
  last_name text not null default '',
  phone text not null default '',
  address text not null default '',
  city text not null default '',
  state text not null default '',
  pincode text not null default '',
  country text not null default '',
  photo text not null default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  blocked boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  name text not null,
  category text not null default '',
  price numeric(12, 2) not null check (price >= 0),
  image text not null default '',
  stock integer not null default 0 check (stock >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id text not null references public.products (id) on delete cascade,
  name text not null,
  category text not null default '',
  price numeric(12, 2) not null check (price >= 0),
  image text not null default '',
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete restrict,
  customer jsonb not null,
  items jsonb not null,
  total numeric(12, 2) not null check (total >= 0),
  payment_method text not null,
  payment_status text not null default 'payment_pending',
  payment_details jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists orders_user_created_at_idx
  on public.orders (user_id, created_at desc);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
      and blocked = false
  );
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'name', '')
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_or_updated on auth.users;
create trigger on_auth_user_created_or_updated
  after insert or update of email on auth.users
  for each row execute procedure public.handle_new_auth_user();

alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.carts enable row level security;
alter table public.wishlists enable row level security;
alter table public.orders enable row level security;

revoke all on public.products, public.profiles, public.carts,
  public.wishlists, public.orders from anon, authenticated;
grant all on public.products to service_role;

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select on public.profiles to authenticated;
grant update (name, first_name, last_name, phone, address, city, state, pincode, country, photo, blocked)
  on public.profiles to authenticated;
grant select, insert, update, delete on public.carts, public.wishlists to authenticated;
grant select, update on public.orders to authenticated;

drop policy if exists "Products are public" on public.products;
create policy "Products are public"
  on public.products for select
  to anon, authenticated
  using (true);

drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products"
  on public.products for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Users read own profile or admins read all" on public.profiles;
create policy "Users read own profile or admins read all"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or public.is_admin());

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid())
    and role = 'customer'
    and blocked = false
  );

drop policy if exists "Admins update profiles" on public.profiles;
create policy "Admins update profiles"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Users manage own cart" on public.carts;
create policy "Users manage own cart"
  on public.carts for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users manage own wishlist" on public.wishlists;
create policy "Users manage own wishlist"
  on public.wishlists for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users read own orders or admins read all" on public.orders;
create policy "Users read own orders or admins read all"
  on public.orders for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders"
  on public.orders for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.place_order(
  p_customer jsonb,
  p_items jsonb,
  p_payment_method text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
  v_order_items jsonb := '[]'::jsonb;
  v_total numeric(12, 2) := 0;
  v_order public.orders%rowtype;
begin
  if v_user_id is null then
    raise exception 'Sign in before placing an order.';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = v_user_id and blocked = false
  ) then
    raise exception 'This account cannot place orders.';
  end if;

  if p_customer is null or jsonb_typeof(p_customer) <> 'object' then
    raise exception 'Customer details are required.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'An order must contain at least one product.';
  end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'An order must contain at least one product.';
  end if;

  if p_payment_method is distinct from 'cod' then
    raise exception 'Online payments are not configured.';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if coalesce(v_item ->> 'productId', '') = ''
      or coalesce(v_item ->> 'quantity', '') !~ '^[1-9][0-9]*$' then
      raise exception 'Invalid product or quantity in the order.';
    end if;
    v_quantity := (v_item ->> 'quantity')::integer;

    select * into v_product
    from public.products
    where id = v_item ->> 'productId'
    for update;

    if not found then
      raise exception 'A product in the order no longer exists.';
    end if;
    if v_product.stock < v_quantity then
      raise exception 'Insufficient stock for %.', v_product.name;
    end if;

    update public.products
    set stock = stock - v_quantity
    where id = v_product.id;

    v_total := v_total + v_product.price * v_quantity;
    v_order_items := v_order_items || jsonb_build_array(jsonb_build_object(
      'id', v_product.id,
      'productId', v_product.id,
      'name', v_product.name,
      'price', v_product.price,
      'image', v_product.image,
      'quantity', v_quantity
    ));
  end loop;

  insert into public.orders (
    user_id,
    customer,
    items,
    total,
    payment_method,
    payment_status,
    payment_details,
    status
  )
  values (
    v_user_id,
    p_customer,
    v_order_items,
    v_total,
    p_payment_method,
    case when p_payment_method = 'cod' then 'pay_on_delivery' else 'payment_pending' end,
    '{}'::jsonb,
    'pending'
  )
  returning * into v_order;

  return to_jsonb(v_order);
end;
$$;

create or replace function public.get_product_sales()
returns table (product_id text, sold bigint)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select item ->> 'productId', sum((item ->> 'quantity')::bigint)::bigint
  from public.orders as order_row
  cross join lateral jsonb_array_elements(order_row.items) as item
  where order_row.status <> 'cancelled'
  group by item ->> 'productId';
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
revoke all on function public.place_order(jsonb, jsonb, text) from public, anon;
grant execute on function public.place_order(jsonb, jsonb, text) to authenticated;
grant execute on function public.get_product_sales() to anon, authenticated;
