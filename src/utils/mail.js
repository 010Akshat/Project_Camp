import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendMail = async (options) =>{
    const mailGenerator = new Mailgen({
        theme: 'default',
        product: {
            name: 'Task Manager',
            link: 'https://mailgen.js/'
        }
    });

    const emailText = mailGenerator.generatePlaintext(options.mailGenContent);
    const emailHtml = mailGenerator.generate(options.mailGenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        secure: false, // true for port 465, false for other ports
        auth: {
          user: process.env.MAILTRAP_SMTP_USER,
          pass: process.env.MAILTRAP_SMTP_PASS,
        },
      });

    const mail = {
        from: 'mail@taskmanager@example.com', // sender address
        to: options.email, // list of receivers
        subject: options.subject, // Subject line
        text: emailText, // plain text body
        html: emailHtml, // html body
    }
    try{
        await transporter.sendMail(mail)
    }catch(error){
        console.log("Email failed",error)
    }
} 

const emailVerificationMailGenContent = (username,verificationUrl)=>{
    return {
        body: {
            name: username,
            intro: 'Welcome to Task Manager! We\'re very excited to have you on board.',
            action: {
                instructions: 'To get started with our App, please click here:',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'Verify your Email',
                    link: verificationUrl
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}

const forgotPasswordMailGenContent = (username,passwordResetUrl)=>{
    return {
        body: {
            name: username,
            intro: 'We got a request to change your password click the button',
            action: {
                instructions: 'To change your password',
                button: {
                    color: '#22BC66', // Optional action button color
                    text: 'Reset Password',
                    link: passwordResetUrl
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    }
}

export {sendMail,emailVerificationMailGenContent,forgotPasswordMailGenContent}
/*
How we can use functionality?

sendMail({
    email: user.email,
    subject: "aaaa",
    mailGenContent:emailVerificationMailGenContent(
        username,
        'https://localhost:3000/url'
    )
})
similarly for resetPassword.
*/