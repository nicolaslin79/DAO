import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";

const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          locale: user.locale || "zh",
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { subscription: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.locale = dbUser.locale;
          if (dbUser.subscription) {
            token.subscription = {
              plan: dbUser.subscription.plan,
              status: dbUser.subscription.status,
              endDate: dbUser.subscription.endDate,
              readingsLeft: dbUser.subscription.readingsLeft,
            };
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "ADMIN";
        session.user.locale = token.locale as string;
        session.user.subscription = token.subscription as {
          plan: string;
          status: string;
          endDate: Date;
          readingsLeft: number | null;
        } | null;
      }
      return session;
    },
    async signIn({ user }) {
      if (user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          const isAdmin = adminEmails.includes(user.email.toLowerCase());
          if (isAdmin && existingUser.role !== "ADMIN") {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { role: "ADMIN" },
            });
          }
        }
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.email && adminEmails.includes(user.email.toLowerCase())) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "ADMIN" },
        });
      }
    },
  },
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: "USER" | "ADMIN";
      locale: string;
      subscription?: {
        plan: string;
        status: string;
        endDate: Date;
        readingsLeft: number | null;
      } | null;
    };
  }

  interface User {
    role: "USER" | "ADMIN";
    locale: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "ADMIN";
    locale: string;
    subscription?: {
      plan: string;
      status: string;
      endDate: Date;
      readingsLeft: number | null;
    } | null;
  }
}
