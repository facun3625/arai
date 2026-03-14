import { Facebook, Instagram, Twitter } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="bg-primary text-white py-20 px-4 relative overflow-hidden">
            {/* Sutil textura o gradiente de fondo */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                <div className="space-y-6">
                    <a href="/" className="inline-block group relative w-28 h-10">
                        <img
                            src="/arai_logo.png"
                            alt="Araí Yerba Mate"
                            className="h-full w-auto brightness-0 invert transition-transform duration-500 group-hover:scale-105 object-contain"
                        />
                    </a>
                    <p className="text-[13px] text-white/60 leading-relaxed font-medium max-w-[200px]">
                        Llevamos lo mejor de nuestra tierra a tu mesa. Yerba mate de autor con alma misionera.
                    </p>
                </div>
                <div>
                    <h4 className="text-[11px] font-bold text-white mb-8 uppercase opacity-40">secciones</h4>
                    <ul className="text-xs space-y-4 text-white/70 font-medium">
                        <li><a href="/" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-px bg-white transition-all"></span>Inicio</a></li>
                        <li><a href="/tienda" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-px bg-white transition-all"></span>Tienda</a></li>
                        <li><a href="/proceso-productivo" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-px bg-white transition-all"></span>Proceso Productivo</a></li>
                        <li><a href="/contacto" className="hover:text-white transition-colors flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-px bg-white transition-all"></span>Contacto</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-[11px] font-bold text-white mb-8 uppercase opacity-40">contacto</h4>
                    <ul className="text-xs space-y-4 text-white/70 font-medium">
                        <li className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase text-white/30">Email</span>
                            info@arayerba.com
                        </li>
                        <li className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase text-white/30">Teléfono</span>
                            +54 9 11 1234 5678
                        </li>
                        <li className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase text-white/30">Ubicación</span>
                            Misiones, Argentina
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-[11px] font-bold text-white mb-8 uppercase opacity-40">seguinos</h4>
                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-500 group">
                            <Instagram className="h-5 w-5" />
                        </a>
                        <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-500 group">
                            <Facebook className="h-5 w-5" />
                        </a>
                        <a href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-500 group">
                            <Twitter className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto border-t border-white/10 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                <p className="text-[11px] text-white/30 font-medium">
                    © {new Date().getFullYear()} Araí Yerba Mate. Todos los derechos reservados.
                </p>
                <div className="flex gap-6 opacity-40 hover:opacity-100 transition-opacity duration-500">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 brightness-0 invert" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 brightness-0 invert" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 brightness-0 invert" />
                </div>
            </div>
        </footer>
    );
};
