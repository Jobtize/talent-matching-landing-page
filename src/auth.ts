import NextAuth from "next-auth";
import LinkedIn from "next-auth/providers/linkedin";
import { cookies } from "next/headers";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      authorization: {
        params: { scope: "openid profile email" },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          firstName: profile.given_name,
          lastName: profile.family_name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Adicionar dados adicionais ao token JWT
      if (account) {
        token.accessToken = account.access_token;
        token.expiresAt = account.expires_at;
      }
      
      if (profile) {
        token.firstName = profile.given_name;
        token.lastName = profile.family_name;
      }
      
      return token;
    },
    async session({ session, token }) {
      // Adicionar dados adicionais à sessão
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.accessToken = token.accessToken as string;
      }
      
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  debug: process.env.NODE_ENV === "development",
});

// Função auxiliar para verificar autenticação
export async function getAuthSession() {
  return await auth();
}

// Função para verificar se o usuário está autenticado
export async function isAuthenticated() {
  const session = await getAuthSession();
  return !!session?.user;
}

// Função para obter o usuário atual
export async function getCurrentUser() {
  const session = await getAuthSession();
  return session?.user;
}

