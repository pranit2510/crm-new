/* ──────────────────────────────────────────────────────────────────── */
/*  src/app/api/calendar/route.ts                                      */
/*  POST → create event, GET → list next 5 events                      */
/* ──────────────────────────────────────────────────────────────────── */
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

/** Decode service-account JSON from the Base-64 env variable. */
function getCredentials() {
  const b64 = process.env.GOOGLE_CALENDAR_CREDS_B64;
  if (!b64) throw new Error('Missing GOOGLE_CALENDAR_CREDS_B64 env var');

  return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
}

/** Return an authenticated Calendar client. */
async function getCalendar() {
  const auth = new google.auth.GoogleAuth({
    credentials: getCredentials(),
    scopes: SCOPES,
  });
  return google.calendar({ version: 'v3', auth });
}

/* ───────────────────────── POST /api/calendar ─────────────────────── */
export async function POST(req: NextRequest) {
  try {
    const { title, description, start } = await req.json();

    const calendar = await getCalendar();

    // normalise input → RFC 3339 + one-hour duration
    const startObj = new Date(start);
    const startDateTime = startObj.toISOString();
    const endDateTime   = new Date(startObj.getTime() + 60 * 60 * 1_000).toISOString();

    const event = {
      summary:      title,
      description,
      start: { dateTime: startDateTime, timeZone: 'UTC' },
      end:   { dateTime: endDateTime,   timeZone: 'UTC' },
    };

    const { data } = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return NextResponse.json({ success: true, eventId: data.id });
  } catch (err: any) {
    console.error('Google Calendar error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ───────────────────────── GET /api/calendar ──────────────────────── */
export async function GET() {
  try {
    const calendar = await getCalendar();

    const now = new Date().toISOString();
    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now,
      maxResults: 5,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return NextResponse.json({ events: data.items || [] });
  } catch (err: any) {
    console.error('Google Calendar error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
