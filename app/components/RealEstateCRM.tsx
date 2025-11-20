'use client';

import { useState } from 'react';
import { Building2, Users, TrendingUp, DollarSign, Home, MapPin, Phone, Mail, Calendar, Filter, Search, ArrowLeft, Bed, Bath, Maximize, ParkingCircle, Wind, Droplet, Zap, Wifi, Car } from 'lucide-react';

// Mock Data
const stats = [
  { label: 'Total Properties', value: '1,247', change: '+12%', icon: Building2, color: 'bg-blue-500' },
  { label: 'Active Clients', value: '3,892', change: '+8%', icon: Users, color: 'bg-green-500' },
  { label: 'Monthly Revenue', value: '$2.4M', change: '+23%', icon: DollarSign, color: 'bg-purple-500' },
  { label: 'Deals Closed', value: '156', change: '+15%', icon: TrendingUp, color: 'bg-orange-500' },
];

interface Property {
  id: string;
  address: string;
  type: string;
  price: string;
  beds: number;
  baths: number;
  sqft: string;
  status: string;
  agent: string;
  listed: string;
  description?: string;
  yearBuilt?: number;
  parking?: number;
  features?: string[];
  location?: {
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
  };
  contactHistory?: Array<{
    date: string;
    client: string;
    type: string;
    notes: string;
  }>;
}

const properties: Property[] = [
  {
    id: 'P001',
    address: '1234 Ocean Drive, Miami Beach',
    type: 'Luxury Villa',
    price: '$4,500,000',
    beds: 5,
    baths: 4,
    sqft: '4,200',
    status: 'Available',
    agent: 'Sarah Johnson',
    listed: '2025-01-15',
    description: 'Stunning oceanfront villa with panoramic views, private beach access, infinity pool, and state-of-the-art smart home technology. Chef\'s kitchen with premium appliances, master suite with spa-like bathroom, and expansive outdoor entertainment areas.',
    yearBuilt: 2022,
    parking: 3,
    features: ['Ocean View', 'Private Beach', 'Infinity Pool', 'Smart Home', 'Gourmet Kitchen', 'Wine Cellar', 'Home Theater', 'Gym'],
    location: {
      neighborhood: 'South Beach',
      city: 'Miami Beach',
      state: 'FL',
      zip: '33139'
    },
    contactHistory: [
      { date: '2025-01-18', client: 'Robert Williams', type: 'Viewing', notes: 'Very interested, requested second showing' },
      { date: '2025-01-16', client: 'Lisa Thompson', type: 'Inquiry', notes: 'Asked about HOA fees and maintenance' },
    ]
  },
  {
    id: 'P002',
    address: '5678 Park Avenue, New York',
    type: 'Penthouse',
    price: '$12,800,000',
    beds: 4,
    baths: 5,
    sqft: '5,800',
    status: 'Under Contract',
    agent: 'Michael Chen',
    listed: '2025-01-10',
    description: 'Prestigious Park Avenue penthouse with breathtaking Central Park views. Features include marble floors, high ceilings, private elevator, wraparound terrace, and world-class building amenities including concierge, fitness center, and rooftop lounge.',
    yearBuilt: 2020,
    parking: 2,
    features: ['Central Park View', 'Private Elevator', 'Terrace', 'Marble Floors', 'Concierge', 'Fitness Center', 'Rooftop Access', 'Storage'],
    location: {
      neighborhood: 'Upper East Side',
      city: 'New York',
      state: 'NY',
      zip: '10065'
    },
    contactHistory: [
      { date: '2025-01-17', client: 'Jennifer Martinez', type: 'Offer', notes: 'Submitted offer at asking price' },
      { date: '2025-01-12', client: 'Jennifer Martinez', type: 'Viewing', notes: 'Loved the park views and terrace' },
    ]
  },
  {
    id: 'P003',
    address: '910 Beverly Hills Blvd, Los Angeles',
    type: 'Modern Estate',
    price: '$8,200,000',
    beds: 6,
    baths: 6,
    sqft: '7,500',
    status: 'Available',
    agent: 'Emily Rodriguez',
    listed: '2025-01-12',
    description: 'Contemporary architectural masterpiece in prime Beverly Hills location. Open floor plan with floor-to-ceiling windows, resort-style pool and spa, outdoor kitchen, home automation, and designer finishes throughout. Perfect for entertaining.',
    yearBuilt: 2023,
    parking: 4,
    features: ['Resort Pool', 'Outdoor Kitchen', 'Floor-to-Ceiling Windows', 'Home Automation', 'Designer Finishes', 'Spa', 'Guest House', 'Security System'],
    location: {
      neighborhood: 'Beverly Hills',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90210'
    },
    contactHistory: [
      { date: '2025-01-15', client: 'Thomas Anderson', type: 'Inquiry', notes: 'Interested in viewing next week' },
    ]
  },
  {
    id: 'P004',
    address: '234 Lakeshore Drive, Chicago',
    type: 'Waterfront Condo',
    price: '$2,100,000',
    beds: 3,
    baths: 3,
    sqft: '2,800',
    status: 'Pending',
    agent: 'David Kim',
    listed: '2025-01-08',
    description: 'Elegant waterfront condominium with stunning Lake Michigan views. Features include hardwood floors, updated kitchen with granite counters, spacious master bedroom with lake views, and two parking spaces. Building amenities include doorman, pool, and fitness center.',
    yearBuilt: 2018,
    parking: 2,
    features: ['Lake View', 'Hardwood Floors', 'Granite Counters', 'Doorman', 'Pool', 'Fitness Center', 'Updated Kitchen', 'Balcony'],
    location: {
      neighborhood: 'Gold Coast',
      city: 'Chicago',
      state: 'IL',
      zip: '60611'
    },
    contactHistory: [
      { date: '2025-01-14', client: 'Lisa Thompson', type: 'Closing', notes: 'Scheduled for closing next week' },
      { date: '2025-01-10', client: 'Lisa Thompson', type: 'Offer', notes: 'Accepted offer at $2.05M' },
    ]
  },
  {
    id: 'P005',
    address: '567 Harbor View, San Francisco',
    type: 'Contemporary Home',
    price: '$6,900,000',
    beds: 4,
    baths: 4,
    sqft: '4,500',
    status: 'Available',
    agent: 'Sarah Johnson',
    listed: '2025-01-14',
    description: 'Stunning contemporary home with Golden Gate Bridge and bay views. Features include open concept living, chef\'s kitchen with professional appliances, rooftop deck, home office, and three-car garage. Walking distance to Marina District amenities.',
    yearBuilt: 2021,
    parking: 3,
    features: ['Bay View', 'Rooftop Deck', 'Professional Kitchen', 'Home Office', 'Three-Car Garage', 'Solar Panels', 'Radiant Heating', 'Wine Storage'],
    location: {
      neighborhood: 'Marina District',
      city: 'San Francisco',
      state: 'CA',
      zip: '94123'
    },
    contactHistory: [
      { date: '2025-01-16', client: 'Robert Williams', type: 'Inquiry', notes: 'Requested virtual tour' },
    ]
  },
];

