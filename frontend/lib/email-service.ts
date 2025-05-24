import nodemailer from 'nodemailer';

interface EmailSubscription {
  email: string;
  proposalCreated: boolean;
  proposalVoted: boolean;
  proposalExecuted: boolean;
}

// In-memory store for email subscriptions (for testing)
// In production, you would use a database
const emailSubscriptions: Record<string, EmailSubscription> = {};

// Create a transporter for sending emails
// For production, you would use your actual SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_SMTP_PORT || '587'),
  secure: process.env.EMAIL_SMTP_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
});

// Verify the transporter connection
transporter.verify(function (error: Error | null) {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

export async function subscribeToEmails(subscription: EmailSubscription): Promise<{ success: boolean; message: string }> {
  try {
    // Validate email
    if (!subscription.email || !validateEmail(subscription.email)) {
      return { success: false, message: "Invalid email address" };
    }

    // Store subscription
    emailSubscriptions[subscription.email] = subscription;
    
    // For testing, log the subscription
    console.log("Email subscription added:", subscription);
    
    // In production, you would send a confirmation email here
    
    return { success: true, message: "Successfully subscribed to email notifications" };
  } catch (error) {
    console.error("Error subscribing to emails:", error);
    return { success: false, message: "Failed to subscribe to email notifications" };
  }
}

export async function unsubscribeFromEmails(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Validate email
    if (!email || !validateEmail(email)) {
      return { success: false, message: "Invalid email address" };
    }

    // Remove subscription
    if (emailSubscriptions[email]) {
      delete emailSubscriptions[email];
      console.log("Email subscription removed:", email);
      return { success: true, message: "Successfully unsubscribed from email notifications" };
    } else {
      return { success: false, message: "Email not found in subscriptions" };
    }
  } catch (error) {
    console.error("Error unsubscribing from emails:", error);
    return { success: false, message: "Failed to unsubscribe from email notifications" };
  }
}

export async function updateEmailPreferences(subscription: EmailSubscription): Promise<{ success: boolean; message: string }> {
  try {
    // Validate email
    if (!subscription.email || !validateEmail(subscription.email)) {
      return { success: false, message: "Invalid email address" };
    }

    // Update subscription
    emailSubscriptions[subscription.email] = {
      ...emailSubscriptions[subscription.email],
      ...subscription,
    };
    
    console.log("Email preferences updated:", subscription);
    
    return { success: true, message: "Successfully updated email preferences" };
  } catch (error) {
    console.error("Error updating email preferences:", error);
    return { success: false, message: "Failed to update email preferences" };
  }
}

export async function getEmailSubscription(email: string): Promise<EmailSubscription | null> {
  return emailSubscriptions[email] || null;
}

export async function sendNotificationEmail(
  email: string, 
  subject: string, 
  message: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Check if user is subscribed
    if (!emailSubscriptions[email]) {
      return { success: false, message: "Email not subscribed to notifications" };
    }
    
    // Send an actual email using Nodemailer
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'dao-governance@example.com',
      to: email,
      subject: subject,
      text: message,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333;">${subject}</h2>
        <p style="color: #555; line-height: 1.5;">${message}</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
          <p style="color: #888; font-size: 12px;">This is an automated notification from the SUI DAO Governance platform.</p>
          <p style="color: #888; font-size: 12px;">If you no longer wish to receive these emails, you can update your preferences in the Settings page.</p>
        </div>
      </div>`
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    return { success: true, message: "Email notification sent successfully" };
  } catch (error) {
    console.error("Error sending notification email:", error);
    return { success: false, message: "Failed to send email notification" };
  }
}

// Helper function to validate email format
function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Example function to send proposal created notification
export async function sendProposalCreatedNotification(
  proposalId: string,
  proposalTitle: string,
  proposalCreator: string
): Promise<void> {
  // In a real implementation, you would query all subscribed users
  // For this test implementation, we'll iterate through our in-memory store
  for (const email in emailSubscriptions) {
    const subscription = emailSubscriptions[email];
    if (subscription.proposalCreated) {
      await sendNotificationEmail(
        email,
        "New DAO Proposal Created",
        `A new proposal "${proposalTitle}" (ID: ${proposalId}) has been created by ${proposalCreator}.`
      );
    }
  }
}

// Example function to send proposal voted notification
export async function sendProposalVotedNotification(
  proposalId: string,
  proposalTitle: string,
  voter: string,
  voteType: 'for' | 'against'
): Promise<void> {
  for (const email in emailSubscriptions) {
    const subscription = emailSubscriptions[email];
    if (subscription.proposalVoted) {
      await sendNotificationEmail(
        email,
        "New Vote on DAO Proposal",
        `A new vote (${voteType}) has been cast by ${voter} on proposal "${proposalTitle}" (ID: ${proposalId}).`
      );
    }
  }
}

// Example function to send proposal executed notification
export async function sendProposalExecutedNotification(
  proposalId: string,
  proposalTitle: string,
  result: 'passed' | 'rejected'
): Promise<void> {
  for (const email in emailSubscriptions) {
    const subscription = emailSubscriptions[email];
    if (subscription.proposalExecuted) {
      await sendNotificationEmail(
        email,
        "DAO Proposal Executed",
        `Proposal "${proposalTitle}" (ID: ${proposalId}) has been executed and ${result}.`
      );
    }
  }
}
