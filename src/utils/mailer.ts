export const subscribeMailOption = async (email: string) => {
  // const capitalizedRecipientName = username.charAt(0).toUpperCase() + username.slice(1)
  const mailOptions = {
    to: email, // list of receivers
    subject: "Arellow", // Subject line
    html: `
        <!DOCTYPE html>
        <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
        <head>
            <meta charset="utf-8"> <!-- utf-8 works for most cases -->
            <meta name="viewport" content="width=device-width"> <!-- Forcing initial-scale shouldn't be necessary -->
            <meta http-equiv="X-UA-Compatible" content="IE=edge"> <!-- Use the latest (edge) version of IE rendering engine -->
            <meta name="x-apple-disable-message-reformatting">  <!-- Disable auto-scale in iOS 10 Mail entirely -->
            <title></title> <!-- The title tag shows in email notifications, like Android 4.4. -->
        
            <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">
        
            <!-- CSS Reset : BEGIN -->
            <style>
        
                /* What it does: Remove spaces around the email design added by some email clients. */
                /* Beware: It can remove the padding / margin and add a background color to the compose a reply window. */
                html,
        body {
            margin: 0 auto !important;
            padding: 0 !important;
            height: 100% !important;
            width: 100% !important;
            background: #f1f1f1;
        }
        
        /* What it does: Stops email clients resizing small text. */
        * {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }
        
        /* What it does: Centers email on Android 4.4 */
        div[style*="margin: 16px 0"] {
            margin: 0 !important;
        }
        
        /* What it does: Stops Outlook from adding extra spacing to tables. */
        table,
        td {
            mso-table-lspace: 0pt !important;
            mso-table-rspace: 0pt !important;
        }
        
        /* What it does: Fixes webkit padding issue. */
        table {
            border-spacing: 0 !important;
            border-collapse: collapse !important;
            table-layout: fixed !important;
            margin: 0 auto !important;
        }
        
        /* What it does: Uses a better rendering method when resizing images in IE. */
        img {
            -ms-interpolation-mode:bicubic;
        }
        
        /* What it does: Prevents Windows 10 Mail from underlining links despite inline CSS. Styles for underlined links should be inline. */
        a {
            text-decoration: none;
        }
        
        /* What it does: A work-around for email clients meddling in triggered links. */
        *[x-apple-data-detectors],  /* iOS */
        .unstyle-auto-detected-links *,
        .aBn {
            border-bottom: 0 !important;
            cursor: default !important;
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }
        
        /* What it does: Prevents Gmail from displaying a download button on large, non-linked images. */
        .a6S {
            display: none !important;
            opacity: 0.01 !important;
        }
        
        /* What it does: Prevents Gmail from changing the text color in conversation threads. */
        .im {
            color: inherit !important;
        }
        
        /* If the above doesn't work, add a .g-img class to any image in question. */
        img.g-img + div {
            display: none !important;
        }
        
        /* What it does: Removes right gutter in Gmail iOS app: https://github.com/TedGoas/Cerberus/issues/89  */
        /* Create one of these media queries for each additional viewport size you'd like to fix */
        
        /* iPhone 4, 4S, 5, 5S, 5C, and 5SE */
        @media only screen and (min-device-width: 320px) and (max-device-width: 374px) {
            u ~ div .email-container {
                min-width: 320px !important;
            }
        }
        /* iPhone 6, 6S, 7, 8, and X */
        @media only screen and (min-device-width: 375px) and (max-device-width: 413px) {
            u ~ div .email-container {
                min-width: 375px !important;
            }
        }
        /* iPhone 6+, 7+, and 8+ */
        @media only screen and (min-device-width: 414px) {
            u ~ div .email-container {
                min-width: 414px !important;
            }
        }
        
            </style>
        
            <!-- CSS Reset : END -->
        
            <!-- Progressive Enhancements : BEGIN -->
            <style>
        
                .primary{
            background: #30e3ca;
        }
        .bg_white{
            background: #ffffff;
        }
        .bg_light{
            background: #fafafa;
        }
        .bg_black{
            background: #000000;
        }
        .bg_dark{
            background: rgba(0,0,0,.8);
        }
        .email-section{
            padding:2.5em;
        }
        
        /*BUTTON*/
        .btn{
            padding: 10px 15px;
            display: inline-block;
        }
        .btn.btn-primary{
            border-radius: 5px;
            background: #30e3ca;
            color: #ffffff;
        }
        .btn.btn-white{
            border-radius: 5px;
            background: #ffffff;
            color: #000000;
        }
        .btn.btn-white-outline{
            border-radius: 5px;
            background: transparent;
            border: 1px solid #fff;
            color: #fff;
        }
        .btn.btn-black-outline{
            border-radius: 0px;
            background: transparent;
            border: 2px solid #000;
            color: #000;
            font-weight: 700;
        }
        
        h1,h2,h3,h4,h5,h6{
            font-family: 'Lato', sans-serif;
            color: #000000;
            margin-top: 0;
            font-weight: 400;
        }
        
        body{
            font-family: 'Lato', sans-serif;
            font-weight: 400;
            font-size: 15px;
            line-height: 1.8;
            color: rgba(0,0,0,.4);
        }
        
        a{
            color: #30e3ca;
        }
        
        table{
        }
        /*LOGO*/
        
        
        .logo h1 {
            margin: 0;
            color: #30e3ca;
            font-size: 24px;
            font-weight: 700;
            font-family: 'Lato', sans-serif;
        }
        
        /*HERO*/
        .hero{
            position: relative;
            z-index: 0;
        }
        
        .hero .text{
            color: rgba(0,0,0,.3);
        }
        .hero .text h2{
            color: #000;
            font-size: 40px;
            margin-bottom: 0;
            font-weight: 400;
            line-height: 1.4;
        }
        .hero .text h3{
            font-size: 24px;
            font-weight: 300;
        }
        .hero .text h2 span{
            font-weight: 600;
            color: #30e3ca;
        }
        
        
        /*HEADING SECTION*/
        .heading-section{
        }
        .heading-section h2{
            color: #000000;
            font-size: 28px;
            margin-top: 0;
            line-height: 1.4;
            font-weight: 400;
        }
        .heading-section .subheading{
            margin-bottom: 20px !important;
            display: inline-block;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: rgba(0,0,0,.4);
            position: relative;
        }
        .heading-section .subheading::after{
            position: absolute;
            left: 0;
            right: 0;
            bottom: -10px;
            content: '';
            width: 100%;
            height: 2px;
            background: #30e3ca;
            margin: 0 auto;
        }
        
        .heading-section-white{
            color: rgba(255,255,255,.8);
        }
        .heading-section-white h2{
            font-family: 
            line-height: 1;
            padding-bottom: 0;
        }
        .heading-section-white h2{
            color: #ffffff;
        }
        .heading-section-white .subheading{
            margin-bottom: 0;
            display: inline-block;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: rgba(255,255,255,.4);
        }
        
        
        ul.social{
            padding: 0;
        }
        ul.social li{
            display: inline-block;
            margin-right: 10px;
        }
        
        /*FOOTER*/
        
        .footer{
            border-top: 1px solid rgba(0,0,0,.05);
            color: rgba(0,0,0,.5);
        }
        .footer .heading{
            color: #000;
            font-size: 20px;
        }
        .footer ul{
            margin: 0;
            padding: 0;
        }
        .footer ul li{
            list-style: none;
            margin-bottom: 10px;
        }
        .footer ul li a{
            color: rgba(0,0,0,1);
        }
        
        
        // @media screen and (max-width: 500px) {
        
        
        // }
        
        
            </style>
        
        
        </head>
        
        <body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #f1f1f1;">
            <center style="width: 100%; background-color: #f1f1f1;">
            <div style="display: none; font-size: 1px;max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
              &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
            </div>
            <div style="max-width: 600px; margin: 0 auto;" class="email-container">
                <!-- BEGIN BODY -->
              <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: auto;">
                  
                  <tr>
                  <td valign="middle" class="hero bg_white" style="padding: 3em 0 2em 0;">
                    <img src="https://arellow.com/storage/20231205-112622-2.png" alt="email" style="width: 300px; max-width: 600px; height: auto; margin: auto; display: block;">
                  </td>
                  </tr><!-- end tr -->
                        <tr>
                  <td valign="middle" class="hero bg_white" style="padding: 2em 0 4em 0;">
                    <table>
                        <tr>
                            <td>
 <div class="text" style="padding: 0 2.5em; text-align: center;">
            <p>Get arellow app by clicking the link</p>
          
            <p><a class="btn btn-primary" href=${process.env.APP_LINK} target="_blank" > here</a> </p>
        </div>

                            </td>
                        </tr>
                    </table>
                  </td>
                  </tr><!-- end tr -->
              <!-- 1 Column Text + Button : END -->
              </table>
              
            </div>
          </center>
        </body>
        </html>
        
        `,
  };

  return mailOptions;
};