const clients = [
  {
    id: 'C001',
    name: 'Robert Williams',
    email: 'robert.w@email.com',
    phone: '+1 (555) 123-4567',
    budget: '$3M - $5M',
    looking: 'Luxury Villa',
    agent: 'Sarah Johnson',
    status: 'Hot Lead',
  },
  {
    id: 'C002',
    name: 'Jennifer Martinez',
    email: 'jennifer.m@email.com',
    phone: '+1 (555) 234-5678',
    budget: '$10M+',
    looking: 'Penthouse',
    agent: 'Michael Chen',
    status: 'Active',
  },
  {
    id: 'C003',
    name: 'Thomas Anderson',
    email: 'thomas.a@email.com',
    phone: '+1 (555) 345-6789',
    budget: '$2M - $4M',
    looking: 'Waterfront',
    agent: 'Emily Rodriguez',
    status: 'New',
  },
  {
    id: 'C004',
    name: 'Lisa Thompson',
    email: 'lisa.t@email.com',
    phone: '+1 (555) 456-7890',
    budget: '$5M - $8M',
    looking: 'Modern Estate',
    agent: 'David Kim',
    status: 'Hot Lead',
  },
];

const recentActivities = [
  { type: 'viewing', property: 'P001', client: 'Robert Williams', time: '2 hours ago' },
  { type: 'offer', property: 'P002', client: 'Jennifer Martinez', time: '5 hours ago' },
  { type: 'inquiry', property: 'P003', client: 'Thomas Anderson', time: '1 day ago' },
  { type: 'closing', property: 'P004', client: 'Lisa Thompson', time: '2 days ago' },
  { type: 'listing', property: 'P005', client: 'New Property', time: '3 days ago' },
];

type Tab = 'properties' | 'clients' | 'activity';

