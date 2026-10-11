import {transporter} from "../config/nodemailer";

const SENDER_EMAIL = "amjadqaher@gmail.com";
import { render } from '@react-email/render';
import InviteEmail from '../utils/emails/templates/invitations/invitation-email';
import { mapEmailError } from '../utils/map/map-smtp-errors';
import React, { createElement } from 'react';

export async function sendInvitationEmail(organizationName: string, toEmail: string, rawToken: string,): Promise<void> {
    const frontendUrl = process.env.NODE_ENV === "production" ? process.env.FRONTEND_PRODUCTION_URL : process.env.FRONTEND_DEVELOPMENT_URL;
    const inviteLink = `${frontendUrl}/invitations/accept?token=${encodeURIComponent(rawToken)}`;
    try{
        await inviteEmail(organizationName, toEmail,inviteLink);
    } catch (error) {
        console.error("Failed to send invitation email:", error,);
        throw error;
    }
}

export async function inviteEmail(organizationName: string, toEmail: string, inviteLink: string,): Promise<void> {
    try {
        const html = await render(
            createElement(InviteEmail, {
                organizationName,
                inviteLink,
            }),
        );
        await transporter.sendMail({
            from: `"${organizationName}" <${SENDER_EMAIL}>`,
            to: toEmail,
            subject: `Invitation to join ${organizationName}`,
            html,
        });
    } catch (error) {
        mapEmailError(error);
    }
}
