import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Button,
    Img,
    Link,
} from '@react-email/components';
import * as React from 'react';

interface MarketingTemplateProps {
    subject: string;
    content: string;
    buttonText?: string;
    buttonUrl?: string;
}

export const MarketingTemplate = ({
    subject,
    content,
    buttonText,
    buttonUrl,
}: MarketingTemplateProps) => {
    return (
        <Html>
            <Head />
            <Preview>{subject}</Preview>
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

                    <Section style={section}>
                        <Heading style={h1}>{subject}</Heading>
                        {/* Split content by newlines to preserve formatting */}
                        {content.split('\n').map((paragraph, i) => (
                            <Text key={i} style={text}>{paragraph}</Text>
                        ))}
                    </Section>

                    {buttonText && buttonUrl && (
                        <Section style={buttonContainer}>
                            <Button
                                style={button}
                                href={buttonUrl}
                            >
                                {buttonText}
                            </Button>
                        </Section>
                    )}

                    <Section style={footer}>
                        <Text style={footerText}>
                            Araí Yerba Mate<br />
                            Recibiste este correo porque estás suscrito a nuestro newsletter.<br />
                            <Link href="https://yerbamatearai.com.ar/unsubscribe" style={link}>Darse de baja</Link>
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default MarketingTemplate;

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

const text = {
    color: '#444444',
    fontSize: '16px',
    lineHeight: '26px',
    marginBottom: '16px',
};

const section = {
    padding: '20px',
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '20px 0 40px',
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
    borderTop: '1px solid #eeeeee',
};

const footerText = {
    color: '#aaaaaa',
    fontSize: '12px',
    lineHeight: '18px',
};

const link = {
    color: '#aaaaaa',
    textDecoration: 'underline',
};