interface SendForgetPasswordMailOptionParams {
  email: string;
  username?: string;
}

export const sendForgetPasswordMailOption = async (
  { email, username }: SendForgetPasswordMailOptionParams,
  resetCode: string | number
): Promise<{
  to: string;
  subject: string;
  html: string;
}> => {
  const mailOptions = {
    to: email,
    subject: "Password Reset Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Hi ${username || "User"},</p>
        <p>We received a request to reset your password. Use the 6-digit code below to proceed:</p>
        <div style="font-size: 24px; font-weight: bold; color: #333; padding: 10px 0;">
          ${resetCode}
        </div>
        <p>This code will expire in 24 hours. If you didn’t request a password reset, you can ignore this message.</p>
        <br />
        <p>Thanks,</p>
        <p>The Cue Team</p>
      </div>
    `,
  };

  return mailOptions;
};



export const emailVerificationMailOption = async (
  email: string,
  verificationLink: any
) => {
  return {
    to: email,
    subject: "Email Verification",
    html: `
    
    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Email Verification</title>
</head>
<body style="margin:0; padding:0; background-color:#f7f7f7; font-family: Arial, sans-serif;">
  <center>
    <table width="100%" bgcolor="#f7f7f7" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="padding: 30px 15px;">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 6px; box-shadow: 0 0 5px rgba(0,0,0,0.1);">
            <tr>
              <td align="center" style="padding: 40px 30px 20px 30px;">
                <h2 style="margin: 0; font-size: 24px; color: #333333;">Email Verification</h2>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 10px 30px 30px 30px; color: #555555; font-size: 16px; line-height: 1.5;">
                <p style="margin: 0 0 20px 0;">Click the button below to verify your email address:</p>
                <a href="${verificationLink}" 
                   style="display: inline-block; background-color: #30e3ca; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold;">
                  Verify My Email
                </a>
                <p style="margin: 30px 0 0 0; font-size: 14px; color: #888888;">
                  If you didn’t sign up, please ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>

    `
  };
};


export const createTicketMailOption = async ({  email,
  userName,
  ticketNumber,
  subject,
  date,}:
{  email: string,
  userName: string,
  ticketNumber: string,
  subject: string,
  date: string,}
) => {
  return {
    to: email,
    subject: "Support Ticket Confirmation",
    html: `
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Support Ticket Confirmation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    /* Responsive adjustments */
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 10px !important;
      }
      .content {
        font-size: 16px !important;
      }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">

        <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="container" style="background-color:#ffffff; border-radius:8px; padding: 20px; width:600px; max-width:100%;">
          <tr>
            <td align="center" style="padding-bottom: 20px; border-bottom:1px solid #ddd;">
              <h1 style="color:#1a73e8; margin:0;">Support Ticket Received</h1>
              <p style="margin: 5px 0 0 0; color:#555;">Thank you for contacting us</p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 20px; color:#333; font-size: 14px; line-height: 1.6;">
              <p>Hi <strong>${userName}</strong>,</p>
              <p>We’ve received your request and a member of our support team will review it shortly. Here are the ticket details:</p>

              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f9f9f9; border:1px solid #ddd; border-radius:6px; padding:10px; margin-top:15px;">
                <tr>
                  <td style="padding:10px;">
                    <p><strong>Ticket Number:</strong> ${ticketNumber}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Status:</strong> Open</p>
                    <p><strong>Submitted:</strong> ${date}</p>
                  </td>
                </tr>
              </table>

              <p>If you need to update your request, just reply to this email. We aim to respond within 24 hours.</p>

              <p>Best regards,<br>
              <strong>Arellow Support Team</strong></p>
            </td>
          </tr>

          <tr>
            <td align="center" style="font-size:12px; color:#888; padding: 20px 10px 0 10px; border-top:1px solid #ddd;">
              &copy; 2025 Arellow Inc. &nbsp;|&nbsp;
              <a href="mailto:support@arellow.com" style="color:#888; text-decoration:none;">support@arellow.com</a>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>

    
    
    `
    
  };
};

export const replyTicketMailOption = async ({  email,
    user_name, 
    ticket_id, 
    ticket_subject,
    ticket_status,
    support_reply,
    agent_name
}:
{  email: string,
 user_name: string, 
    ticket_id: string, 
    ticket_subject: string,
    ticket_status: string,
    support_reply: string,
    agent_name: string
}
) => {
  return {
    to: email,
    subject: "Support Ticket Reply",
    html: `
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Support Ticket Reply</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 10px !important;
      }
      .content {
        font-size: 16px !important;
      }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">

        <table role="presentation" cellpadding="0" cellspacing="0" width="600" class="container" style="background-color:#ffffff; border-radius:8px; padding: 20px; width:600px; max-width:100%;">
          <tr>
            <td align="center" style="padding-bottom: 20px; border-bottom:1px solid #ddd;">
              <h1 style="color:#1a73e8; margin:0;">Ticket Update: ${ticket_subject}</h1>
              <p style="margin: 5px 0 0 0; color:#555;">Ticket ${ticket_id} | Status: ${ticket_status}</p>
            </td>
          </tr>

          <tr>
            <td class="content" style="padding: 20px; color:#333; font-size: 14px; line-height: 1.6;">
              <p>Hi <strong>${user_name}</strong>,</p>

              <p>We’ve reviewed your support request and here’s our response:</p>

              <blockquote style="background-color: #f9f9f9; border-left: 4px solid #1a73e8; margin: 20px 0; padding: 15px;">
                ${support_reply}
              </blockquote>

              <p>If you have further questions or need clarification, feel free to reply to this email. We’re here to help!</p>

              <p>Thanks for your patience,<br>
              <strong>${agent_name}</strong><br>
              Customer Service <br>
              Arellow Support Team</p>
            </td>
          </tr>

          <tr>
            <td align="center" style="font-size:12px; color:#888; padding: 20px 10px 0 10px; border-top:1px solid #ddd;">
              &copy; ${new Date().getFullYear()} arellow Inc. &nbsp;|&nbsp;
              <a href="mailto:support@arellow.com" style="color:#888; text-decoration:none;">support@arellow.com</a>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>

    
    `
    
    
  };
};


export const suspendedAccountMailOption = async (
  email: string,
  reason?: string
) => {
  const suspensionReason =
    reason || "Violation of our platform's terms of service.";

  return {
    to: email,
    subject: "Account Suspension Notice",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="utf-8">
          <title>Account Suspended</title>
          <style>
              body {
                  font-family: 'Lato', sans-serif;
                  background: #f7f7f7;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  max-width: 600px;
                  margin: 50px auto;
                  background: white;
                  padding: 30px;
                  border-radius: 8px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
              .reason {
                  background: #ffe6e6;
                  padding: 10px;
                  border-left: 4px solid #e74c3c;
                  margin: 20px 0;
                  font-style: italic;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>Your Account Has Been Suspended</h2>
              <p>We regret to inform you that your account has been suspended.</p>
              <div class="reason">
                  <strong>Reason:</strong> ${suspensionReason}
              </div>
              <p>If you believe this is a mistake, please contact our support team for further assistance.</p>
              <p>Thank you,<br/>The Support Team</p>
          </div>
      </body>
      </html>
    `,
  };
};



