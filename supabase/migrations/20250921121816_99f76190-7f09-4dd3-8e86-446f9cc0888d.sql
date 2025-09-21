-- Create comprehensive tables for the AI legal document analysis system

-- Extend documents table with new fields for comprehensive analysis
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'general',
ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS rights_shield_score INTEGER,
ADD COLUMN IF NOT EXISTS financial_fairness_score INTEGER,
ADD COLUMN IF NOT EXISTS termination_flexibility_score INTEGER,
ADD COLUMN IF NOT EXISTS privacy_data_score INTEGER,
ADD COLUMN IF NOT EXISTS legal_liability_score INTEGER,
ADD COLUMN IF NOT EXISTS ethics_fairness_score INTEGER,
ADD COLUMN IF NOT EXISTS parsed_content TEXT,
ADD COLUMN IF NOT EXISTS key_clauses JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS risk_factors JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS important_dates JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS obligations JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS word_count INTEGER,
ADD COLUMN IF NOT EXISTS page_count INTEGER;

-- Create analysis results table
CREATE TABLE IF NOT EXISTS public.analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id BIGINT REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  result_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create contract templates table for counter-doc marketplace
CREATE TABLE IF NOT EXISTS public.contract_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  template_content TEXT NOT NULL,
  description TEXT,
  fairness_score INTEGER,
  usage_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create community benchmarks table
CREATE TABLE IF NOT EXISTS public.community_benchmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  percentile_25 NUMERIC,
  percentile_50 NUMERIC,
  percentile_75 NUMERIC,
  percentile_90 NUMERIC,
  sample_size INTEGER,
  geography TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create clause explanations table for AI storytelling
CREATE TABLE IF NOT EXISTS public.clause_explanations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clause_type TEXT NOT NULL,
  clause_pattern TEXT NOT NULL,
  explanation TEXT NOT NULL,
  scenario_example TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat sessions table for AI buddy mode
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id BIGINT REFERENCES public.documents(id) ON DELETE CASCADE,
  personality_mode TEXT DEFAULT 'teacher',
  session_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clause_explanations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for analysis_results
CREATE POLICY "analysis_results_select_by_owner" ON public.analysis_results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "analysis_results_insert_by_owner" ON public.analysis_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "analysis_results_update_by_owner" ON public.analysis_results
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "analysis_results_delete_by_owner" ON public.analysis_results
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for contract_templates (public read, owner write)
CREATE POLICY "contract_templates_select_all" ON public.contract_templates
  FOR SELECT USING (true);
CREATE POLICY "contract_templates_insert_by_auth" ON public.contract_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "contract_templates_update_by_owner" ON public.contract_templates
  FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "contract_templates_delete_by_owner" ON public.contract_templates
  FOR DELETE USING (auth.uid() = created_by);

-- RLS policies for community_benchmarks (public read)
CREATE POLICY "community_benchmarks_select_all" ON public.community_benchmarks
  FOR SELECT USING (true);

-- RLS policies for clause_explanations (public read)
CREATE POLICY "clause_explanations_select_all" ON public.clause_explanations
  FOR SELECT USING (true);

-- RLS policies for chat_sessions
CREATE POLICY "chat_sessions_select_by_owner" ON public.chat_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "chat_sessions_insert_by_owner" ON public.chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chat_sessions_update_by_owner" ON public.chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "chat_sessions_delete_by_owner" ON public.chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for chat_messages (through session ownership)
CREATE POLICY "chat_messages_select_by_session_owner" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );
CREATE POLICY "chat_messages_insert_by_session_owner" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions 
      WHERE chat_sessions.id = chat_messages.session_id 
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_analysis_results_updated_at
    BEFORE UPDATE ON public.analysis_results
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contract_templates_updated_at
    BEFORE UPDATE ON public.contract_templates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
    BEFORE UPDATE ON public.chat_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for clause explanations
INSERT INTO public.clause_explanations (clause_type, clause_pattern, explanation, scenario_example, risk_level) VALUES
('termination_notice', 'notice.*([0-9]+).*days?', 'This clause specifies how much advance notice is required before termination.', 'If you lose your job and need to move out, a 90-day notice means you''ll need to keep paying rent for 3 months even after you decide to leave.', 'medium'),
('penalty_clause', 'penalty|fine|damages.*\$([0-9,]+)', 'This establishes financial penalties for breaking the agreement.', 'Breaking this contract early could cost you the specified amount, even if it''s not your fault.', 'high'),
('automatic_renewal', 'automatic.*renew|auto.*extend', 'The contract will automatically continue unless you actively cancel it.', 'Your gym membership will keep charging your card every year unless you remember to cancel before the renewal date.', 'medium'),
('liability_limitation', 'limit.*liability|not.*liable.*for', 'This reduces or eliminates the other party''s responsibility for damages.', 'If the service fails and causes you financial loss, this clause might prevent you from getting compensation.', 'high'),
('arbitration_clause', 'arbitration|binding.*dispute', 'Disputes must be resolved through arbitration instead of court.', 'If there''s a problem, you can''t sue in court - you''ll have to use their chosen arbitration process, which might be less favorable to you.', 'medium');

-- Insert sample community benchmarks
INSERT INTO public.community_benchmarks (category, metric_name, metric_value, percentile_25, percentile_50, percentile_75, percentile_90, sample_size, geography) VALUES
('rental_agreements', 'termination_notice_days', 45, 30, 30, 60, 90, 1250, 'US_National'),
('rental_agreements', 'security_deposit_months', 1.5, 1, 1, 2, 2, 1250, 'US_National'),
('employment_contracts', 'notice_period_days', 14, 7, 14, 30, 60, 890, 'US_National'),
('employment_contracts', 'non_compete_months', 6, 3, 6, 12, 24, 890, 'US_National'),
('service_agreements', 'cancellation_fee_percent', 15, 0, 10, 25, 50, 650, 'US_National');

-- Insert sample contract templates
INSERT INTO public.contract_templates (name, category, template_content, description, fairness_score, tags, is_verified) VALUES
('Fair Rental Agreement', 'rental', 'RESIDENTIAL LEASE AGREEMENT

This lease agreement is designed with tenant rights in mind, featuring:
- 30-day termination notice (industry standard)
- Security deposit limited to 1 month rent
- Clear maintenance responsibilities
- Reasonable privacy protections

[Template content would continue...]', 'A balanced rental agreement that protects both landlord and tenant rights while meeting industry standards.', 85, ARRAY['rental', 'fair', 'tenant-friendly'], true),
('Startup-Friendly Service Agreement', 'service', 'SERVICE AGREEMENT

This service agreement includes:
- Flexible termination with 30-day notice
- Reasonable liability limitations
- Clear deliverable definitions
- IP ownership protections

[Template content would continue...]', 'A service agreement template designed for startups with fair terms for both parties.', 78, ARRAY['service', 'startup', 'fair'], true);