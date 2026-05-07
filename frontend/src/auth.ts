import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Keep your interfaces for type safety
export type Role = "customer" | "vendor" | "shop_admin";

interface DjangoUser {
  id: number;
  username: string;
  email: string;
  profile: {
    role: Role;
    shop_name: string | null;
    bio: string | null;
  };
}

// v5 Export Pattern
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          const tokenRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/token/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: credentials.username,
                password: credentials.password,
              }),
            }
          );

          if (!tokenRes.ok) return null;
          const { access, refresh } = await tokenRes.json();

          const profileRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/user/me/`,
            {
              headers: { Authorization: `Bearer ${access}` },
            }
          );

          if (!profileRes.ok) return null;
          const djangoUser: DjangoUser = await profileRes.json();

          return {
            id: String(djangoUser.id),
            username: djangoUser.username, 
            email: djangoUser.email,
            role: djangoUser.profile.role,
            shop_name: djangoUser.profile.shop_name,
            access_token: access,          
            refresh_token: refresh,
          };
        } catch (err) {
          console.error("Auth error:", err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.id = u.id;
        token.username = u.username;
        token.role = u.role;
        token.accessToken = u.access_token; // Map snake_case from user to camelCase for token
      }
      return token;
    },
    async session({ session, token }) {
    if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as Role;
        session.user.access_token = token.accessToken as string;
        
        // Check your terminal logs to see if this prints a real string
        console.log("Session Callback Token:", token.accessToken ? "EXISTS" : "MISSING");
    }
    return session;
},
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});