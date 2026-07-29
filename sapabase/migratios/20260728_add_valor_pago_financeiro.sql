-- Adiciona a coluna valor_pago na tabela public.financeiro
ALTER TABLE public.financeiro
  ADD COLUMN IF NOT EXISTS valor_pago NUMERIC(12,2) DEFAULT 0;
