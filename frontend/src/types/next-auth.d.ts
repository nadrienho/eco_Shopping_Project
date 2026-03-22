import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    username: string;
    email: string;
    role: "customer" | "vendor" | "admin";
    shop_name?: string;
    access_token: string;
    refresh_token: string;
  }

//   interface Session extends DefaultSession {
//     user: {
//       id: string;
//       username: string;
//       email: string;
//       role: "customer" | "vendor" | "admin";
//       shop_name?: string;
//       access_token: string;
//       refresh_token: string;
//     } & DefaultSession["user"];
//   }
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
      shop_name?: string;
      access_token: string;
    };
  }
}  
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    username: string;
    email: string;
    role: "customer" | "vendor" | "admin";
    shop_name?: string;
    access_token: string;
    refresh_token: string;
  }
}
