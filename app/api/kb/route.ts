import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const KB_DIR = path.join(process.cwd(), 'data', 'kb');

interface KBFile {
  name: string;
  path: string;
  content?: string;
  size: number;
  modifiedAt: string;
}

// GET - List all KB files or get content of a specific file
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');

    // Ensure KB directory exists
    try {
      await fs.access(KB_DIR);
    } catch {
      await fs.mkdir(KB_DIR, { recursive: true });
    }

    if (fileName) {
      // Get specific file content
      const filePath = path.join(KB_DIR, fileName);

      // Security check - ensure file is within KB directory
      const resolvedPath = path.resolve(filePath);
      if (!resolvedPath.startsWith(path.resolve(KB_DIR))) {
        return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
      }

      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const stats = await fs.stat(filePath);

        return NextResponse.json({
          name: fileName,
          path: filePath,
          content,
          size: stats.size,
          modifiedAt: stats.mtime.toISOString()
        });
      } catch {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
    }

    // List all KB files
    const files = await fs.readdir(KB_DIR);
    const kbFiles: KBFile[] = [];

    for (const file of files) {
      const filePath = path.join(KB_DIR, file);
      const stats = await fs.stat(filePath);

      if (stats.isFile()) {
        kbFiles.push({
          name: file,
          path: filePath,
          size: stats.size,
          modifiedAt: stats.mtime.toISOString()
        });
      }
    }

    return NextResponse.json(kbFiles);
  } catch (error) {
    console.error('Error reading KB files:', error);
    return NextResponse.json({ error: 'Failed to read KB files' }, { status: 500 });
  }
}

// POST - Create a new KB file
export async function POST(request: NextRequest) {
  try {
    const { name, content } = await request.json();

    if (!name || !content) {
      return NextResponse.json({ error: 'File name and content are required' }, { status: 400 });
    }

    // Sanitize filename
    const sanitizedName = name.replace(/[^a-zA-Z0-9-_.]/g, '');
    if (!sanitizedName.endsWith('.txt')) {
      return NextResponse.json({ error: 'Only .txt files are allowed' }, { status: 400 });
    }

    const filePath = path.join(KB_DIR, sanitizedName);

    // Check if file already exists
    try {
      await fs.access(filePath);
      return NextResponse.json({ error: 'File already exists' }, { status: 400 });
    } catch {
      // File doesn't exist, proceed to create
    }

    await fs.writeFile(filePath, content, 'utf-8');
    const stats = await fs.stat(filePath);

    return NextResponse.json({
      name: sanitizedName,
      path: filePath,
      size: stats.size,
      modifiedAt: stats.mtime.toISOString()
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating KB file:', error);
    return NextResponse.json({ error: 'Failed to create KB file' }, { status: 500 });
  }
}

// PUT - Update an existing KB file
export async function PUT(request: NextRequest) {
  try {
    const { name, content } = await request.json();

    if (!name || content === undefined) {
      return NextResponse.json({ error: 'File name and content are required' }, { status: 400 });
    }

    const filePath = path.join(KB_DIR, name);

    // Security check
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(KB_DIR))) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    await fs.writeFile(filePath, content, 'utf-8');
    const stats = await fs.stat(filePath);

    return NextResponse.json({
      name,
      path: filePath,
      size: stats.size,
      modifiedAt: stats.mtime.toISOString()
    });
  } catch (error) {
    console.error('Error updating KB file:', error);
    return NextResponse.json({ error: 'Failed to update KB file' }, { status: 500 });
  }
}

// DELETE - Delete a KB file
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('file');

    if (!fileName) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 });
    }

    const filePath = path.join(KB_DIR, fileName);

    // Security check
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(path.resolve(KB_DIR))) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }

    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    await fs.unlink(filePath);

    return NextResponse.json({ message: 'File deleted successfully', name: fileName });
  } catch (error) {
    console.error('Error deleting KB file:', error);
    return NextResponse.json({ error: 'Failed to delete KB file' }, { status: 500 });
  }
}
