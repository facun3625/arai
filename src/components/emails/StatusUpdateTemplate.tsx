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

interface StatusUpdateTemplateProps {
    customerName: string;
    orderId: string;
    newStatus: string;
    message: string;
}

export const StatusUpdateTemplate = ({
    customerName,
    orderId,
    newStatus,
    message,
}: StatusUpdateTemplateProps) => {
    return (
        <Html>
            <Head />
            <Preview>Actualización de tu pedido #{orderId.slice(-6).toUpperCase()}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={logoContainer}>
                        <Img
                            src="https://arai-yerba.com/arai_logo.png"
                            width="120"
                            height="auto"
                            alt="Araí"
                            style={logo}
                        />
                    </Section>

                    <Heading style={h1}>¡Hola, {customerName}!</Heading>

                    <Section style={section}>
                        <Text style={heroText}>
                            El estado de tu pedido <strong>#{orderId.slice(-6).toUpperCase()}</strong> ha cambiado a:
                        </Text>
                        <div style={statusBadge}>{newStatus}</div>
                        <Text style={messageText}>{message}</Text>
                    </Section>

                    <Section style={buttonContainer}>
                        <Button
                            style={button}
                            href="https://arai-yerba.com/mi-cuenta/pedidos"
                        >
                            Ver mi pedido
                        </Button>
                    </Section>

                    <Section style={footer}>
                        <Text style={footerText}>
                            Araí Yerba Mate - Ritual y Tradición<br />
                            Si tienes alguna duda, responde a este correo.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default StatusUpdateTemplate;

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

const statusBadge = {
    backgroundColor: '#f4f4f4',
    borderRadius: '4px',
    color: '#0c120e',
    fontSize: '18px',
    fontWeight: '700',
    padding: '12px 24px',
    textAlign: 'center' as const,
    display: 'inline-block',
    margin: '0 auto 20px',
    width: '100%',
    boxSizing: 'border-box' as const,
};

const messageText = {
    color: '#666666',
    fontSize: '14px',
    lineHeight: '22px',
    textAlign: 'center' as const,
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
