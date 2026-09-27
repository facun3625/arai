import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Img,
    Button,
} from '@react-email/components';
import * as React from 'react';

interface CartItem {
    name: string;
    quantity: number;
    price?: number;
}

interface AbandonedCartTemplateProps {
    customerName: string;
    items: CartItem[];
    total: number;
}

export const AbandonedCartTemplate = ({ customerName, items, total }: AbandonedCartTemplateProps) => {
    return (
        <Html>
            <Head />
            <Preview>Dejaste productos en tu carrito - Araí Yerba Mate</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={logoContainer}>
                        <Img
                            src="https://yerbamatearai.com.ar/arai_logo.png"
                            width="120"
                            height="auto"
                            alt="Araí"
                            style={logo}
                        />
                    </Section>

                    <Heading style={h1}>¡Hola, {customerName}!</Heading>

                    <Section style={section}>
                        <Text style={heroText}>
                            Notamos que dejaste estos productos en tu carrito. Todavía están disponibles:
                        </Text>

                        {items.map((item, i) => (
                            <Text key={i} style={itemText}>
                                <strong>{item.quantity}x</strong> {item.name}
                            </Text>
                        ))}

                        <Text style={totalText}>Total: $ {total.toLocaleString('es-AR')}</Text>
                    </Section>

                    <Section style={buttonContainer}>
                        <Button style={button} href="https://yerbamatearai.com.ar/carrito">
                            Completar mi compra
                        </Button>
                    </Section>

                    <Section style={footer}>
                        <Text style={footerText}>
                            Araí Yerba Mate - Ritual y Tradición<br />
                            Si ya no querés recibir estos recordatorios, respondé a este correo.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default AbandonedCartTemplate;

const main = {
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '580px',
};

const logoContainer = {
    backgroundColor: '#1a432e',
    padding: '30px 0',
    textAlign: 'center' as const,
    borderRadius: '12px 12px 0 0',
};

const logo = {
    margin: '0 auto',
};

const h1 = {
    color: '#1a1a1a',
    fontSize: '24px',
    fontWeight: '700',
    lineHeight: '32px',
    margin: '0 0 20px',
    textAlign: 'center' as const,
};

const heroText = {
    color: '#444444',
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'center' as const,
    marginBottom: '20px',
};

const itemText = {
    color: '#333333',
    fontSize: '14px',
    lineHeight: '22px',
    textAlign: 'center' as const,
    margin: '4px 0',
};

const totalText = {
    color: '#0c120e',
    fontSize: '16px',
    fontWeight: '700',
    textAlign: 'center' as const,
    marginTop: '16px',
};

const section = {
    padding: '20px',
    backgroundColor: '#fafafa',
    borderRadius: '12px',
    marginBottom: '30px',
};

const buttonContainer = {
    textAlign: 'center' as const,
};

const button = {
    backgroundColor: '#0c120e',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '16px 32px',
};

const footer = {
    padding: '40px 20px 0',
    textAlign: 'center' as const,
};

const footerText = {
    color: '#aaaaaa',
    fontSize: '12px',
    lineHeight: '18px',
};
