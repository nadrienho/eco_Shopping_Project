import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      role: "customer" | "vendor" | "admin" | string;
      shop_name?: string;
      access_token: string;
      refresh_token?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    username: string;
    email: string;
    role: "customer" | "vendor" | "admin" | string;
    shop_name?: string;
    access_token: string;
    refresh_token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    username: string;
    email: string;
    role: "customer" | "vendor" | "admin" | string;
    shop_name?: string;
    access_token: string;
    refresh_token: string;
  }
}