import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Django Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // ... Keep all your existing fetch logic to Django here ...
        // (The try/catch block you already wrote)
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login?error=true",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.access_token = user.access_token;
        // ... add the rest of your fields ...
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.access_token = token.access_token as string;
        // ... add the rest of your fields ...
      }
      return session;
    },
  },
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
};