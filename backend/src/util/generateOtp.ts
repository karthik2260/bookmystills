import nodemailer from 'nodemailer'

export default async function generateOTP  (email:string):Promise<string> {
    try {
        console.log('SMTP_EMAIL:',process.env.USER_EMAIL);
        console.log('SMPT_PASSWORD:',process.env.USER_PASSWORD ? 'Loaded' : 'Not loaded');
        
        const otpCode : string = Math.floor(1000 + Math.random() * 9000).toString();
        console.log('Generated OTP:',otpCode);

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port:587,
            secure:false,
            requireTLS:true,
            auth : {
                user:process.env.USER_EMAIL,
                pass:process.env.USER_PASSWORD?.replace(/\s/g,'')
            },
            logger:true,
            debug:true
        })

        await transporter.verify();
        console.log('SMTP connection successfull 📈');

        const mailOptions = {
            from : process.env.USER_EMAIL,
            to:email,
            subject:'Your verification Code for bookmystills',
            html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #5e9ca0;">Hello,</h2>
          <p>Thank you for signing up with CaptureCrew. To complete your registration, please use the following one-time password (OTP):</p>
          <h1 style="color: #333; background: #f4f4f4; padding: 10px; text-align: center; border-radius: 4px;">${otpCode}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
          <br/>
          <p>Best Regards,<br/>CaptureCrew Team</p>
        </div>
      `
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent :',info.messageId);
        
        return otpCode;

        
    } catch (error:any){
        console.error('Full SMTP Error:',error);
        throw new Error ('Failed to generate and send OTP')
    }
}