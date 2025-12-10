import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'staff.json');

interface Shift {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'morning' | 'afternoon' | 'evening' | 'night' | 'off';
  location?: string;
  notes?: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  phone: string;
  email: string;
  status: 'on-duty' | 'off-duty' | 'on-leave';
  rating: number;
  hireDate: string;
  shifts: Shift[];
}

interface StaffData {
  staff: StaffMember[];
}

async function readData(): Promise<StaffData> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { staff: [] };
  }
}

async function writeData(data: StaffData): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET - Retrieve all staff or a single staff member by id
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const data = await readData();

    if (id) {
      const staff = data.staff.find(s => s.id === id);
      if (!staff) {
        return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
      }
      return NextResponse.json(staff);
    }

    return NextResponse.json(data.staff);
  } catch (error) {
    console.error('Error reading staff:', error);
    return NextResponse.json({ error: 'Failed to read staff' }, { status: 500 });
  }
}

// POST - Create a new staff member
export async function POST(request: NextRequest) {
  try {
    const newStaff: StaffMember = await request.json();
    const data = await readData();

    // Check if staff with same id already exists
    if (data.staff.some(s => s.id === newStaff.id)) {
      return NextResponse.json({ error: 'Staff member with this ID already exists' }, { status: 400 });
    }

    data.staff.push(newStaff);
    await writeData(data);

    return NextResponse.json(newStaff, { status: 201 });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json({ error: 'Failed to create staff member' }, { status: 500 });
  }
}

// PUT - Update an existing staff member
export async function PUT(request: NextRequest) {
  try {
    const updatedStaff: StaffMember = await request.json();
    const data = await readData();

    const index = data.staff.findIndex(s => s.id === updatedStaff.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    data.staff[index] = updatedStaff;
    await writeData(data);

    return NextResponse.json(updatedStaff);
  } catch (error) {
    console.error('Error updating staff:', error);
    return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 });
  }
}

// PATCH - Update specific fields of a staff member (useful for shift updates)
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const updates = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
    }

    const data = await readData();
    const index = data.staff.findIndex(s => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    // Merge updates with existing data
    data.staff[index] = { ...data.staff[index], ...updates };
    await writeData(data);

    return NextResponse.json(data.staff[index]);
  } catch (error) {
    console.error('Error patching staff:', error);
    return NextResponse.json({ error: 'Failed to update staff member' }, { status: 500 });
  }
}

// DELETE - Delete a staff member
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Staff ID is required' }, { status: 400 });
    }

    const data = await readData();
    const index = data.staff.findIndex(s => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    const deleted = data.staff.splice(index, 1)[0];
    await writeData(data);

    return NextResponse.json(deleted);
  } catch (error) {
    console.error('Error deleting staff:', error);
    return NextResponse.json({ error: 'Failed to delete staff member' }, { status: 500 });
  }
}
