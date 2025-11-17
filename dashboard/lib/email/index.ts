import { Resend } from 'resend'
import { EMAIL_CONFIG, APP_CONFIG } from '@/lib/config'

// Initialize Resend only if API key is available
const resend = EMAIL_CONFIG.apiKey ? new Resend(EMAIL_CONFIG.apiKey) : null

export interface BlockAttemptEmailData {
  parentEmail: string
  childName: string
  siteUrl: string
  blockedAt: string
  profileId: string
}

export async function sendBlockAttemptEmail(data: BlockAttemptEmailData) {
  // Skip if Resend is not configured
  if (!resend) {
    console.warn('⚠️  Resend not configured. Email not sent.')
    return { success: false, error: 'Resend API key not configured' }
  }

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.parentEmail,
      subject: `🚨 ZeeBlocker Alert: ${data.childName} attempted to access restricted site`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ZeeBlocker Alert</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🛡️ ZeeBlocker Alert</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
              <h2 style="color: #dc2626; margin-top: 0;">Restricted Site Access Attempt</h2>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                This is an automated notification from ZeeBlocker regarding <strong>${data.childName}</strong>'s browsing activity.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Profile:</strong> ${data.childName}</p>
                <p style="margin: 5px 0;"><strong>Blocked Site:</strong> <code style="background: #fee; padding: 2px 6px; border-radius: 4px;">${data.siteUrl}</code></p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${data.blockedAt}</p>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                The site was successfully blocked and ${data.childName} was redirected to a safe page.
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${APP_CONFIG.url}/dashboard/timeline?profile=${data.profileId}" 
                   style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  View Full Activity Timeline
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999; text-align: center; margin-bottom: 0;">
                You're receiving this email because you enabled parental notifications in ZeeBlocker.<br>
                <a href="${APP_CONFIG.url}/dashboard/settings" style="color: #667eea;">Manage notification settings</a>
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send email:', error)
      return { success: false, error }
    }

    return { success: true, data: emailData }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

export interface WelcomeEmailData {
  email: string
  fullName: string
}

export async function sendWelcomeEmail(data: WelcomeEmailData) {
  // Skip if Resend is not configured
  if (!resend) {
    console.warn('⚠️  Resend not configured. Welcome email not sent.')
    return { success: false, error: 'Resend API key not configured' }
  }

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      to: data.email,
      subject: '🎉 Welcome to ZeeBlocker!',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to ZeeBlocker</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to ZeeBlocker!</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
              <p style="font-size: 18px; margin-bottom: 20px;">
                Hi ${data.fullName || 'there'}! 👋
              </p>
              
              <p style="font-size: 16px;">
                Welcome to ZeeBlocker - your companion for focused work and online safety.
              </p>
              
              <h3 style="color: #667eea; margin-top: 30px;">🚀 Getting Started</h3>
              
              <ol style="font-size: 15px; line-height: 1.8;">
                <li>Install the browser extension</li>
                <li>Configure your blocklist</li>
                <li>Link your browsers</li>
                <li>Start blocking distractions!</li>
              </ol>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${APP_CONFIG.url}/dashboard" 
                   style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 0 10px 10px 0;">
                  Go to Dashboard
                </a>
                <a href="${APP_CONFIG.url}/dashboard/extension-install" 
                   style="display: inline-block; background: white; color: #667eea; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; border: 2px solid #667eea; margin: 0 0 10px 0;">
                  Install Extension
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999; text-align: center; margin-bottom: 0;">
                Need help? <a href="${APP_CONFIG.url}/support" style="color: #667eea;">Visit our support center</a>
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Failed to send welcome email:', error)
      return { success: false, error }
    }

    return { success: true, data: emailData }
  } catch (error) {
    console.error('Welcome email send error:', error)
    return { success: false, error }
  }
}

