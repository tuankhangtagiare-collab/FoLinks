import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./lib/db";
import * as bcrypt from "bcryptjs";
import { LoginSchema } from "./lib/validation";
import { logLogin } from "./lib/logger";
import { headers } from "next/headers";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  ...authConfig,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        usernameOrEmail: { label: "Username or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        // Fetch request headers for logging
        const reqHeaders = await headers();
        const ip = reqHeaders.get("x-forwarded-for")?.split(",")[0] || reqHeaders.get("x-real-ip") || "127.0.0.1";
        const userAgent = reqHeaders.get("user-agent") || "";
        const country = reqHeaders.get("x-vercel-ip-country") || "Unknown";
        const city = reqHeaders.get("x-vercel-ip-city") || "Unknown";

        if (!validatedFields.success) {
          await logLogin({
            ip,
            userAgent,
            success: false,
            reason: "Invalid input fields",
            country,
            city,
          });
          return null;
        }

        const { usernameOrEmail, password } = validatedFields.data;

        // Query user by email or username
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: usernameOrEmail },
              { username: usernameOrEmail },
            ],
          },
          include: {
            wallet: true,
          },
        });

        if (!user || !user.passwordHash) {
          await logLogin({
            email: usernameOrEmail,
            ip,
            userAgent,
            success: false,
            reason: "User not found",
            country,
            city,
          });
          return null;
        }

        if (user.status === "BANNED") {
          await logLogin({
            userId: user.id,
            email: user.email,
            ip,
            userAgent,
            success: false,
            reason: "User account is banned",
            country,
            city,
          });
          throw new Error("Tài khoản của bạn đã bị khóa.");
        }

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatch) {
          await logLogin({
            userId: user.id,
            email: user.email,
            ip,
            userAgent,
            success: false,
            reason: "Invalid credentials / password mismatch",
            country,
            city,
          });
          return null;
        }

        // Update Last Login and user status/info
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLogin: new Date(),
            country: country !== "Unknown" ? country : user.country,
          },
        });

        // Log successful login
        await logLogin({
          userId: user.id,
          email: user.email,
          ip,
          userAgent,
          success: true,
          country,
          city,
        });

        return {
          id: user.id,
          name: user.displayName || user.username,
          email: user.email,
          username: user.username,
          role: user.role,
          avatar: user.avatar,
          walletBalance: user.wallet?.balance?.toString() || "0",
          emailVerified: user.emailVerified ? true : false,
        } as any;
      },
    }),
  ],
});
