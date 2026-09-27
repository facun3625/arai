import type { Metadata } from "next";
import TiendaClient from "./TiendaClient";

export const metadata: Metadata = {
    title: "Tienda - Araí Yerba Mate",
    description: "Comprá yerba mate, café y hierbas de autor. Envío a todo el país.",
    alternates: { canonical: "/tienda" },
};

export default function TiendaPage() {
    return <TiendaClient />;
}
