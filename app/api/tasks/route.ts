import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'tasks.json');

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo: string;
  guestId: string | null;
  propertyId: string | null;
  dueDate: string;
  createdAt: string;
  completedAt: string | null;
  notes: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface TasksData {
  tasks: Task[];
  categories: Category[];
}

async function readData(): Promise<TasksData> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { tasks: [], categories: [] };
  }
}

async function writeData(data: TasksData): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET - Retrieve all tasks or filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const assignedTo = searchParams.get('assignedTo');
    const guestId = searchParams.get('guestId');
    const propertyId = searchParams.get('propertyId');
    const includeCategories = searchParams.get('includeCategories');

    const data = await readData();

    if (id) {
      const task = data.tasks.find(t => t.id === id);
      if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }
      return NextResponse.json(task);
    }

    let tasks = data.tasks;

    if (status) {
      tasks = tasks.filter(t => t.status === status);
    }

    if (priority) {
      tasks = tasks.filter(t => t.priority === priority);
    }

    if (category) {
      tasks = tasks.filter(t => t.category === category);
    }

    if (assignedTo) {
      tasks = tasks.filter(t => t.assignedTo === assignedTo);
    }

    if (guestId) {
      tasks = tasks.filter(t => t.guestId === guestId);
    }

    if (propertyId) {
      tasks = tasks.filter(t => t.propertyId === propertyId);
    }

    if (includeCategories === 'true') {
      return NextResponse.json({ tasks, categories: data.categories });
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error reading tasks:', error);
    return NextResponse.json({ error: 'Failed to read tasks' }, { status: 500 });
  }
}

// POST - Create a new task
export async function POST(request: NextRequest) {
  try {
    const newTask: Task = await request.json();
    const data = await readData();

    if (data.tasks.some(t => t.id === newTask.id)) {
      return NextResponse.json({ error: 'Task with this ID already exists' }, { status: 400 });
    }

    data.tasks.push(newTask);
    await writeData(data);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

// PUT - Update an existing task
export async function PUT(request: NextRequest) {
  try {
    const updatedTask: Task = await request.json();
    const data = await readData();

    const index = data.tasks.findIndex(t => t.id === updatedTask.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    data.tasks[index] = updatedTask;
    await writeData(data);

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// PATCH - Partial update (e.g., status change)
export async function PATCH(request: NextRequest) {
  try {
    const { id, ...updates } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const data = await readData();
    const index = data.tasks.findIndex(t => t.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // If completing task, set completedAt
    if (updates.status === 'completed' && !data.tasks[index].completedAt) {
      updates.completedAt = new Date().toISOString();
    }

    data.tasks[index] = { ...data.tasks[index], ...updates };
    await writeData(data);

    return NextResponse.json(data.tasks[index]);
  } catch (error) {
    console.error('Error patching task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE - Delete a task
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const data = await readData();
    const index = data.tasks.findIndex(t => t.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const deleted = data.tasks.splice(index, 1)[0];
    await writeData(data);

    return NextResponse.json(deleted);
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
