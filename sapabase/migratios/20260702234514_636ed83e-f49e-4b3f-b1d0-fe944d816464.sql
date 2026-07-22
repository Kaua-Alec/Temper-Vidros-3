
-- CLIENTES
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  documento TEXT,
  endereco TEXT,
  cidade TEXT,
  observacoes TEXT,
  criado_por TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO anon, authenticated;
GRANT ALL ON public.clientes TO service_role;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acesso publico clientes" ON public.clientes FOR ALL USING (true) WITH CHECK (true);

-- CATÁLOGO DE PRODUTOS (dados reais de vidraçaria)
CREATE TABLE public.catalogo_produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  unidade TEXT NOT NULL DEFAULT 'm²',
  preco_m2 NUMERIC(10,2),
  preco_unitario NUMERIC(10,2),
  espessura TEXT,
  cor TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalogo_produtos TO anon, authenticated;
GRANT ALL ON public.catalogo_produtos TO service_role;
ALTER TABLE public.catalogo_produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acesso publico catalogo" ON public.catalogo_produtos FOR ALL USING (true) WITH CHECK (true);

-- ORÇAMENTOS
CREATE TABLE public.orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL UNIQUE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  cliente_nome TEXT,
  status TEXT NOT NULL DEFAULT 'Pendente',
  validade DATE,
  forma_pagamento TEXT,
  desconto NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  observacoes TEXT,
  criado_por TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orcamentos TO anon, authenticated;
GRANT ALL ON public.orcamentos TO service_role;
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acesso publico orcamentos" ON public.orcamentos FOR ALL USING (true) WITH CHECK (true);

-- ITENS DO ORÇAMENTO
CREATE TABLE public.orcamento_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id UUID NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.catalogo_produtos(id),
  nome TEXT NOT NULL,
  descricao TEXT,
  quantidade NUMERIC(10,2) NOT NULL DEFAULT 1,
  largura_mm INTEGER,
  altura_mm INTEGER,
  espessura TEXT,
  cor TEXT,
  valor_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orcamento_itens TO anon, authenticated;
GRANT ALL ON public.orcamento_itens TO service_role;
ALTER TABLE public.orcamento_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acesso publico itens" ON public.orcamento_itens FOR ALL USING (true) WITH CHECK (true);

-- PEDIDOS / PRODUÇÃO
CREATE TABLE public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL UNIQUE,
  orcamento_id UUID REFERENCES public.orcamentos(id) ON DELETE SET NULL,
  cliente_nome TEXT,
  status TEXT NOT NULL DEFAULT 'Aguardando material',
  data_prevista DATE,
  responsavel TEXT,
  observacoes TEXT,
  criado_por TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos TO anon, authenticated;
GRANT ALL ON public.pedidos TO service_role;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acesso publico pedidos" ON public.pedidos FOR ALL USING (true) WITH CHECK (true);

-- AGENDA
CREATE TABLE public.agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  cliente_nome TEXT,
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL DEFAULT 'Instalação',
  data DATE NOT NULL,
  hora TIME,
  endereco TEXT,
  responsavel TEXT,
  status TEXT NOT NULL DEFAULT 'Agendado',
  observacoes TEXT,
  criado_por TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agendamentos TO anon, authenticated;
GRANT ALL ON public.agendamentos TO service_role;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acesso publico agenda" ON public.agendamentos FOR ALL USING (true) WITH CHECK (true);

-- FINANCEIRO
CREATE TABLE public.financeiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL DEFAULT 'Receita',
  descricao TEXT NOT NULL,
  orcamento_id UUID REFERENCES public.orcamentos(id) ON DELETE SET NULL,
  cliente_nome TEXT,
  valor NUMERIC(12,2) NOT NULL,
  vencimento DATE,
  pago_em DATE,
  status TEXT NOT NULL DEFAULT 'Pendente',
  metodo TEXT,
  criado_por TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financeiro TO anon, authenticated;
GRANT ALL ON public.financeiro TO service_role;
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acesso publico financeiro" ON public.financeiro FOR ALL USING (true) WITH CHECK (true);

