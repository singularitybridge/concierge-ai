import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'reservations.json');

interface Reservation {
  id: string;
  guestId: string;
  guestName: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestCount: number;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  totalAmount: number;
  currency: string;
  paymentStatus: 'pending' | 'partial' | 'paid';
  specialRequests: string[];
  createdAt: string;
}

interface ReservationsData {
  reservations: Reservation[];
}

async function readData(): Promise<ReservationsData> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { reservations: [] };
  }
}

async function writeData(data: ReservationsData): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET - Retrieve all reservations or filter by status/guestId/propertyId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const guestId = searchParams.get('guestId');
    const propertyId = searchParams.get('propertyId');
    const upcoming = searchParams.get('upcoming');

    const data = await readData();

    if (id) {
      const reservation = data.reservations.find(r => r.id === id);
      if (!reservation) {
        return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
      }
      return NextResponse.json(reservation);
    }

    let reservations = data.reservations;

    if (status) {
      reservations = reservations.filter(r => r.status === status);
    }

    if (guestId) {
      reservations = reservations.filter(r => r.guestId === guestId);
    }

    if (propertyId) {
      reservations = reservations.filter(r => r.propertyId === propertyId);
    }

    if (upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0];
      reservations = reservations.filter(r => r.checkIn >= today && r.status !== 'checked-out' && r.status !== 'cancelled');
    }

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error reading reservations:', error);
    return NextResponse.json({ error: 'Failed to read reservations' }, { status: 500 });
  }
}

// POST - Create a new reservation
export async function POST(request: NextRequest) {
  try {
    const newReservation: Reservation = await request.json();
    const data = await readData();

    if (data.reservations.some(r => r.id === newReservation.id)) {
      return NextResponse.json({ error: 'Reservation with this ID already exists' }, { status: 400 });
    }

    data.reservations.push(newReservation);
    await writeData(data);

    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}

// PUT - Update an existing reservation
export async function PUT(request: NextRequest) {
  try {
    const updatedReservation: Reservation = await request.json();
    const data = await readData();

    const index = data.reservations.findIndex(r => r.id === updatedReservation.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    data.reservations[index] = updatedReservation;
    await writeData(data);

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
  }
}

// PATCH - Partial update (e.g., status change)
export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Reservation ID is required' }, { status: 400 });
    }

    const data = await readData();
    const index = data.reservations.findIndex(r => r.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    data.reservations[index] = { ...data.reservations[index], ...updates };
    await writeData(data);

    return NextResponse.json(data.reservations[index]);
  } catch (error) {
    console.error('Error patching reservation:', error);
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
  }
}

// DELETE - Delete a reservation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Reservation ID is required' }, { status: 400 });
    }

    const data = await readData();
    const index = data.reservations.findIndex(r => r.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const deleted = data.reservations.splice(index, 1)[0];
    await writeData(data);

    return NextResponse.json(deleted);
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json({ error: 'Failed to delete reservation' }, { status: 500 });
  }
}
