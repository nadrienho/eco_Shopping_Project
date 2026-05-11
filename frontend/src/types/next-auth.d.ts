import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id: string;
      username: string;
      role: "customer" | "vendor" | "shop_admin";
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