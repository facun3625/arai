"use client";

import { motion } from "framer-motion";
import { Leaf, Info } from "lucide-react";
import Image from "next/image";

const steps = [
    {
        number: "01",
        title: "SEMILLA Y PLANTÍN",
        description: "Todo comienza en el vivero donde se producen los plantines de Yerba Mate. Allí permanecen un año antes de ser pasados a la tierra de monte o de campo, dependiendo del tipo de yerba que se quiere producir (Monte: zona norte y centro de Misiones; Campo: zona sur de Misiones y norte de Corrientes).",
    },
    {
        number: "02",
        title: "YERBATAL",
        description: "Los plantines se trasplantan a tierra rica en hierro y nutrientes, como lo es la tierra colorada. En su estado silvestre las plantas pueden medir hasta 15 o 20 metros, pero en Argentina se podan a los 3 o 4 metros dependiendo de la zona.",
    },
    {
        number: "03",
        title: "COSECHA",
        description: "Se realiza manualmente a los 4 años de ser traspasada a tierra, entre los meses de abril a septiembre inclusive, cuando las hojas están maduras y la planta está en receso vegetativo.",
    },
    {
        number: "04",
        title: "TRASLADO",
        description: "Los tareferos arman \"ponchadas\" de 50 kg que se cierran para formar los \"raídos\" y cargarlos al camión (o en camiones tipo jaula) para su traslado al secadero.",
    },
    {
        number: "05",
        title: "PLANCHADA",
        description: "Las ramas se esparcen y ventilan bajo techo, aisladas de la tierra. Este paso debe ser rápido para evitar que las hojas se marchiten y generen puntos negros que amargan la yerba.",
    },
    {
        number: "06",
        title: "SAPECADO",
        description: "Las ramas pasan por una tambora circular expuesta a fuego directo por unos segundos. Esto reduce la humedad en un 90%, detiene la oxidación y reduce el peso (3 kg de hoja verde rinden 1 kg de yerba canchada).",
    },
    {
        number: "07",
        title: "SECANZA",
        description: "Las hojas pasan por una corriente de aire a temperatura moderada durante aproximadamente 8 horas para alcanzar el contenido de humedad adecuado sin perder sus propiedades.",
    },
    {
        number: "08",
        title: "CANCHADO",
        description: "Se realiza una \"primera molienda\" en una tolva. La yerba se coloca en bolsas de 40 kg o big bags de 350 kg, rotuladas con fecha y procedencia (Campo o Monte).",
    },
    {
        number: "09",
        title: "ESTACIONAMIENTO NATURAL",
        description: "Las bolsas se almacenan en galpones controlados durante 24 a 30 meses. Este paso es primordial para obtener una yerba de excelente calidad que no produzca acidez.",
    },
    {
        number: "10",
        title: "MOLIENDA O ELABORACIÓN",
        description: "La yerba estacionada se clasifica (palo, polvo y hojas) para crear diferentes blends (suave, tradicional, especial, etc.).",
    },
    {
        number: "11",
        title: "CONTROL DE CALIDAD",
        description: "Se realiza un seguimiento visual, catado y mediciones fisicoquímicas para asegurar el color, sabor y aroma óptimos.",
    },
    {
        number: "12",
        title: "ENVASADO",
        description: "La yerba cae en envases laminados o rústicos. Cada paquete recibe su estampilla, fecha de lote y vencimiento.",
    },
    {
        number: "13",
        title: "COMERCIALIZACIÓN",
        description: "Distribución a supermercados, tiendas exclusivas y otros puntos de venta para que los consumidores disfruten sus mates sin acidez.",
    },
];

export default function ProcesoPage() {
    return (
        <div className="bg-white min-h-screen pt-12 font-montserrat overflow-hidden">
            {/* Hero Section */}
            <header className="max-w-6xl mx-auto px-4 md:px-8 mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                        className="pt-8"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold tracking-[0.2em] mb-6 uppercase">
                            <Leaf className="h-3 w-3" />
                            <span>Tradición y Calidad</span>
                        </div>
                        <h1 className="text-[40px] md:text-[64px] font-light text-gray-900 tracking-tight leading-[1.1] mb-8">
                            El viaje de la <br />
                            <span className="font-semibold text-primary">Yerba Mate</span>
                        </h1>
                        <p className="text-[16px] md:text-[18px] text-gray-500 leading-relaxed font-light max-w-lg">
                            Desde el corazón de la tierra colorada hasta tu mate. Descubrí el proceso artesanal que garantiza un sabor único y sin acidez.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="relative h-[400px] md:h-[600px] rounded-[40px] overflow-hidden shadow-2xl"
                    >
                        <Image
                            src="/images/proceso/sol.jpg"
                            alt="Yerba Mate Araí"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </motion.div>
                </div>
            </header>

            {/* Steps Timeline / Grid */}
            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-24">
                {steps.map((step, index) => (
                    <motion.section
                        key={step.number}
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        className="relative"
                    >
                        <div className={`flex flex-col lg:flex-row gap-16 lg:items-center ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                            }`}>

                            {/* Visual Side (Numbers Only as requested) */}
                            <div className="flex-1 flex justify-center relative">
                                <span className="text-[150px] md:text-[250px] font-black text-primary/15 leading-none select-none">
                                    {step.number}
                                </span>

                                {/* Floating Accent */}
                                <div className={`absolute -bottom-6 ${index % 2 === 0 ? "-right-6" : "-left-6"} w-32 h-32 bg-primary/5 rounded-full blur-3xl`} />
                            </div>

                            {/* Content Side */}
                            <div className="flex-1">
                                <div className="max-w-md mx-auto lg:mx-0">
                                    <div className="flex items-center gap-4 mb-6 justify-center lg:justify-start">
                                        <div className="h-px w-8 bg-primary/30" />
                                        <h2 className="text-[12px] font-bold tracking-[0.3em] text-primary/60 uppercase">
                                            Paso {step.number}
                                        </h2>
                                    </div>
                                    <h3 className="text-[32px] md:text-[42px] font-medium text-gray-900 mb-8 leading-tight text-center lg:text-left">
                                        {step.title}
                                    </h3>
                                    <p className="text-[16px] md:text-[17px] text-gray-500 leading-relaxed font-light text-center lg:text-left">
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                ))}
            </main>

            {/* Parallax Section - Refined with Integrated Tips */}
            <section className="relative w-full h-[700px] md:h-[900px] mt-48 overflow-hidden group">
                <motion.div
                    initial={{ scale: 1.1 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 10, ease: "linear" }}
                    className="absolute inset-0 z-0"
                >
                    <Image
                        src="/images/proceso/campo2.png"
                        alt="Nuestro Campo"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/40 transition-opacity duration-700 group-hover:opacity-30" />
                </motion.div>

                <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <span className="text-[10px] font-bold tracking-[0.6em] text-white/70 uppercase mb-12 block">#AraíTips</span>

                        <h2 className="text-[32px] md:text-[52px] font-light text-white tracking-tight leading-tight mb-12">
                            La <span className="font-semibold text-primary">temperatura</span> ideal para <br className="hidden md:block" /> despertar el alma de la hoja.
                        </h2>

                        <p className="text-[16px] md:text-[18px] text-white/80 font-light leading-relaxed mb-12 max-w-2xl mx-auto">
                            Entre 70 y 80°C. Ni más, ni menos. El secreto de un mate que perdura y no amarga, nacido en los suelos rojos de Misiones.
                        </p>

                        <div className="h-px w-12 bg-primary/50 mx-auto" />
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
