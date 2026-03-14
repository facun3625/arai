"use client";

import { motion } from "framer-motion";
import { Play, Youtube, ExternalLink, Calendar } from "lucide-react";
import Image from "next/image";

const videos = [
    { title: "Yerba Mate Argentina para el Mundo", embedId: "KGZaEP_aDwE", category: "Institucional" },
    { title: "INYM EL MATE HACE BIEN", embedId: "wmWDHTBRix0", category: "Salud" },
    { title: "Proceso productivo de la yerba mate en Argentina", embedId: "oziH3OHfbJU", category: "Producción" },
    { title: "Redescubrí el mate. Elegí entre nuestras 10 variedades exclusivas.", embedId: "MM0Z0EZ16xk", category: "Variedades" },
    { title: "Muchas gracias por el espacio @EcoMedios1220", embedId: "exnEmi-AWR0", category: "Entrevistas" },
    { title: "Conseguí mates ricos, rendidores, que no te produzcan acidez!", embedId: "_7B__P5p7gQ", category: "Tips" },
    { title: "Araí, mates que hacen bien!", embedId: "925vM8zO8eM", category: "Institucional" },
    { title: "Yerba Mate Araí Tipo Uruguaya", embedId: "K4ccXku3YJs", category: "Variedades" },
    { title: "Yerba Mate Araí Suave", embedId: "lzYzOKPQjk0", category: "Variedades" }
];

export default function VideosPage() {
    // Featured video is the first one
    const featuredVideo = videos[0];
    // Remaining 8 videos for the grid
    const gridVideos = videos.slice(1);

    return (
        <div className="bg-white min-h-screen pt-12 font-montserrat overflow-hidden">
            {/* Hero Section */}
            <header className="max-w-6xl mx-auto px-4 md:px-8 mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                        className="pt-8"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-bold tracking-[0.2em] mb-6 uppercase">
                            <Play className="h-3 w-3" />
                            <span>Tradición en Movimiento</span>
                        </div>
                        <h1 className="text-[40px] md:text-[64px] font-light text-gray-900 tracking-tight leading-[1.1] mb-8">
                            Nuestra alma <br />
                            <span className="font-semibold text-primary">en video</span>
                        </h1>
                        <p className="text-[16px] md:text-[18px] text-gray-500 leading-relaxed font-light max-w-lg">
                            Desde el corazón de Misiones hasta tu pantalla. Descubrí el proceso artesanal, entrevistas y el mundo de Araí a través de nuestra videoteca.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="relative h-[250px] md:h-[400px] rounded-[40px] overflow-hidden shadow-2xl bg-black/5"
                    >
                        <iframe
                            className="absolute inset-0 w-full h-full"
                            src={`https://www.youtube.com/embed/${featuredVideo.embedId}?modestbranding=1&rel=0`}
                            title="Featured Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                    </motion.div>
                </div>
            </header>

            {/* Videos Grid */}
            <main className="max-w-6xl mx-auto px-4 md:px-8 space-y-8 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {gridVideos.map((video, index) => (
                        <motion.section
                            key={video.embedId}
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className="relative"
                        >
                            <div className="flex flex-col gap-4">
                                {/* Visual Side - Video */}
                                <div className="relative aspect-video rounded-[40px] overflow-hidden shadow-xl bg-gray-50 border border-gray-100 group">
                                    <iframe
                                        className="absolute inset-0 w-full h-full"
                                        src={`https://www.youtube.com/embed/${video.embedId}?modestbranding=1&rel=0`}
                                        title={video.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />

                                    {/* Background Number Pattern (Matches Proceso style) */}
                                    <span className="text-[120px] md:text-[180px] font-black text-primary/10 leading-none absolute -bottom-10 -right-6 select-none pointer-events-none group-hover:text-primary/15 transition-colors z-[-1]">
                                        0{index + 1}
                                    </span>
                                </div>

                                {/* Content Side */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-4">
                                        <div className="h-px w-8 bg-primary/30" />
                                        <h3 className="text-[11px] font-bold tracking-[0.3em] text-primary/40 uppercase">
                                            {video.category}
                                        </h3>
                                    </div>
                                    <h3 className="text-[20px] md:text-[24px] font-light text-gray-900 leading-tight group-hover:text-primary transition-colors">
                                        {video.title}
                                    </h3>
                                </div>
                            </div>
                        </motion.section>
                    ))}
                </div>

                {/* Bottom CTA - Parallax Style Parity */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-12 p-12 md:p-24 rounded-[60px] bg-primary/5 border border-primary/10 relative overflow-hidden text-center"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

                    <span className="text-[10px] font-bold tracking-[0.6em] text-primary/40 uppercase mb-12 block">#ComunidadAraí</span>

                    <h2 className="text-[32px] md:text-[52px] font-light text-gray-900 tracking-tight leading-tight mb-8">
                        ¿Querés ver <span className="font-semibold text-primary italic">más</span>?
                    </h2>
                    <p className="text-[16px] md:text-[18px] text-gray-500 font-light leading-relaxed mb-12 max-w-2xl mx-auto">
                        Suscribite a nuestro canal oficial para estar al tanto de todas las novedades de nuestra yerba mate artesanal.
                    </p>
                    <a
                        href="https://www.youtube.com/@yerbamatearai2202"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-4 bg-primary text-white px-12 py-6 rounded-full font-bold uppercase tracking-widest text-[11px] hover:scale-105 transition-transform shadow-2xl shadow-primary/20"
                    >
                        <Youtube className="w-5 h-5 transition-transform group-hover:scale-110" />
                        Ir al Canal Oficial
                    </a>
                </motion.div>
            </main>
        </div>
    );
}
