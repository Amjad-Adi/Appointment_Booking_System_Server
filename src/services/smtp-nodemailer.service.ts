import {transporter} from "../config/nodemail";

const SENDER_EMAIL =
    "amjadqaher@gmail.com";

export async function inviteEmail(
    organizationName: string,
    toEmail: string,
    inviteLink: string,
): Promise<void> {
    try {
        await transporter.sendMail({
            from:
                `"${organizationName}" <${SENDER_EMAIL}>`,

            to:
            toEmail,

            subject:
                `Invitation to join ${organizationName}`,

            html: `
                <div
                    style="
                        font-family: ui-sans-serif, system-ui, -apple-system,
                        BlinkMacSystemFont, 'Segoe UI', Roboto,
                        'Helvetica Neue', Arial, sans-serif;
                        max-width: 500px;
                        margin: 0 auto;
                        border: 1px solid #d3d3df;
                        border-radius: 12px;
                        overflow: hidden;
                        background-color: #ffffff;
                        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                    "
                >
                    <div
                        style="
                            background-color: #2563EB;
                            height: 4px;
                            width: 100%;
                        "
                    ></div>

                    <div style="padding: 20px;">
                        <h3
                            style="
                                margin: 0 0 4px 0;
                                font-size: 14px;
                                font-weight: 600;
                                color: #343447;
                            "
                        >
                            Invitation to join ${organizationName}
                        </h3>

                        <p
                            style="
                                margin: 0 0 20px 0;
                                font-size: 11px;
                                line-height: 1.6;
                                color: #777789;
                            "
                        >
                            You have been invited to collaborate with
                            ${organizationName}. Click the button below to
                            accept your invitation and access the organization's
                            workspace.
                        </p>

                        <div style="display: inline-block;">
                            <a
                                href="${inviteLink}"
                                style="
                                    display: inline-block;
                                    background-color: #2563EB;
                                    color: #ffffff;
                                    padding: 8px 14px;
                                    border-radius: 6px;
                                    text-decoration: none;
                                    font-size: 11px;
                                    font-weight: 500;
                                "
                            >
                                Accept Invitation
                            </a>
                        </div>

                        <p
                            style="
                                margin: 20px 0 0 0;
                                font-size: 10px;
                                line-height: 1.5;
                                color: #777789;
                            "
                        >
                            If you did not expect this invitation, you can
                            safely ignore this email.
                        </p>
                    </div>
                </div>
            `,
        });
    } catch (error) {
        console.error(
            "Failed to send invitation email:",
            error,
        );

        throw error;
    }
}


export async function sendInvitationEmail(
    organizationName: string,
    toEmail: string,
    rawToken: string,
): Promise<void> {
    try {
        const frontendUrl =
            process.env.NODE_ENV === "production"
                ? process.env.FRONTEND_PRODUCTION_URL
                : process.env.FRONTEND_DEVELOPMENT_URL;

        if (!frontendUrl) {
            throw new Error(
                "Frontend URL is not configured.",
            );
        }

        const inviteLink =
            `${frontendUrl}/invitations/accept?token=${encodeURIComponent(rawToken)}`;


        await inviteEmail(
            organizationName,
            toEmail,
            inviteLink,
        );
    } catch (error) {
        console.error(
            "Failed to send invitation email:",
            error,
        );

        throw error;
    }
}