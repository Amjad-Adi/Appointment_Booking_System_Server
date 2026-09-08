import {transporter} from "../../server.js";

export async function inviteEmail(organizationName:string,fromEmail:String, toEmail: string,inviteLink:string): Promise<void> {
    try{
        await transporter.sendMail({
            from: `"${organizationName}" <${fromEmail}>`,
            to: toEmail,
            subject: `Welcome! Click the link below to complete your sign-in and accept your invitationInvite email to Our ${organizationName}:`,
            html:`
            <p>
            <a href="${inviteLink}">Accept Invitation</a>
            </p>`,
        })
    }catch(e){

    }
}