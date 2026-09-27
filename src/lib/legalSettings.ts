import { prisma } from "@/lib/prisma";

export async function getLegalSettings() {
    const settings = await prisma.storeSettings.findUnique({ where: { id: "global" } });
    return {
        businessName: settings?.legalBusinessName || null,
        cuit: settings?.legalCuit || null,
        address: settings?.legalAddress || null,
        email: settings?.footerEmail || null,
        whatsappNumber: settings?.whatsappNumber || null,
    };
}

export function legalField(value: string | null, label: string) {
    return value || `[Completar ${label} desde el panel]`;
}
