import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'services.json');

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  availability: string;
  estimatedTime: string;
  pricing: string;
}

interface ServicesData {
  services: Service[];
}

async function readData(): Promise<ServicesData> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { services: [] };
  }
}

async function writeData(data: ServicesData): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET - Retrieve all services or filter by category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');

    const data = await readData();

    if (id) {
      const service = data.services.find(s => s.id === id);
      if (!service) {
        return NextResponse.json({ error: 'Service not found' }, { status: 404 });
      }
      return NextResponse.json(service);
    }

    if (category) {
      const filtered = data.services.filter(s => s.category === category);
      return NextResponse.json(filtered);
    }

    return NextResponse.json(data.services);
  } catch (error) {
    console.error('Error reading services:', error);
    return NextResponse.json({ error: 'Failed to read services' }, { status: 500 });
  }
}

// POST - Create a new service
export async function POST(request: NextRequest) {
  try {
    const newService: Service = await request.json();
    const data = await readData();

    if (data.services.some(s => s.id === newService.id)) {
      return NextResponse.json({ error: 'Service with this ID already exists' }, { status: 400 });
    }

    data.services.push(newService);
    await writeData(data);

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}

// PUT - Update an existing service
export async function PUT(request: NextRequest) {
  try {
    const updatedService: Service = await request.json();
    const data = await readData();

    const index = data.services.findIndex(s => s.id === updatedService.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    data.services[index] = updatedService;
    await writeData(data);

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

// DELETE - Delete a service
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const data = await readData();
    const index = data.services.findIndex(s => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const deleted = data.services.splice(index, 1)[0];
    await writeData(data);

    return NextResponse.json(deleted);
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
