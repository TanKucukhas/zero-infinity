import { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnContacts = nextUrl.pathname.startsWith("/contacts");
      const isOnCompanies = nextUrl.pathname.startsWith("/companies");
      const isOnUsers = nextUrl.pathname.startsWith("/users");
      const isOnSettings = nextUrl.pathname.startsWith("/settings");
      const isOnAccountSettings = nextUrl.pathname.startsWith("/account-settings");
      
      const isProtectedRoute = isOnDashboard || isOnContacts || isOnCompanies || isOnUsers || isOnSettings || isOnAccountSettings;
      
      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && (nextUrl.pathname === "/" || nextUrl.pathname === "/login")) {
        return Response.redirect(new URL("/contacts", nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
};