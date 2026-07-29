import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getUserName } from "@/lib/user";
import { Plus, Search, User, X } from "lucide-react";

export type ClienteItem = {
  id: string;
  nome: string;
  telefone?: string | null;
  endereco?: string | null;
  endereco_completo?: string | null;
  cidade?: string | null;
};

type ClienteSelectProps = {
  selectedCliente?: ClienteItem | null;
  selectedNome?: string;
  onSelectCliente: (cliente: ClienteItem) => void;
  required?: boolean;
  label?: string;
};

export function ClienteSelect({
  selectedCliente,
  selectedNome,
  onSelectCliente,
  required = false,
  label = "Cliente",
}: ClienteSelectProps) {
  const [clientes, setClientes] = useState<ClienteItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [busca, setBusca] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  // Quick form state
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");

  const loadClientes = async () => {
    const { data } = await supabase
      .from("clientes")
      .select("id, nome, telefone, endereco, cidade")
      .order("nome");
    if (data) {
      setClientes(
        data.map((c) => ({
          id: c.id,
          nome: c.nome,
          telefone: c.telefone,
          endereco: c.endereco,
          endereco_completo: c.endereco,
          cidade: c.cidade,
        }))
      );
    }
  };

  useEffect(() => {
    void loadClientes();
  }, []);

  const clientesFiltrados = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (c.telefone ?? "").includes(busca)
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !telefone || !endereco) {
      alert("Preencha Nome, Telefone e Endereço.");
      return;
    }

    const { data, error } = await supabase
      .from("clientes")
      .insert({
        nome,
        telefone,
        endereco,
        criado_por: getUserName(),
      })
      .select("id, nome, telefone, endereco, cidade")
      .single();

    if (error) {
      alert("Erro ao cadastrar cliente: " + error.message);
      return;
    }

    if (data) {
      const newCli: ClienteItem = {
        id: data.id,
        nome: data.nome,
        telefone: data.telefone,
        endereco: data.endereco,
        endereco_completo: data.endereco,
        cidade: data.cidade,
      };
      setClientes((prev) => [...prev, newCli].sort((a, b) => a.nome.localeCompare(b.nome)));
      onSelectCliente(newCli);
      setIsRegistering(false);
      setModalOpen(false);
    }
  };

  const displayName = selectedCliente?.nome || selectedNome || "";

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--muted-foreground)] block mb-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setBusca("");
            setIsRegistering(false);
            setModalOpen(true);
          }}
          className="flex-1 text-left rounded-lg border border-[color:var(--navy-border)] bg-[color:var(--navy-surface)] px-3 py-2.5 text-sm text-white focus:border-[color:var(--gold-dim)] transition flex items-center justify-between truncate"
        >
          <span className={displayName ? "text-white font-medium" : "text-[color:var(--muted-foreground)]"}>
            {displayName || "— Selecionar Cliente —"}
          </span>
          <Search className="h-3.5 w-3.5 text-[color:var(--gold)] shrink-0 ml-2" />
        </button>

        <button
          type="button"
          onClick={() => {
            setNome("");
            setTelefone("");
            setEndereco("");
            setIsRegistering(true);
            setModalOpen(true);
          }}
          title="Cadastrar Novo Cliente"
          className="px-3 bg-[color:var(--gold)]/10 border border-[color:var(--gold)]/25 rounded-lg text-[color:var(--gold-2)] hover:bg-[color:var(--gold)]/20 transition flex items-center justify-center shrink-0"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[color:var(--navy-card)] border border-[color:var(--navy-border)] rounded-xl p-4 shadow-2xl space-y-4"
          >
            {isRegistering ? (
              <form onSubmit={handleCreate} className="space-y-3">
                <div className="flex items-center justify-between border-b border-[color:var(--navy-border)] pb-2">
                  <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-4 w-4 text-[color:var(--gold)]" /> Novo Cliente
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="text-xs text-[color:var(--gold)] hover:underline"
                  >
                    Voltar à busca
                  </button>
                </div>

                <div>
                  <label className="text-[10px] text-[color:var(--muted-foreground)] uppercase font-semibold">Nome *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full mt-1 bg-[color:var(--navy-surface)] border border-[color:var(--navy-border)] rounded-md px-3 py-1.5 text-sm text-white focus:border-[color:var(--gold-dim)] outline-none"
                    placeholder="Nome completo..."
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[color:var(--muted-foreground)] uppercase font-semibold">Telefone *</label>
                  <input
                    type="text"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full mt-1 bg-[color:var(--navy-surface)] border border-[color:var(--navy-border)] rounded-md px-3 py-1.5 text-sm text-white focus:border-[color:var(--gold-dim)] outline-none"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[color:var(--muted-foreground)] uppercase font-semibold">Endereço Completo *</label>
                  <textarea
                    required
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    rows={2}
                    className="w-full mt-1 bg-[color:var(--navy-surface)] border border-[color:var(--navy-border)] rounded-md px-3 py-1.5 text-sm text-white focus:border-[color:var(--gold-dim)] outline-none resize-none"
                    placeholder="Rua, número, bairro..."
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="flex-1 py-2 text-xs border border-[color:var(--navy-border)] rounded-lg text-[color:var(--muted-foreground)] hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs bg-[color:var(--gold)] text-[color:var(--navy-deep)] font-bold rounded-lg hover:bg-[color:var(--gold-2)]"
                  >
                    Salvar e Selecionar
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[color:var(--navy-border)] pb-2">
                  <span className="text-sm font-bold text-white">Selecionar Cliente</span>
                  <button onClick={() => setModalOpen(false)} className="text-[color:var(--muted-foreground)] hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[color:var(--muted-foreground)]" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Buscar por nome ou telefone..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="w-full bg-[color:var(--navy-surface)] border border-[color:var(--navy-border)] rounded-lg pl-8 pr-3 py-1.5 text-sm text-white focus:border-[color:var(--gold-dim)] outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNome(busca);
                      setIsRegistering(true);
                    }}
                    className="px-3 bg-[color:var(--gold)] text-[color:var(--navy-deep)] font-semibold text-xs rounded-lg hover:bg-[color:var(--gold-2)] transition flex items-center gap-1 shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" /> Novo
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  {clientesFiltrados.length === 0 ? (
                    <div className="py-6 text-center text-xs text-[color:var(--muted-foreground)]">
                      Nenhum cliente encontrado. <br />
                      <button
                        type="button"
                        onClick={() => {
                          setNome(busca);
                          setIsRegistering(true);
                        }}
                        className="text-[color:var(--gold)] hover:underline mt-1 font-semibold"
                      >
                        Cadastrar "{busca || "Novo Cliente"}"?
                      </button>
                    </div>
                  ) : (
                    clientesFiltrados.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onSelectCliente(c);
                          setModalOpen(false);
                        }}
                        className="w-full text-left p-2 rounded-lg hover:bg-[color:var(--navy-surface)] border border-transparent hover:border-[color:var(--navy-border)] transition flex items-start gap-2.5"
                      >
                        <div className="h-7 w-7 rounded-full bg-[color:var(--gold)]/10 text-[color:var(--gold-2)] border border-[color:var(--gold)]/20 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {c.nome.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-white truncate">{c.nome}</div>
                          <div className="text-[11px] text-[color:var(--muted-foreground)] truncate">
                            {[c.telefone, c.endereco].filter(Boolean).join(" · ")}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
