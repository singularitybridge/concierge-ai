import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json');

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  inStock: boolean;
  featured: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface ProductsData {
  products: Product[];
  categories: Category[];
}

async function readData(): Promise<ProductsData> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { products: [], categories: [] };
  }
}

async function writeData(data: ProductsData): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// GET - Retrieve all products or filter by category/featured
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const includeCategories = searchParams.get('includeCategories');

    const data = await readData();

    if (id) {
      const product = data.products.find(p => p.id === id);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(product);
    }

    let products = data.products;

    if (category) {
      products = products.filter(p => p.category === category);
    }

    if (featured === 'true') {
      products = products.filter(p => p.featured);
    }

    if (includeCategories === 'true') {
      return NextResponse.json({ products, categories: data.categories });
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error reading products:', error);
    return NextResponse.json({ error: 'Failed to read products' }, { status: 500 });
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const newProduct: Product = await request.json();
    const data = await readData();

    if (data.products.some(p => p.id === newProduct.id)) {
      return NextResponse.json({ error: 'Product with this ID already exists' }, { status: 400 });
    }

    data.products.push(newProduct);
    await writeData(data);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

// PUT - Update an existing product
export async function PUT(request: NextRequest) {
  try {
    const updatedProduct: Product = await request.json();
    const data = await readData();

    const index = data.products.findIndex(p => p.id === updatedProduct.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    data.products[index] = updatedProduct;
    await writeData(data);

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE - Delete a product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const data = await readData();
    const index = data.products.findIndex(p => p.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const deleted = data.products.splice(index, 1)[0];
    await writeData(data);

    return NextResponse.json(deleted);
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
