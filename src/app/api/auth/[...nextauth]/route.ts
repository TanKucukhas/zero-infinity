export const runtime = "edge";
import NextAuth from "next-auth";
import { authConfig } from "../../../../server/auth/nextauth";

const auth = NextAuth(authConfig);

export const GET = auth.handlers.GET;
export const POST = auth.handlers.POST;


