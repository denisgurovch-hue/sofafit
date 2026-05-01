CREATE TABLE public.generation_logs (
  id bigserial PRIMARY KEY,
  request_id text NOT NULL,
  function_name text NOT NULL,
  event text NOT NULL,
  elapsed_ms integer,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_generation_logs_request_id ON public.generation_logs(request_id);
CREATE INDEX idx_generation_logs_created_at ON public.generation_logs(created_at DESC);

ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all logs"
  ON public.generation_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));