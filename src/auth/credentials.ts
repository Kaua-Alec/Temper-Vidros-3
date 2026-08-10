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
    email: "kaua@tvsf.com",
    senha: "123",
    nome: "Kauã",
  },
  {
    email: "alessandro@tvsf.com",
    senha: "123",
    nome: "Alessandro",
  },
  {
    email: "cristiane@tvsf.com",
    senha: "301086",
    nome: "Cristiane",
  },
  {
    email: "amanda@tvsf.com",
    senha: "123",
    nome: "Amanda",
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
