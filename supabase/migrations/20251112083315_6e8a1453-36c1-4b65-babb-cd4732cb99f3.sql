-- Create collaboration/sharing table
CREATE TABLE public.simulation_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  simulation_id UUID NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES public.profiles(id),
  shared_with_email TEXT NOT NULL,
  permission TEXT NOT NULL CHECK (permission IN ('view', 'edit')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.simulation_shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for simulation_shares
CREATE POLICY "Users can view shares they created"
  ON public.simulation_shares FOR SELECT
  USING (auth.uid() = shared_by);

CREATE POLICY "Users can create shares for their simulations"
  ON public.simulation_shares FOR INSERT
  WITH CHECK (
    auth.uid() = shared_by AND
    EXISTS (SELECT 1 FROM public.simulations WHERE id = simulation_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete their shares"
  ON public.simulation_shares FOR DELETE
  USING (auth.uid() = shared_by);

-- Create version history table
CREATE TABLE public.simulation_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  simulation_id UUID NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  parameters JSONB NOT NULL,
  results JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  notes TEXT,
  UNIQUE(simulation_id, version_number)
);

-- Enable RLS
ALTER TABLE public.simulation_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for simulation_versions
CREATE POLICY "Users can view versions of their simulations"
  ON public.simulation_versions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.simulations WHERE id = simulation_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create versions for their simulations"
  ON public.simulation_versions FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (SELECT 1 FROM public.simulations WHERE id = simulation_id AND user_id = auth.uid())
  );

-- Create A/B testing table
CREATE TABLE public.ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  test_name TEXT NOT NULL,
  business_model TEXT NOT NULL,
  base_parameters JSONB NOT NULL,
  variations JSONB NOT NULL,
  results JSONB,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ab_tests
CREATE POLICY "Users can view their own AB tests"
  ON public.ab_tests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AB tests"
  ON public.ab_tests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AB tests"
  ON public.ab_tests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AB tests"
  ON public.ab_tests FOR DELETE
  USING (auth.uid() = user_id);

-- Create scenarios table for what-if analysis
CREATE TABLE public.simulation_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  simulation_id UUID NOT NULL REFERENCES public.simulations(id) ON DELETE CASCADE,
  scenario_name TEXT NOT NULL,
  description TEXT,
  parameters JSONB NOT NULL,
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.simulation_scenarios ENABLE ROW LEVEL SECURITY;

-- RLS Policies for simulation_scenarios
CREATE POLICY "Users can view scenarios for their simulations"
  ON public.simulation_scenarios FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.simulations WHERE id = simulation_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create scenarios for their simulations"
  ON public.simulation_scenarios FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.simulations WHERE id = simulation_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update scenarios for their simulations"
  ON public.simulation_scenarios FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.simulations WHERE id = simulation_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete scenarios for their simulations"
  ON public.simulation_scenarios FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.simulations WHERE id = simulation_id AND user_id = auth.uid())
  );

-- Add trigger for updated_at
CREATE TRIGGER update_simulation_shares_updated_at
  BEFORE UPDATE ON public.simulation_shares
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_ab_tests_updated_at
  BEFORE UPDATE ON public.ab_tests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_simulation_scenarios_updated_at
  BEFORE UPDATE ON public.simulation_scenarios
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();