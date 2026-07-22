-- Adiciona campos num_folhas, largura_mm, altura_mm e margem_lucro em catalogo_produtos
-- num_folhas: distingue janelas de 2, 4, 6 folhas na prévia do orçamento
-- largura_mm / altura_mm: medidas padrão com preço fixo por tamanho
-- margem_lucro: percentual de lucro aplicado sobre o preço base no orçamento
ALTER TABLE public.catalogo_produtos
  ADD COLUMN IF NOT EXISTS num_folhas INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS largura_mm INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS altura_mm INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS margem_lucro NUMERIC(5,2) DEFAULT NULL;
