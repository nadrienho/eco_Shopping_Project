import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Django Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          // 1. Get JWT tokens from Django
          const tokenRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/token/`,
            {
              method: "POST",
              body: JSON.stringify({
                username: credentials.username,
                password: credentials.password,
              }),
              headers: { "Content-Type": "application/json" },
            }
          );

          if (!tokenRes.ok) {
            return null;
          }

          const tokenData = await tokenRes.json();

          // 2. Get user profile with role information
          const userRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/user/me/`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${tokenData.access}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!userRes.ok) {
            return null;
          }

          const userData = await userRes.json();

          // 3. Return user object with tokens and role
          return {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            role: userData.profile?.role || "customer",
            shop_name: userData.profile?.shop_name,
            access_token: tokenData.access,
            refresh_token: tokenData.refresh,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login?error=true",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
        token.role = user.role;
        token.shop_name = user.shop_name;
        token.access_token = user.access_token;
        token.refresh_token = user.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.shop_name = token.shop_name as string;
        session.user.access_token = token.access_token as string;
        session.user.refresh_token = token.refresh_token as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

