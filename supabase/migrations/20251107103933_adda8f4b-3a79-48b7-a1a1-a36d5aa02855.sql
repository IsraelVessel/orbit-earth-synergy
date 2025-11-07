-- Create simulations table to store user simulation results
create table public.simulations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  business_model text not null,
  parameters jsonb not null,
  results jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.simulations enable row level security;

-- Create policies
create policy "Users can view their own simulations"
  on public.simulations
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own simulations"
  on public.simulations
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own simulations"
  on public.simulations
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own simulations"
  on public.simulations
  for delete
  using (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
create trigger on_simulation_updated
  before update on public.simulations
  for each row execute procedure public.handle_updated_at();