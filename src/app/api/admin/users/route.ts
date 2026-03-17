import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const adminId = searchParams.get("adminId");

        if (!adminId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const admin = await prisma.user.findUnique({
            where: { id: adminId }
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                lastName: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { orders: true }
                }
            }
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("DEBUG: Failed to fetch users", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const adminId = searchParams.get("adminId");
        const targetId = searchParams.get("targetId");

        if (!adminId || !targetId) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const admin = await prisma.user.findUnique({
            where: { id: adminId }
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Prevent self-deletion via this endpoint if needed, or allow it
        // if (adminId === targetId) { ... }

        await prisma.user.delete({
            where: { id: targetId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DEBUG: Failed to delete user", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
export async function PATCH(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const adminId = searchParams.get("adminId");
        const targetId = searchParams.get("targetId");

        if (!adminId || !targetId) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const { password, role } = await req.json();

        const admin = await prisma.user.findUnique({
            where: { id: adminId }
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updateData: any = {};

        if (password) {
            if (password.length < 6) {
                return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
            }
            const bcrypt = await import('bcryptjs');
            updateData.password = await bcrypt.hash(password, 10);
        }

        if (role) {
            const validRoles = ['USER', 'ADMIN', 'TEST'];
            if (!validRoles.includes(role)) {
                return NextResponse.json({ error: "Invalid role" }, { status: 400 });
            }
            updateData.role = role;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: targetId },
            data: updateData
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DEBUG: Failed to update user password", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
