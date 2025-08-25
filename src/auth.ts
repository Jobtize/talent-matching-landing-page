import NextAuth from "next-auth";
import LinkedIn from "next-auth/providers/linkedin";
import { cookies } from "next/headers";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || 'your-nextauth-secret-key-here',
  providers: [
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
      redirectUri: process.env.LINKEDIN_REDIRECT_URI,
      authorization: {
        params: { 
          scope: "openid profile email r_1st_connections_size r_basicprofile" 
        },
      },
      userinfo: {
        url: "https://api.linkedin.com/v2/userinfo",
      },
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        console.log("LinkedIn profile data:", JSON.stringify(profile, null, 2));
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          firstName: profile.given_name,
          lastName: profile.family_name,
          headline: profile.headline || '',
          profileUrl: profile.profileUrl || '',
          industry: profile.industry || '',
          location: profile.locale || '',
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
        
        // Buscar informações adicionais do LinkedIn se tivermos um token de acesso
        if (account.access_token) {
          try {
            // Buscar dados do usuário da API do LinkedIn
            const userInfoResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
              headers: {
                Authorization: `Bearer ${account.access_token}`,
              },
            });
            
            if (userInfoResponse.ok) {
              const userInfo = await userInfoResponse.json();
              console.log("LinkedIn userInfo API response:", JSON.stringify(userInfo, null, 2));
              
              // Adicionar dados adicionais ao token
              token.headline = userInfo.headline || '';
              token.industry = userInfo.industry || '';
              token.profileUrl = userInfo.profileUrl || '';
              
              // Buscar conexões usando a API r_1st_connections_size
              try {
                const connectionsResponse = await fetch(
                  'https://api.linkedin.com/v2/connections?q=viewer', {
                    headers: {
                      Authorization: `Bearer ${account.access_token}`,
                    },
                  }
                );
                
                if (connectionsResponse.ok) {
                  const connectionsData = await connectionsResponse.json();
                  console.log("LinkedIn connections API response:", JSON.stringify(connectionsData, null, 2));
                  // A API retorna o número de conexões em um formato diferente dependendo da versão
                  // Tentamos extrair de várias maneiras possíveis
                  token.connections = 
                    connectionsData.connections?.total || 
                    connectionsData.firstDegreeSize || 
                    connectionsData.count || 
                    0;
                } else {
                  console.error("Erro ao buscar conexões do LinkedIn:", await connectionsResponse.text());
                }
              } catch (error) {
                console.error("Erro ao buscar conexões do LinkedIn:", error);
              }
            } else {
              console.error("Erro ao buscar dados do usuário do LinkedIn:", await userInfoResponse.text());
            }
          } catch (error) {
            console.error("Erro ao buscar dados adicionais do LinkedIn:", error);
          }
        }
      }
      
      if (profile) {
        token.firstName = profile.given_name;
        token.lastName = profile.family_name;
        token.headline = profile.headline || token.headline;
        token.industry = profile.industry || token.industry;
        token.profileUrl = profile.profileUrl || token.profileUrl;
      }
      
      console.log("JWT token gerado:", JSON.stringify(token, null, 2));
      return token;
    },
    async session({ session, token }) {
      // Adicionar dados adicionais à sessão
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.accessToken = token.accessToken as string;
        session.user.headline = token.headline as string;
        session.user.industry = token.industry as string;
        session.user.profileUrl = token.profileUrl as string;
        session.user.connections = token.connections as number;
      }
      
      console.log("Sessão gerada:", JSON.stringify(session, null, 2));
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Garantir que o redirecionamento para /profile funcione corretamente
      console.log("Redirecionamento:", { url, baseUrl });
      
      // Verificar se há uma URL de callback armazenada no sessionStorage
      // Isso é feito no cliente, então não podemos acessar aqui diretamente
      
      // Priorizar redirecionamento para /profile
      if (url.includes('/profile') || url.endsWith('/profile')) {
        console.log("Redirecionando para perfil:", `${baseUrl}/profile`);
        return `${baseUrl}/profile`;
      }
      
      // Se a URL for relativa, adicione o baseUrl
      if (url.startsWith('/')) {
        console.log("Redirecionando para URL relativa:", `${baseUrl}${url}`);
        return `${baseUrl}${url}`;
      }
      // Se a URL já for absoluta, retorne-a diretamente
      else if (url.startsWith('http')) {
        console.log("Redirecionando para URL absoluta:", url);
        return url;
      }
      
      // Caso contrário, redirecione para a página de perfil por padrão
      console.log("Redirecionando para perfil (padrão):", `${baseUrl}/profile`);
      return `${baseUrl}/profile`;
    },
  },
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/auth/error",
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log("Evento de signIn:", { user, account, isNewUser });
    },
    async session({ session, token }) {
      console.log("Evento de session:", { session });
    },
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
    callbackUrl: {
      name: "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 10, // 10 minutos
      },
    },
    state: {
      name: "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 15, // 15 minutos
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
