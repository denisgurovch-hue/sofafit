ALTER TABLE public.generations 
  ADD COLUMN IF NOT EXISTS request_id text,
  ADD COLUMN IF NOT EXISTS enhance_request_id text;

CREATE INDEX IF NOT EXISTS idx_generations_request_id ON public.generations(request_id);
CREATE INDEX IF NOT EXISTS idx_generations_enhance_request_id ON public.generations(enhance_request_id);