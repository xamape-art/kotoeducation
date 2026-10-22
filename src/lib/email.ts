import nodemailer from 'nodemailer'

export const OWNER_EMAIL = 'kotoeducation@gmail.com'

export function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) {
    console.warn('Gmail SMTP credentials are not defined; email not sent:', subject)
    return
  }
  try {
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
    await transporter.sendMail({ from: `"Koto Education" <${user}>`, to, subject, html })
  } catch (err) {
    console.error('Failed to send email:', subject, err)
  }
}

// Shared wrapper so all shop emails look the same
export function emailLayout(title: string, body: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; color: #38251e;">
      <h2 style="border-bottom: 2px solid #C47A35; padding-bottom: 10px; margin-top: 0;">${title}</h2>
      ${body}
      <p style="margin-top: 30px; font-size: 11px; color: #999; text-align: center;">Koto Education · Terrassa · ${OWNER_EMAIL}</p>
    </div>
  `
}
