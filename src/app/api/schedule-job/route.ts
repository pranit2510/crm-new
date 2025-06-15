import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CREDENTIALS_PATH = path.join(process.cwd(), 'calendar-new.json');


export async function POST(req: NextRequest) {
  try {
    const { title, description, start, end } = await req.json();
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });
    const authClient = await auth.getClient();
    const calendar = google.calendar({
      version: 'v3',
      auth: new google.auth.GoogleAuth({
        credentials,
        scopes: SCOPES
      })
    });

    const startDateTime = start.length === 16 ? start + ':00Z' : start;
    const startDateObj = new Date(startDateTime);
    const endDateObj = new Date(startDateObj.getTime() + 60 * 60 * 1000);
    const endDateTime = endDateObj.toISOString();

    const event = {
      summary: title,
      description,
      start: { dateTime: startDateTime, timeZone: 'UTC' },
      end: { dateTime: endDateTime, timeZone: 'UTC' },
    };
    console.log('Event to insert:', event);
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return NextResponse.json({ success: true, eventId: response.data.id });
  } catch (error: any) {
    console.error('Google Calendar API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function shareCalendar() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });

  const calendar = google.calendar({
    version: 'v3',
    auth: new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES
    })
  });

  // Replace with your own Google email
  const userEmail = '9thgenai@gmail.com';

  await calendar.acl.insert({
    calendarId: 'primary',
    requestBody: {
      role: 'owner',
      scope: {
        type: 'user',
        value: userEmail,
      },
    },
  });

  console.log('Calendar shared with', userEmail);
}

shareCalendar().catch(console.error);

export async function GET() {
  try {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });
    const authClient = await auth.getClient();
    const calendar = google.calendar({
      version: 'v3',
      auth: new google.auth.GoogleAuth({
        credentials,
        scopes: SCOPES
      })
    });

    const now = new Date().toISOString();
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now,
      maxResults: 5,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return NextResponse.json({ events: response.data.items || [] });
  } catch (error: any) {
    console.error('Google Calendar API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 