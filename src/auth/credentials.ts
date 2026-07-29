export type AuthUser = {
  email: string;
  senha: string;
  nome: string;
};

/**
 * Credenciais de autenticação pré-definidas diretamente no código.
 * Você pode adicionar ou alterar os e-mails e senhas nesta lista.
 */
export const AUTH_CREDENTIALS: AuthUser[] = [
  {
    email: "admin@tempervidros.com",
    senha: "123",
    nome: "Administrador",
  },
  {
    email: "vendas@tempervidros.com",
    senha: "123",
    nome: "Vendas",
  },
  {
    email: "atendimento@tempervidros.com",
    senha: "123",
    nome: "Atendimento",
  },
];

/**
 * Função utilitária para validar e-mail e senha.
 */
export function validarAutenticacao(email: string, senha: string): AuthUser | null {
  const emailClean = email.trim().toLowerCase();
  const found = AUTH_CREDENTIALS.find(
    (u) => u.email.toLowerCase() === emailClean && u.senha === senha.trim()
  );
  return found || null;
}
