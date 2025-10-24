// frontend/lib/auth.ts (CORRIGIDO)

// A interface 'User' continua a mesma
export interface User {
  name: string;
  email: string;
  role: "analista" | "gerente" | "admin";
  // Você pode adicionar mais campos que vêm do backend, como 'manager_name'
  manager_name?: string; 
  team?: string[];
}

// Chave do localStorage (continua a mesma)
const USER_STORAGE_KEY = "metrocasa_user";

/**
 * Tenta fazer o login chamando o backend.
 * @param email 
 * @param password 
 * @returns O objeto User se for bem-sucedido, ou null.
 */
export async function loginUser(email: string, password: string): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include' // <-- ESSENCIAL para enviar/receber cookies
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.success && data.user) {
      // Salva o usuário (que veio do backend) no localStorage
      setCurrentUser(data.user);
      return data.user as User;
    }
    return null;
    
  } catch (error) {
    console.error("Erro ao tentar fazer login:", error);
    return null;
  }
}

/**
 * Faz o logout chamando o backend.
 */
export async function logoutUser() {
  try {
    // Chama o backend para limpar a sessão (cookie)
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include' // <-- ESSENCIAL para enviar o cookie da sessão
    });
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  } finally {
    // Limpa o localStorage de qualquer jeito
    setCurrentUser(null);
  }
}

/**
 * Verifica com o backend se o usuário tem uma sessão (cookie) válida.
 * Esta é a função que corrige o erro 401 em '/api/auth/me'.
 * @returns O objeto User se a sessão for válida, ou null.
 */
export async function checkUserSession(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include' // <-- ESSENCIAL para enviar o cookie da sessão
    });

    if (!response.ok) {
      setCurrentUser(null); // Limpa o localStorage se a sessão for inválida
      return null;
    }

    const data = await response.json();
    
    if (data.isLoggedIn && data.user) {
      setCurrentUser(data.user); // Sincroniza o localStorage
      return data.user as User;
    }
    
    setCurrentUser(null);
    return null;

  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
    setCurrentUser(null);
    return null;
  }
}


// --- FUNÇÕES DE LOCALSTORAGE (Não precisam de mudança) ---

/**
 * Salva os dados do usuário no localStorage.
 * @param user - O objeto do usuário a ser salvo.
 */
export function setCurrentUser(user: User | null) {
  if (typeof window === "undefined") {
    return;
  }
  if (user) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_STORAGE_KEY);
  }
}

/**
 * Recupera os dados do usuário do localStorage.
 * @returns O objeto do usuário ou null se não houver ninguém logado.
 */
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }
  const userStr = localStorage.getItem(USER_STORAGE_KEY);
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}