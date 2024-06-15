import * as nodemailer from 'nodemailer'




const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});



const emailTemplate = (recipientName, senderName, message) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background-color: #003554;
            color: #0582ca;
            padding: 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 20px;
          }
          .content p {
            margin: 0 0 20px;
          }
          .footer {
            background-color: #f1f1f1;
            padding: 10px;
            text-align: center;
            font-size: 14px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>Welcome to Our Service</h1>
          </div>
          <div class="content">
            <p>Dear ${recipientName},</p>
            <p>${message}</p>
            <p>Best regards,</p>
            <p>${senderName}</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} INTERRA-DAT. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };


export async function sendEmail(senderEmail: string, recipientEmail: string, subject: string, message: string, recipientName: string, senderName: string,): Promise<any> {
    if (!senderEmail || !recipientEmail || !subject || !message) {
        throw new Error('Missing required fields');
    }

    const template = emailTemplate(recipientName, senderName, message)

    const info = await transport.sendMail({
        from: senderEmail,
        to: recipientEmail,
        subject: subject,
        html: template,
    });    

    console.log('Email sent: ', info.response);


    return {
        emailResponse: info.response
    };
}