export const createPrequalificationMailOptions = async ({email,fullname,isAdmin}:{

    email: string,
    fullname: string,
isAdmin: boolean
}
) => {
  
  const subject = isAdmin ? "New Prequalification Request" : "Prequalification Request Submitted";
  const greeting = isAdmin ? "New Prequalification Request Received" : `Dear ${fullname}`;
  const closingMessage = isAdmin
    ? "Please review the details below and take appropriate action."
    : "We will contact you soon regarding your prequalification request.";

  return {
    to: email,
    subject,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="utf-8">
          <title>${subject}</title>
          <style>
              body {
                  font-family: 'Lato', sans-serif;
                  background: #f7f7f7;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  max-width: 600px;
                  margin: 50px auto;
                  background: white;
                  padding: 30px;
                  border-radius: 8px;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
              .details {
                  margin: 20px 0;
              }
              .details ul {
                  list-style-type: none;
                  padding: 0;
              }
              .details li {
                  margin-bottom: 10px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h2>${greeting}</h2>
              ${!isAdmin ? "<p>Thank you for submitting your prequalification request!</p>" : ""}
              <p>${closingMessage}</p>
              <p>Best,<br/>${isAdmin ? "The Admin Team" : "Your Prequalification Team"}</p>
          </div>
      </body>
      </html>
    `,
  };
};





export const accountSuspendMailOption = async ({
  email,
  suspensionReason,
  fullname,
}: {
  email: string,
  suspensionReason: string,
  fullname: string,
}
) => {
  return {
    to: email,
    subject: "Email Verification",
    html: `

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Account Suspension</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }

    @media screen and (max-width: 600px) {
      .main { width: 100% !important; padding: 20px !important; }
      .content { font-size: 16px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;">
    <tr>
      <td align="center">
        <table class="main" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; margin: 40px auto; padding: 40px; border-radius: 6px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <tr>
            <td align="center" style="padding-bottom: 20px;">
              <img src="https://www.arellow.com/_next/static/media/landingLogo.9a48eee9.svg" alt="Your Company Logo" width="150" style="display:block;">
            </td>
          </tr>
          <tr>
            <td style="color:#333333; font-size:18px; font-weight:bold; padding-bottom: 10px;">
              Account Suspension Notice
            </td>
          </tr>
          <tr>
            <td class="content" style="color:#555555; font-size:16px; line-height:1.6;">
              Hello <strong>${fullname}</strong>,
              <br><br>
              We regret to inform you that your account has been <strong>suspended</strong>.
              <br><br>
              <strong>Reason:</strong> ${suspensionReason}
              <br><br>
              If you believe this was done in error or you'd like to appeal the decision, please contact our support team.
              <br><br>
              <a href="https://arellow.com/support" style="background-color:#e53935; color:#ffffff; text-decoration:none; padding:12px 20px; border-radius:4px; display:inline-block;">Contact Support</a>
              <br><br>
              We appreciate your understanding.
              <br><br>
              Sincerely,<br>
              <strong>Arellow Team</strong>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 30px; font-size:12px; color:#999999;">
              © ${new Date().getFullYear()} Arellow, All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`}}





export const assignPropertyRequestMailOption = async ({
  email,
   realtorName,
    location,
    propertyType,
    bedrooms,
    budget,
    furnishingStatus,
}: {
    email: string,
    realtorName: string,
    location: string,
    propertyType: string,
    bedrooms: number,
    budget: string,
    furnishingStatus: string
}
) => {
  return {
    to: email,
    subject: "New Property Request Opportunity",
    html:
    `
    <!DOCTYPE html>
<html lang="en" style="margin:0; padding:0;">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>New Property Request Opportunity</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px; background-color:#f4f4f4;">
    <tr>
      <td align="center">

        <table width="100%" max-width="600px" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.05); overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color:#198754; padding:20px; color:#ffffff; text-align:center;">
              <h2 style="margin:0; font-size:22px;">New Property Request Near You</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333333;">
              <p>Hello <strong>${realtorName}</strong>,</p>

              <p>
                A client is looking for a property that matches your inventory. You might be able to help!
              </p>

              <h3 style="margin-top:25px; font-size:18px; color:#198754;">Request Details</h3>
              <table cellpadding="0" cellspacing="0" width="100%" style="font-size:14px; margin-top:10px;">
                <tr>
                  <td style="padding:6px 0; font-weight:bold; width:160px;">Location:</td>
                  <td style="padding:6px 0;">${location}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; font-weight:bold;">Type:</td>
                  <td style="padding:6px 0;">${propertyType}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; font-weight:bold;">Bedrooms:</td>
                  <td style="padding:6px 0;">${bedrooms}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; font-weight:bold;">Budget:</td>
                  <td style="padding:6px 0;">${budget}</td>
                </tr>
                <tr>
                  <td style="padding:6px 0; font-weight:bold;">Furnishing:</td>
                  <td style="padding:6px 0;">${furnishingStatus}</td>
                </tr>
              </table>

              <p style="margin-top:20px;">
                If you have a property that matches these requirements, please respond as soon as possible.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fa; padding:20px; font-size:12px; color:#666; text-align:center;">
              This is a property opportunity alert from Arellow homes.<br>
              To stop receiving these alerts, update your preferences in your account.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>

    `
}}


export const kycRejectiontMailOption = async ({
  email,
   userName,
    rejectionReason,
}: {
    email: string,
    userName: string,
    rejectionReason: string,
}
) => {
  return {
    to: email,
    subject: "KYC Rejected",
    html:`

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>KYC Rejected</title>
  <style>
    /* Reset & Compatibility */
    body, table, td, a {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    table {
      border-collapse: collapse !important;
    }
    body {
      width: 100% !important;
      height: 100% !important;
      margin: 0;
      padding: 0;
    }
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }

    /* Mobile responsiveness */
    @media screen and (max-width: 600px) {
      .main {
        width: 100% !important;
      }
      .content {
        padding: 20px !important;
      }
    }
  </style>
</head>
<body style="background-color: #f6f8fa; margin: 0; padding: 0;">
  <center>
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f6f8fa;">
      <tr>
        <td align="center">
          <table width="600" class="main" border="0" cellpadding="0" cellspacing="0" style="background-color: #ffffff; margin: 20px auto; border-radius: 8px; overflow: hidden;">
            <!-- Header -->
            <tr>
              <td bgcolor="#ff4d4f" align="center" style="padding: 20px 40px; color: #ffffff; font-family: Arial, sans-serif; font-size: 24px; font-weight: bold;">
                KYC Verification Failed
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td class="content" style="padding: 30px 40px; font-family: Arial, sans-serif; font-size: 16px; color: #333333; line-height: 1.6;">
                <p>Dear ${userName},</p>
                <p>We regret to inform you that your KYC verification has been rejected.</p>

                <!-- Reason -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                  <tr>
                    <td bgcolor="#ffeaea" style="padding: 15px; border-left: 5px solid #ff4d4f; color: #b30000; font-weight: bold;">
                      Rejection Reason: ${rejectionReason}
                    </td>
                  </tr>
                </table>

                <p>Please review the reason above and submit your documents again to proceed.</p>


                <p>If you need assistance, feel free to contact our support team.</p>

                <p>Thank you,<br>Arellow Team</p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" bgcolor="#f6f8fa" style="padding: 20px; font-family: Arial, sans-serif; font-size: 12px; color: #999999;">
                &copy; 2025 arellow homes. All rights reserved.<br>
                <a href="#" style="color: #999999; text-decoration: underline;">Privacy Policy</a> | <a href="#" style="color: #999999; text-decoration: underline;">Contact Support</a>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>

    `
   
}}