-- ESTOQUE
CREATE TABLE public.estoque (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material TEXT NOT NULL,
  categoria TEXT,
  unidade TEXT NOT NULL DEFAULT 'un',
  quantidade NUMERIC(12,2) NOT NULL DEFAULT 0,
  minimo NUMERIC(12,2) NOT NULL DEFAULT 0,
  preco_unitario NUMERIC(12,2),
  fornecedor TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estoque TO anon, authenticated;
GRANT ALL ON public.estoque TO service_role;
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acesso publico estoque" ON public.estoque FOR ALL USING (true) WITH CHECK (true);

-- MENSAGENS (chat interno entre usuários)
CREATE TABLE public.mensagens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  autor TEXT NOT NULL,
  texto TEXT NOT NULL,
  contexto TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mensagens TO anon, authenticated;
GRANT ALL ON public.mensagens TO service_role;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acesso publico mensagens" ON public.mensagens FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.mensagens;
ALTER PUBLICATION supabase_realtime ADD TABLE public.orcamentos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;

-- TRIGGER updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_clientes_upd BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_orcamentos_upd BEFORE UPDATE ON public.orcamentos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_pedidos_upd BEFORE UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_estoque_upd BEFORE UPDATE ON public.estoque FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SEED CATÁLOGO DE PRODUTOS (produtos reais de vidraçaria)
INSERT INTO public.catalogo_produtos (categoria, nome, descricao, unidade, preco_m2, espessura, cor) VALUES
('Vidro Temperado', 'Vidro Temperado Incolor 8mm', 'Vidro temperado transparente para box, portas e divisórias', 'm²', 320.00, '8mm', 'Incolor'),
('Vidro Temperado', 'Vidro Temperado Incolor 10mm', 'Vidro temperado reforçado 10mm', 'm²', 420.00, '10mm', 'Incolor'),
('Vidro Temperado', 'Vidro Temperado Fumê 8mm', 'Vidro temperado fumê para privacidade', 'm²', 380.00, '8mm', 'Fumê'),
('Vidro Temperado', 'Vidro Temperado Verde 8mm', 'Vidro temperado verde', 'm²', 390.00, '8mm', 'Verde'),
('Vidro Comum', 'Vidro Liso Incolor 4mm', 'Vidro comum 4mm para janelas', 'm²', 95.00, '4mm', 'Incolor'),
('Vidro Comum', 'Vidro Liso Incolor 6mm', 'Vidro comum 6mm', 'm²', 145.00, '6mm', 'Incolor'),
('Vidro Laminado', 'Vidro Laminado 8mm (4+4)', 'Vidro laminado de segurança', 'm²', 480.00, '8mm', 'Incolor'),
('Vidro Laminado', 'Vidro Laminado 10mm (5+5)', 'Vidro laminado 10mm alta resistência', 'm²', 620.00, '10mm', 'Incolor'),
('Espelho', 'Espelho Cristal 4mm', 'Espelho cristal 4mm', 'm²', 210.00, '4mm', 'Prata'),
('Espelho', 'Espelho Bronze 4mm', 'Espelho bronze decorativo', 'm²', 260.00, '4mm', 'Bronze'),
('Box', 'Box Frontal 2 Folhas Suprema', 'Box frontal duas folhas de correr temperado 8mm', 'un', NULL, '8mm', 'Incolor'),
('Box', 'Box Kite F1-150 Frontal', 'Box frontal 1,50m com kit alumínio', 'un', NULL, '8mm', 'Cromado'),
('Box', 'Box Angular Elegance', 'Box angular canto 90x90 temperado 8mm', 'un', NULL, '8mm', 'Incolor'),
('Janela', 'Janela 2 Folhas Suprema Alumínio', 'Janela 2 folhas correr alumínio branco 1,20x1,00', 'un', NULL, NULL, 'Branco'),
('Janela', 'Janela Maxim-Ar Alumínio', 'Janela maxim-ar 0,60x0,60 alumínio', 'un', NULL, NULL, 'Branco'),
('Janela', 'Janela 4 Folhas Sasazaki Gold', 'Janela 4 folhas correr 2,00x1,20', 'un', NULL, NULL, 'Branco'),
('Porta', 'Porta Pivotante Gold IV Alumínio', 'Porta pivotante alumínio 90x210', 'un', NULL, NULL, 'Branco'),
('Porta', 'Porta Balcão 3 Folhas Alumínio', 'Porta balcão alumínio 3 folhas 2,10x2,10', 'un', NULL, NULL, 'Branco'),
('Porta', 'Porta de Vidro Temperado 10mm', 'Porta pivotante em vidro temperado 10mm 90x210', 'un', NULL, '10mm', 'Incolor'),
('Guarda-Corpo', 'Guarda-Corpo Vidro 10mm', 'Guarda-corpo vidro temperado 10mm com ferragens inox', 'm²', 780.00, '10mm', 'Incolor'),
('Ferragem', 'Kit Box Frontal Cromado', 'Kit ferragens box frontal cromado brilhante', 'un', NULL, NULL, 'Cromado'),
('Ferragem', 'Dobradiça Alavanca Cromada', 'Dobradiça alavanca vidro-vidro cromada', 'un', NULL, NULL, 'Cromado'),
('Serviço', 'Instalação Box', 'Serviço de instalação de box', 'un', NULL, NULL, NULL),
('Serviço', 'Instalação Janela', 'Serviço de instalação de janela', 'un', NULL, NULL, NULL),
('Serviço', 'Medição Técnica', 'Visita técnica para medição', 'un', NULL, NULL, NULL);

-- SEED ESTOQUE INICIAL
INSERT INTO public.estoque (material, categoria, unidade, quantidade, minimo, preco_unitario, fornecedor) VALUES
('Vidro Temperado Incolor 8mm', 'Vidro', 'm²', 45.5, 20, 180.00, 'Vidraria Central'),
('Vidro Temperado Fumê 8mm', 'Vidro', 'm²', 12.0, 15, 210.00, 'Vidraria Central'),
('Perfil Alumínio Branco 6m', 'Perfil', 'br', 32, 20, 85.00, 'AluBrasil'),
('Kit Box Cromado', 'Ferragem', 'kit', 8, 5, 320.00, 'Ferragens SA'),
('Silicone Neutro Incolor', 'Consumível', 'un', 24, 10, 32.00, 'Loja Materiais'),
('Silicone Neutro Preto', 'Consumível', 'un', 18, 10, 32.00, 'Loja Materiais'),
('Dobradiça Alavanca Cromada', 'Ferragem', 'un', 15, 10, 78.00, 'Ferragens SA'),
('Roldana Box Correr', 'Ferragem', 'un', 40, 20, 12.00, 'Ferragens SA');
