import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text, } from '@react-email/components';
import React from 'react';

interface InviteEmailProps {
    organizationName: string;
    inviteLink: string;
}

export default function InviteEmail({ organizationName, inviteLink, }: InviteEmailProps) {
    return (
        <Html>
            <Head />
            <Preview>Invitation to join {organizationName}</Preview>
            <Body style={styles.body}>
                <Container style={styles.container}>
                    <Section style={styles.header} />
                    <Section style={styles.content}>
                        <Heading as="h3" style={styles.title}>Invitation to join {organizationName}</Heading>
                        <Text style={styles.message}>You have been invited to collaborate with {organizationName}. Click the button below to accept your invitation and access the organization's workspace.</Text>
                        <Button href={inviteLink} style={styles.button}>Accept Invitation</Button>
                        <Text style={styles.footer}>If you did not expect this invitation, you can safely ignore this email.</Text>
                    </Section>
                </Container>
            </Body>
        </Html>);
}

const styles = {
    body: {
        margin: '0',
        padding: '0',
        backgroundColor: '#ffffff',
        fontFamily:
            "Arial, Helvetica, sans-serif",
    },
    container: {
        maxWidth: '500px',
        margin: '0 auto',
        border: '1px solid #d3d3df',
        borderRadius: '12px',
        overflow: 'hidden' as const,
        backgroundColor: '#ffffff',
    },
    header: {
        height: '4px',
        backgroundColor: '#2563EB',
    },
    content: {
        padding: '20px',
    },
    title: {
        margin: '0 0 4px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#343447',
    },
    message: {
        margin: '0 0 20px',
        fontSize: '11px',
        lineHeight: '1.6',
        color: '#777789',
    },
    button: {
        display: 'inline-block',
        padding: '8px 14px',
        borderRadius: '6px',
        backgroundColor: '#2563EB',
        color: '#ffffff',
        textDecoration: 'none',
        fontSize: '11px',
        fontWeight: '500',
    },
    footer: {
        margin: '20px 0 0',
        fontSize: '10px',
        lineHeight: '1.5',
        color: '#777789',
    },
};
