import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (!user.email) return false;

            try {
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email }
                });

                if (!existingUser) {
                    // Si el usuario no existe, lo creamos
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
});

export { handler as GET, handler as POST };
