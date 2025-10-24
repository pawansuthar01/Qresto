import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { UserRole } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 1 day
  },

  pages: {
    signIn: "/signin",
    signOut: "/signin",
    error: "/signin",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { restaurant: true },
        });

        if (!user || !user.password) throw new Error("Invalid credentials");

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordValid) throw new Error("Invalid credentials");

        // ✅ Create manual DB session
        const sessionToken = randomUUID();
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        await prisma.session.create({
          data: {
            id: randomUUID(),
            sessionToken,
            userId: user.id,
            expires,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          status: user.status,
          reason: user.reason,
          blockedAt: user.blockedAt,
          suspendedAt: user.suspendedAt,
          restaurantId: user.restaurantId,
          restaurantStatus: user.restaurant?.status || null,
          sessionToken, // important for JWT
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        let existing = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { restaurant: true },
        });

        if (!existing) {
          existing = await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name || "Google User",
              image: user.image,
              role: "OWNER",
              status: "active",
            },
            include: { restaurant: true },
          });
        }

        // ✅ Create manual DB session for Google login
        const sessionToken = randomUUID();
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

        await prisma.session.create({
          data: {
            id: randomUUID(),
            sessionToken,
            userId: existing.id,
            expires,
          },
        });

        Object.assign(user, {
          id: existing.id,
          role: existing.role,
          status: existing.status,
          reason: existing.reason,
          blockedAt: existing.blockedAt,
          suspendedAt: existing.suspendedAt,
          restaurantId: existing.restaurantId,
          restaurantStatus: existing.restaurant?.status || null,
          sessionToken, // attach for JWT
        });
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.reason = user.reason;
        token.blockedAt = user.blockedAt;
        token.suspendedAt = user.suspendedAt;
        token.restaurantId = user.restaurantId;
        token.restaurantStatus = user.restaurantStatus;
        token.sessionToken = (user as any).sessionToken; // attach DB session token
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.reason = token.reason;
        session.user.blockedAt = token.blockedAt;
        session.user.suspendedAt = token.suspendedAt;
        session.user.restaurantId = token.restaurantId;
        session.user.restaurantStatus = token.restaurantStatus;
        (session as any).sessionToken = token.sessionToken;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// --- YEH DECLARATIONS BILKUL SAHI HAIN ---

declare module "next-auth" {
  interface Session {
    sessionToken: string;

    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      status: string;
      reason?: string | null;
      blockedAt?: Date | null;
      suspendedAt?: Date | null;
      restaurantId?: string | null;
      restaurantStatus?: string | null;
    };
  }

  export interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: UserRole;
    status: string;
    reason?: string | null;
    blockedAt?: Date | null;
    suspendedAt?: Date | null;
    restaurantId?: string | null;
    restaurantStatus?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
    status: string;
    reason?: string | null;
    blockedAt?: Date | null;
    suspendedAt?: Date | null;
    restaurantId?: string | null;
    restaurantStatus?: string | null;
    sessionToken: string;
  }
}
