import { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // Since we're using custom authentication, 
      // let the client-side handle all authentication logic
      return true;
    },
  },
  providers: [], // Empty array since we're using custom auth
};