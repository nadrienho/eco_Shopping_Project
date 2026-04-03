import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Missing credentials");
        }

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

          if (!tokenRes.ok) {
            throw new Error("Invalid credentials");
          }

          const tokenData = await tokenRes.json();

          const userRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/user/me/`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokenData.access}`,
              },
            }
          );

          if (!userRes.ok) {
            throw new Error("Could not fetch user data");
          }

          const userData = await userRes.json();

          return {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            role: userData.profile?.role || "customer",
            access_token: tokenData.access,
            refresh_token: tokenData.refresh,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
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
        session.user.access_token = token.access_token as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login?error=CredentialsSignin",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};