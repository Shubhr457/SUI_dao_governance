import { NextResponse } from 'next/server';
import { subscribeToEmails, updateEmailPreferences, getEmailSubscription } from '@/lib/email-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, proposalCreated, proposalVoted, proposalExecuted } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if the email already exists
    const existingSubscription = await getEmailSubscription(email);
    
    let result;
    if (existingSubscription) {
      // Update existing subscription
      result = await updateEmailPreferences({
        email,
        proposalCreated: proposalCreated ?? existingSubscription.proposalCreated,
        proposalVoted: proposalVoted ?? existingSubscription.proposalVoted,
        proposalExecuted: proposalExecuted ?? existingSubscription.proposalExecuted,
      });
    } else {
      // Create new subscription
      result = await subscribeToEmails({
        email,
        proposalCreated: proposalCreated ?? true,
        proposalVoted: proposalVoted ?? true,
        proposalExecuted: proposalExecuted ?? true,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in email subscription API:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    const subscription = await getEmailSubscription(email);
    
    if (!subscription) {
      return NextResponse.json(
        { success: false, message: 'Email not found in subscriptions' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error('Error in email subscription API:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve subscription' },
      { status: 500 }
    );
  }
}
