import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'properties.json');

interface Guest {
  id: string;
  name: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  status: 'vip' | 'standard';
}

interface Property {
  id: string;
  name: string;
  type: string;
  location: string;
  image: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  status: 'occupied' | 'available' | 'maintenance';
  guest: Guest | null;
  staffId: string;
}

interface PropertiesData {
  properties: Property[];
}

async function readData(): Promise<PropertiesData> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { properties: [] };
  }
}

async function writeData(data: PropertiesData): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET - Retrieve all properties or a single property by id
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const data = await readData();

    if (id) {
      const property = data.properties.find(p => p.id === id);
      if (!property) {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
      }
      return NextResponse.json(property);
    }

    return NextResponse.json(data.properties);
  } catch (error) {
    console.error('Error reading properties:', error);
    return NextResponse.json({ error: 'Failed to read properties' }, { status: 500 });
  }
}

// POST - Create a new property
export async function POST(request: NextRequest) {
  try {
    const newProperty: Property = await request.json();
    const data = await readData();

    // Check if property with same id already exists
    if (data.properties.some(p => p.id === newProperty.id)) {
      return NextResponse.json({ error: 'Property with this ID already exists' }, { status: 400 });
    }

    data.properties.push(newProperty);
    await writeData(data);

    return NextResponse.json(newProperty, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}

// PUT - Update an existing property
export async function PUT(request: NextRequest) {
  try {
    const updatedProperty: Property = await request.json();
    const data = await readData();

    const index = data.properties.findIndex(p => p.id === updatedProperty.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    data.properties[index] = updatedProperty;
    await writeData(data);

    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

// DELETE - Delete a property
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const data = await readData();
    const index = data.properties.findIndex(p => p.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const deleted = data.properties.splice(index, 1)[0];
    await writeData(data);

    return NextResponse.json(deleted);
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}
