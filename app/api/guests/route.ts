import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'guests.json');

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  confirmationCode: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestCount: number;
  status: 'vip' | 'standard';
  propertyId: string;
  specialRequests: Array<{ type: string; time?: string; status: string }>;
  pets: { name: string; type: string } | null;
  preferences: {
    dietary: string[];
    room: string[];
  };
}

interface GuestsData {
  guests: Guest[];
}

async function readData(): Promise<GuestsData> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { guests: [] };
  }
}

async function writeData(data: GuestsData): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET - Retrieve all guests or a single guest by id
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const data = await readData();

    if (id) {
      const guest = data.guests.find(g => g.id === id);
      if (!guest) {
        return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
      }
      return NextResponse.json(guest);
    }

    return NextResponse.json(data.guests);
  } catch (error) {
    console.error('Error reading guests:', error);
    return NextResponse.json({ error: 'Failed to read guests' }, { status: 500 });
  }
}

// POST - Create a new guest
export async function POST(request: NextRequest) {
  try {
    const newGuest: Guest = await request.json();
    const data = await readData();

    if (data.guests.some(g => g.id === newGuest.id)) {
      return NextResponse.json({ error: 'Guest with this ID already exists' }, { status: 400 });
    }

    data.guests.push(newGuest);
    await writeData(data);

    return NextResponse.json(newGuest, { status: 201 });
  } catch (error) {
    console.error('Error creating guest:', error);
    return NextResponse.json({ error: 'Failed to create guest' }, { status: 500 });
  }
}

// PUT - Update an existing guest
export async function PUT(request: NextRequest) {
  try {
    const updatedGuest: Guest = await request.json();
    const data = await readData();

    const index = data.guests.findIndex(g => g.id === updatedGuest.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    data.guests[index] = updatedGuest;
    await writeData(data);

    return NextResponse.json(updatedGuest);
  } catch (error) {
    console.error('Error updating guest:', error);
    return NextResponse.json({ error: 'Failed to update guest' }, { status: 500 });
  }
}

// DELETE - Delete a guest
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Guest ID is required' }, { status: 400 });
    }

    const data = await readData();
    const index = data.guests.findIndex(g => g.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 });
    }

    const deleted = data.guests.splice(index, 1)[0];
    await writeData(data);

    return NextResponse.json(deleted);
  } catch (error) {
    console.error('Error deleting guest:', error);
    return NextResponse.json({ error: 'Failed to delete guest' }, { status: 500 });
  }
}
