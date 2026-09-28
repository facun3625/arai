import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    session: { strategy: "jwt" },
    providers: [
        CredentialsProvider({
            name: "Email y contraseña",
            credentials: { email: { type: "text" }, password: { type: "password" } },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) return null;
                const user = await prisma.user.findUnique({ where: { email: credentials.email } });
                if (!user?.password || !await bcrypt.compare(credentials.password, user.password)) return null;
                return { id: user.id, email: user.email, name: user.name };
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) token.provider = account.provider;
            return token;
        },
        async signIn({ user, account, profile }) {
            if (!user.email) return false;

            try {
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email }
                });

                if (!existingUser) {
                    await prisma.user.create({
                        data: {
                            email: user.email,
                            name: user.name || "Usuario de Google",
                            role: "USER"
                        } as any
                    });
                }
                return true;
            } catch (error) {
                console.error("Error in NextAuth signIn callback:", error);
                return false;
            }
        },
        async session({ session, token }) {
            (session as typeof session & { provider?: string }).provider = token.provider as string;
            if (session.user?.email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: session.user.email }
                });
                if (dbUser) {
                    (session.user as any).id = dbUser.id;
                    (session.user as any).role = dbUser.role;
                }
            }
            return session;
        }
    },
    pages: {
        signIn: '/',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
