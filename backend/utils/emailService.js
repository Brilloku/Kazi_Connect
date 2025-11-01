const { Resend } = require('resend');
const crypto = require('crypto');

// Create Resend instance only if API key is available
const createResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
};

const resend = createResendClient();

const sendVerificationEmail = async (email, token) => {
  // If Resend client isn't configured, throw a descriptive error
  if (!resend) {
    throw new Error('Email service not configured - RESEND_API_KEY missing');
  }
  
  const verificationUrl = `${process.env.FRONTEND_URL || 'https://kazi-connect-five.vercel.app'}/verify?token=${token}`;

  try {
    const data = await resend.emails.send({
      from: 'Kazilink <onboarding@resend.dev>',
      to: [email],
      subject: 'Verify Your Email - Kazilink',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Kazilink!</h2>
          <p>Please verify your email address to complete your registration.</p>
          <a href="${verificationUrl}" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">Verify Email</a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    });

    console.log('Verification email sent:', data);
    return data;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  sendVerificationEmail,
  generateVerificationToken,
};
