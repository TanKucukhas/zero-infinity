import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import { BOOTSTRAP_ADMIN_EMAILS } from "./bootstrap";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const email = (user as any).email?.toLowerCase?.() || "";
        if (BOOTSTRAP_ADMIN_EMAILS.includes(email)) {
          (token as any).role = "admin";
        } else {
          (token as any).role = (user as any).role || (token as any).role || "viewer";
        }
      }
      return token as any;
    },
    async session({ session, token }) {
      (session.user as any).role = (token as any).role || "viewer";
      return session;
    }
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login'
  }
};


