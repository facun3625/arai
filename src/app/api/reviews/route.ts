import { getReviewEligibility } from "@/lib/reviewEligibility";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");
        const admin = searchParams.get("admin");
        const adminId = searchParams.get("adminId");

        if (admin) {
            if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            const requester = await prisma.user.findUnique({ where: { id: adminId } });
            if (!requester || requester.role !== "ADMIN") {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
            const reviews = await prisma.review.findMany({
                include: { product: { select: { name: true, slug: true } } },
                orderBy: { createdAt: "desc" },
            });
            return NextResponse.json(reviews);
        }

        if (!productId) {
            return NextResponse.json({ error: "productId requerido" }, { status: 400 });
        }

        if (searchParams.get("eligibility") === "1") {
            const session = await getServerSession(authOptions);
            const user = session?.user?.email
                ? await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
                : null;
            const eligibility = user ? await getReviewEligibility(user.id, productId) : { canReview: false, reason: "LOGIN_REQUIRED" };
            return NextResponse.json(eligibility, { headers: { "Cache-Control": "private, no-store" } });
        }

        const reviews = await prisma.review.findMany({
            where: { productId, isApproved: true },
            orderBy: { createdAt: "desc" },
        });
        const average = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        return NextResponse.json({ reviews, average, count: reviews.length });
    } catch (error: any) {
        console.error("GET REVIEWS ERROR:", error);
        return NextResponse.json({ error: "Error al obtener reseñas" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { productId, rating, comment } = body;

        if (typeof productId !== "string" || !productId || typeof comment !== "string" || !comment.trim()) {
            return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
        }
        const ratingNum = Number(rating);
        if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            return NextResponse.json({ error: "La calificación debe ser entre 1 y 5" }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        const userEmail = session?.user?.email;
        if (!userEmail) {
            return NextResponse.json({ error: "Necesitás iniciar sesión para dejar una reseña" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { email: userEmail } });
        if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

        return await prisma.$transaction(async (tx) => {
            const eligibility = await getReviewEligibility(user.id, productId, tx);
            if (!eligibility.canReview) {
                return NextResponse.json({
                    error: eligibility.reason === "ALREADY_REVIEWED"
                        ? "Ya dejaste una reseña para este producto"
                        : "Solo podés reseñar productos que compraste con esta cuenta y cuyo pago fue confirmado",
                }, { status: eligibility.reason === "ALREADY_REVIEWED" ? 409 : 403 });
            }

            const review = await tx.review.create({
                data: {
                    productId,
                    userId: user.id,
                    authorName: `${user.name || ""} ${user.lastName || ""}`.trim() || "Cliente Araí",
                    rating: ratingNum,
                    comment: comment.trim(),
                    isVerified: true,
                    isApproved: false,
                },
            });

            return NextResponse.json({ review, message: "¡Gracias! Tu reseña va a publicarse luego de ser revisada." });
        }, { isolationLevel: "Serializable" });
    } catch (error: any) {
        if (error?.code === "P2034") {
            return NextResponse.json({ error: "La compra o reseña se actualizó. Recargá la página antes de intentarlo nuevamente." }, { status: 409 });
        }
        console.error("POST REVIEW ERROR:", error);
        return NextResponse.json({ error: "Error al crear la reseña" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, adminId, isApproved } = body;

        if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const requester = await prisma.user.findUnique({ where: { id: adminId } });
        if (!requester || requester.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

        const review = await prisma.review.update({
            where: { id },
            data: { isApproved: Boolean(isApproved) },
        });
        return NextResponse.json({ review });
    } catch (error: any) {
        console.error("PATCH REVIEW ERROR:", error);
        return NextResponse.json({ error: "Error al actualizar la reseña" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const adminId = searchParams.get("adminId");

        if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const requester = await prisma.user.findUnique({ where: { id: adminId } });
        if (!requester || requester.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });

        await prisma.review.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE REVIEW ERROR:", error);
        return NextResponse.json({ error: "Error al eliminar la reseña" }, { status: 500 });
    }
}
