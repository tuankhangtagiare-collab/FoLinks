import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.avatar = (user as any).avatar;
        token.walletBalance = (user as any).walletBalance;
        token.emailVerified = (user as any).emailVerified;
      }
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
        (session.user as any).avatar = token.avatar;
        (session.user as any).walletBalance = token.walletBalance;
        (session.user as any).emailVerified = token.emailVerified;
      }
      return session;
    },
  },
  providers: [], // Sẽ được cấu hình chi tiết tại auth.ts
} satisfies NextAuthConfig;
