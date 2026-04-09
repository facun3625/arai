import Script from "next/script";
import { prisma } from "@/lib/prisma";

export async function AnalyticsScripts() {
    const settings = await prisma.storeSettings.findUnique({
        where: { id: "global" },
        select: { metaPixelId: true, ga4MeasurementId: true },
    });

    const pixelId = settings?.metaPixelId?.trim();
    const ga4Id = settings?.ga4MeasurementId?.trim();

    return (
        <>
            {/* Google Analytics 4 */}
            {ga4Id && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
                        strategy="afterInteractive"
                    />
                    <Script id="ga4-init" strategy="afterInteractive">
                        {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${ga4Id}');
                        `}
                    </Script>
                </>
            )}

            {/* Meta Pixel */}
            {pixelId && (
                <Script id="meta-pixel" strategy="afterInteractive">
                    {`
                        !function(f,b,e,v,n,t,s){
                            if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                            n.queue=[];t=b.createElement(e);t.async=!0;
                            t.src=v;s=b.getElementsByTagName(e)[0];
                            s.parentNode.insertBefore(t,s)
                        }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
                        fbq('init', '${pixelId}');
                        fbq('track', 'PageView');
                    `}
                </Script>
            )}
        </>
    );
}
