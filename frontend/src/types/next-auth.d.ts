import type NextAuth, { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: "customer" | "vendor" | "shop_admin";
      access_token: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    role: "customer" | "vendor" | "shop_admin";
    access_token: string;
    refresh_token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: "customer" | "vendor" | "shop_admin";
    access_token: string;
    refresh_token: string;
  }
}