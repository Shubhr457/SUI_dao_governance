import { NextResponse } from 'next/server';
import { 
  sendProposalCreatedNotification, 
  sendProposalVotedNotification, 
  sendProposalExecutedNotification 
} from '@/lib/email-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, email } = body;

    if (!type) {
      return NextResponse.json(
        { success: false, message: 'Notification type is required' },
        { status: 400 }
      );
    }

    let result;
    switch (type) {
      case 'proposal_created':
        await sendProposalCreatedNotification(
          'test-proposal-123',
          'Test Proposal Title',
          'Test Creator'
        );
        result = { success: true, message: 'Test proposal created notification sent' };
        break;
      case 'proposal_voted':
        await sendProposalVotedNotification(
          'test-proposal-123',
          'Test Proposal Title',
          'Test Voter',
          'for'
        );
        result = { success: true, message: 'Test proposal voted notification sent' };
        break;
      case 'proposal_executed':
        await sendProposalExecutedNotification(
          'test-proposal-123',
          'Test Proposal Title',
          'passed'
        );
        result = { success: true, message: 'Test proposal executed notification sent' };
        break;
      default:
        return NextResponse.json(
          { success: false, message: 'Invalid notification type' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in email test API:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}
