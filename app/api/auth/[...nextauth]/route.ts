// app/api/auth/[...nextauth]/route.ts
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        // ✅ Convertir a any para acceder a campos que pueden no existir en el tipo
        const userAny = user as any;

        // ✅ Verificar si el usuario está bloqueado
        if (userAny.status === "blocked") {
          throw new Error("Tu cuenta ha sido bloqueada. Contacta al administrador.");
        }

        // ✅ Devolver todos los campos necesarios
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || "user",
          photo: user.photo || null,
          status: userAny.status || "active",
          lastPaymentDate: userAny.lastPaymentDate || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.photo = user.photo || null;
        token.status = user.status || "active";
        token.lastPaymentDate = user.lastPaymentDate || null;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.photo = token.photo as string | null;
        session.user.status = token.status as string;
        session.user.lastPaymentDate = token.lastPaymentDate as Date | null;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };