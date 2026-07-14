// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      photo: string | null;
      status: string;
      lastPaymentDate: Date | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    photo: string | null;
    status: string;
    lastPaymentDate: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: string;
    photo: string | null;
    status: string;
    lastPaymentDate: Date | null;
  }
}