export default function RealEstateCRM() {
  const [activeTab, setActiveTab] = useState<Tab>('properties');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Property Detail View Component
  const PropertyDetailView = ({ property }: { property: Property }) => (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Detail Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedProperty(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{property.address}</h2>
            <p className="text-sm text-gray-600">{property.type} • Listed {property.listed}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            property.status === 'Available' ? 'bg-green-100 text-green-700' :
            property.status === 'Under Contract' ? 'bg-yellow-100 text-yellow-700' :
            'bg-orange-100 text-orange-700'
          }`}>
            {property.status}
          </span>
        </div>
      </div>

      {/* Detail Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          {/* Price & Key Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-bold text-gray-900 mb-6">{property.price}</div>
            <div className="grid grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Bed className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{property.beds}</p>
                  <p className="text-sm text-gray-600">Bedrooms</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Bath className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{property.baths}</p>
                  <p className="text-sm text-gray-600">Bathrooms</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Maximize className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{property.sqft}</p>
                  <p className="text-sm text-gray-600">Sq Ft</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Car className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{property.parking}</p>
                  <p className="text-sm text-gray-600">Parking</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{property.description}</p>
          </div>

          {/* Property Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{property.location?.neighborhood}, {property.location?.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Year Built</p>
                  <p className="font-medium text-gray-900">{property.yearBuilt}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Home className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Property Type</p>
                  <p className="font-medium text-gray-900">{property.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Listing Agent</p>
                  <p className="font-medium text-gray-900">{property.agent}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Features & Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              {property.features?.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-700">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact History */}
          {property.contactHistory && property.contactHistory.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {property.contactHistory.map((contact, idx) => (
                  <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-lg ${
                        contact.type === 'Viewing' ? 'bg-blue-100' :
                        contact.type === 'Offer' ? 'bg-green-100' :
                        contact.type === 'Inquiry' ? 'bg-yellow-100' :
                        'bg-purple-100'
                      }`}>
                        {contact.type === 'Viewing' && <Calendar className="w-5 h-5 text-blue-600" />}
                        {contact.type === 'Offer' && <DollarSign className="w-5 h-5 text-green-600" />}
                        {contact.type === 'Inquiry' && <Mail className="w-5 h-5 text-yellow-600" />}
                        {contact.type === 'Closing' && <TrendingUp className="w-5 h-5 text-purple-600" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-gray-900">{contact.type}</p>
                        <p className="text-sm text-gray-500">{contact.date}</p>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{contact.client}</p>
                      <p className="text-sm text-gray-700">{contact.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
              Schedule Viewing
            </button>
            <button className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
              Contact Agent
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // If a property is selected, show detail view
  if (selectedProperty) {
    return <PropertyDetailView property={selectedProperty} />;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* CRM Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Premier Properties CRM</h2>
              <p className="text-sm text-gray-600">Luxury Real Estate Management</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
              + Add Property
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 ${stat.color} rounded-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium text-green-600">{stat.change}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 flex-shrink-0">
        <div className="flex gap-6">
          {(['properties', 'clients', 'activity'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-2 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {activeTab === 'properties' && (
          <div className="space-y-3">
            {properties.map((property) => (
              <div
                key={property.id}
                onClick={() => setSelectedProperty(property)}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-indigo-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Home className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{property.address}</h3>
                        <p className="text-sm text-gray-600">{property.type}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="font-semibold text-gray-900">{property.price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Beds/Baths</p>
                        <p className="font-semibold text-gray-900">{property.beds} / {property.baths}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Sq Ft</p>
                        <p className="font-semibold text-gray-900">{property.sqft}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Agent</p>
                        <p className="font-semibold text-gray-900">{property.agent}</p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      property.status === 'Available' ? 'bg-green-100 text-green-700' :
                      property.status === 'Under Contract' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {property.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-2">Listed: {property.listed}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="space-y-3">
            {clients.map((client) => (
              <div key={client.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{client.name}</h3>
                        <p className="text-sm text-gray-600">{client.looking}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-700">{client.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-700">{client.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <p className="text-sm text-gray-700">{client.budget}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Agent: <span className="font-medium text-gray-900">{client.agent}</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      client.status === 'Hot Lead' ? 'bg-red-100 text-red-700' :
                      client.status === 'Active' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {client.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-2">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'viewing' ? 'bg-blue-100' :
                  activity.type === 'offer' ? 'bg-green-100' :
                  activity.type === 'inquiry' ? 'bg-yellow-100' :
                  activity.type === 'closing' ? 'bg-purple-100' :
                  'bg-gray-100'
                }`}>
                  {activity.type === 'viewing' && <Calendar className="w-5 h-5 text-blue-600" />}
                  {activity.type === 'offer' && <DollarSign className="w-5 h-5 text-green-600" />}
                  {activity.type === 'inquiry' && <Mail className="w-5 h-5 text-yellow-600" />}
                  {activity.type === 'closing' && <TrendingUp className="w-5 h-5 text-purple-600" />}
                  {activity.type === 'listing' && <Home className="w-5 h-5 text-gray-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 capitalize">{activity.type}</p>
                  <p className="text-sm text-gray-600">
                    {activity.property} - {activity.client}
                  </p>
                </div>
                <div className="text-sm text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
