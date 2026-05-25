import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { UserRole } from "@prisma/client";
import { notifyWelcome } from "./notifications";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      image?: string | null;
    };
  }

  interface User {
    role: UserRole;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const user = await prisma.user.findUnique({
        where: { email: credentials.email as string },
      });

      if (!user || !user.password) return null;

      const valid = await bcrypt.compare(
        credentials.password as string,
        user.password
      );

      if (!valid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "User",
              image: user.image,
              role: "STUDENT",
            },
          });
          notifyWelcome(dbUser.email, dbUser.name, dbUser.phone || undefined).catch(
            console.error
          );
        } else if (user.image && dbUser.image !== user.image) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { image: user.image },
          });
        }

        user.id = dbUser.id;
        (user as { role: UserRole }).role = dbUser.role;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role?: UserRole }).role || "STUDENT";
        token.email = user.email;
      } else if (token.email && !token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});

export { getDashboardPath } from "./utils";

export function isGoogleAuthEnabled() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}
