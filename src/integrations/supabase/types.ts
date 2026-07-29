export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          cliente_nome: string | null
          created_at: string
          criado_por: string | null
          data: string
          endereco: string | null
          hora: string | null
          id: string
          observacoes: string | null
          pedido_id: string | null
          responsavel: string | null
          status: string
          tipo: string
          titulo: string
        }
        Insert: {
          cliente_nome?: string | null
          created_at?: string
          criado_por?: string | null
          data: string
          endereco?: string | null
          hora?: string | null
          id?: string
          observacoes?: string | null
          pedido_id?: string | null
          responsavel?: string | null
          status?: string
          tipo?: string
          titulo: string
        }
        Update: {
          cliente_nome?: string | null
          created_at?: string
          criado_por?: string | null
          data?: string
          endereco?: string | null
          hora?: string | null
          id?: string
          observacoes?: string | null
          pedido_id?: string | null
          responsavel?: string | null
          status?: string
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogo_produtos: {
        Row: {
          ativo: boolean
          altura_mm: number | null
          categoria: string
          cor: string | null
          created_at: string
          descricao: string | null
          espessura: string | null
          id: string
          largura_mm: number | null
          margem_lucro: number | null
          nome: string
          num_folhas: number | null
          preco_m2: number | null
          preco_unitario: number | null
          unidade: string
        }
        Insert: {
          ativo?: boolean
          altura_mm?: number | null
          categoria: string
          cor?: string | null
          created_at?: string
          descricao?: string | null
          espessura?: string | null
          id?: string
          largura_mm?: number | null
          margem_lucro?: number | null
          nome: string
          num_folhas?: number | null
          preco_m2?: number | null
          preco_unitario?: number | null
          unidade?: string
        }
        Update: {
          ativo?: boolean
          altura_mm?: number | null
          categoria?: string
          cor?: string | null
          created_at?: string
          descricao?: string | null
          espessura?: string | null
          id?: string
          largura_mm?: number | null
          margem_lucro?: number | null
          nome?: string
          num_folhas?: number | null
          preco_m2?: number | null
          preco_unitario?: number | null
          unidade?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          cidade: string | null
          created_at: string
          criado_por: string | null
          documento: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cidade?: string | null
          created_at?: string
          criado_por?: string | null
          documento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cidade?: string | null
          created_at?: string
          criado_por?: string | null
          documento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      estoque: {
        Row: {
          categoria: string | null
          created_at: string
          fornecedor: string | null
          id: string
          material: string
          minimo: number
          observacoes: string | null
          preco_unitario: number | null
          quantidade: number
          unidade: string
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          fornecedor?: string | null
          id?: string
          material: string
          minimo?: number
          observacoes?: string | null
          preco_unitario?: number | null
          quantidade?: number
          unidade?: string
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          created_at?: string
          fornecedor?: string | null
          id?: string
          material?: string
          minimo?: number
          observacoes?: string | null
          preco_unitario?: number | null
          quantidade?: number
          unidade?: string
          updated_at?: string
        }
        Relationships: []
      }
      financeiro: {
        Row: {
          cliente_nome: string | null
          created_at: string
          criado_por: string | null
          descricao: string
          id: string
          metodo: string | null
          orcamento_id: string | null
          pago_em: string | null
          status: string
          tipo: string
          valor: number
          valor_pago: number | null
          vencimento: string | null
        }
        Insert: {
          cliente_nome?: string | null
          created_at?: string
          criado_por?: string | null
          descricao: string
          id?: string
          metodo?: string | null
          orcamento_id?: string | null
          pago_em?: string | null
          status?: string
          tipo?: string
          valor: number
          valor_pago?: number | null
          vencimento?: string | null
        }
        Update: {
          cliente_nome?: string | null
          created_at?: string
          criado_por?: string | null
          descricao?: string
          id?: string
          metodo?: string | null
          orcamento_id?: string | null
          pago_em?: string | null
          status?: string
          tipo?: string
          valor?: number
          valor_pago?: number | null
          vencimento?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens: {
        Row: {
          autor: string
          contexto: string | null
          created_at: string
          id: string
          texto: string
        }
        Insert: {
          autor: string
          contexto?: string | null
          created_at?: string
          id?: string
          texto: string
        }
        Update: {
          autor?: string
          contexto?: string | null
          created_at?: string
          id?: string
          texto?: string
        }
        Relationships: []
      }
      orcamento_itens: {
        Row: {
          altura_mm: number | null
          cor: string | null
          created_at: string
          descricao: string | null
          espessura: string | null
          id: string
          largura_mm: number | null
          nome: string
          orcamento_id: string
          produto_id: string | null
          quantidade: number
          subtotal: number
          valor_unitario: number
        }
        Insert: {
          altura_mm?: number | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          espessura?: string | null
          id?: string
          largura_mm?: number | null
          nome: string
          orcamento_id: string
          produto_id?: string | null
          quantidade?: number
          subtotal?: number
          valor_unitario?: number
        }
        Update: {
          altura_mm?: number | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          espessura?: string | null
          id?: string
          largura_mm?: number | null
          nome?: string
          orcamento_id?: string
          produto_id?: string | null
          quantidade?: number
          subtotal?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_itens_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "catalogo_produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          cliente_id: string | null
          cliente_nome: string | null
          created_at: string
          criado_por: string | null
          desconto: number | null
          forma_pagamento: string | null
          id: string
          numero: string
          observacoes: string | null
          status: string
          total: number
          updated_at: string
          validade: string | null
        }
        Insert: {
          cliente_id?: string | null
          cliente_nome?: string | null
          created_at?: string
          criado_por?: string | null
          desconto?: number | null
          forma_pagamento?: string | null
          id?: string
          numero: string
          observacoes?: string | null
          status?: string
          total?: number
          updated_at?: string
          validade?: string | null
        }
        Update: {
          cliente_id?: string | null
          cliente_nome?: string | null
          created_at?: string
          criado_por?: string | null
          desconto?: number | null
          forma_pagamento?: string | null
          id?: string
          numero?: string
          observacoes?: string | null
          status?: string
          total?: number
          updated_at?: string
          validade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          cliente_nome: string | null
          created_at: string
          criado_por: string | null
          data_prevista: string | null
          id: string
          numero: string
          observacoes: string | null
          orcamento_id: string | null
          responsavel: string | null
          status: string
          updated_at: string
        }
        Insert: {
          cliente_nome?: string | null
          created_at?: string
          criado_por?: string | null
          data_prevista?: string | null
          id?: string
          numero: string
          observacoes?: string | null
          orcamento_id?: string | null
          responsavel?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          cliente_nome?: string | null
          created_at?: string
          criado_por?: string | null
          data_prevista?: string | null
          id?: string
          numero?: string
          observacoes?: string | null
          orcamento_id?: string | null
          responsavel?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
