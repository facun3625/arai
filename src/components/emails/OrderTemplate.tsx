import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Row,
    Column,
} from '@react-email/components';
import * as React from 'react';

interface OrderTemplateProps {
    customerName: string;
    orderId: string;
    items: any[];
    total: number;
    shippingAddress: any;
}

export const OrderTemplate = ({
    customerName,
    orderId,
    items,
    total,
    shippingAddress,
}: OrderTemplateProps) => {
    const formattedTotal = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
    }).format(total);

    return (
        <Html>
            <Head />
            <Preview>¡Gracias por tu compra en Araí Yerba Mate!</Preview>
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
                    <Heading style={h1}>¡Gracias por tu compra, {customerName}!</Heading>
                    <Text style={heroText}>
                        Estamos preparando tu pedido <strong>#{orderId.slice(-6).toUpperCase()}</strong>.
                        Te avisaremos por este medio cuando esté en camino.
                    </Text>

                    <Section style={section}>
                        <Heading style={h2}>Resumen del Pedido</Heading>
                        {items.map((item, index) => (
                            <Row key={index} style={itemRow}>
                                <Column style={{ width: '60px' }}>
                                    {item.image && (
                                        <Img
                                            src={item.image}
                                            width="50"
                                            height="50"
                                            alt={item.name}
                                            style={productImage}
                                        />
                                    )}
                                </Column>
                                <Column>
                                    <Text style={productName}>{item.name} x {item.quantity}</Text>
                                    <Text style={productPrice}>
                                        {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(item.price * item.quantity)}
                                    </Text>
                                </Column>
                            </Row>
                        ))}
                        <Hr style={hr} />
                        <Row>
                            <Column>
                                <Text style={totalLabel}>TOTAL</Text>
                            </Column>
                            <Column align="right">
                                <Text style={totalValue}>{formattedTotal}</Text>
                            </Column>
                        </Row>
                    </Section>

                    <Section style={section}>
                        <Heading style={h2}>Dirección de Envío</Heading>
                        <Text style={text}>
                            {shippingAddress.street} {shippingAddress.number}
                            {shippingAddress.apartment ? `, ${shippingAddress.apartment}` : ''}<br />
                            {shippingAddress.city}, {shippingAddress.province}<br />
                            CP {shippingAddress.zipCode}
                        </Text>
                    </Section>

                    <Section style={footer}>
                        <Text style={footerText}>
                            Araí Yerba Mate - Ritual y Tradición<br />
                            Si tienes alguna duda, responde a este correo o escríbenos por WhatsApp.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default OrderTemplate;

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

const h2 = {
    color: '#1a1a1a',
    fontSize: '18px',
    fontWeight: '700',
    lineHeight: '24px',
    margin: '20px 0 10px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
};

const heroText = {
    color: '#444444',
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'center' as const,
    marginBottom: '40px',
};

const section = {
    padding: '0 20px',
};

const itemRow = {
    margin: '10px 0',
};

const productImage = {
    borderRadius: '8px',
    border: '1px solid #eeeeee',
};

const productName = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0',
};

const productPrice = {
    fontSize: '12px',
    color: '#666666',
    margin: '2px 0 0',
};

const hr = {
    borderColor: '#eeeeee',
    margin: '20px 0',
};

const totalLabel = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
};

const totalValue = {
    fontSize: '20px',
    fontWeight: '900',
    color: '#0c120e',
};

const text = {
    color: '#444444',
    fontSize: '14px',
    lineHeight: '20px',
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
