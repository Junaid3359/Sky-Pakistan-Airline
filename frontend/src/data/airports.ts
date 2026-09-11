export type Airport = {
  code: string;
  city: string;
  name: string;
};

export const airports: Airport[] = [
  { code: 'LHE', city: 'Lahore', name: 'Allama Iqbal International Airport' },
  { code: 'ISB', city: 'Islamabad', name: 'Islamabad International Airport' },
  { code: 'KHI', city: 'Karachi', name: 'Jinnah International Airport' },
  { code: 'MUX', city: 'Multan', name: 'Multan International Airport' },
  { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport' },
  { code: 'LHR', city: 'London', name: 'Heathrow Airport' },
  { code: 'IST', city: 'Istanbul', name: 'Istanbul Airport' },
  { code: 'KUL', city: 'Kuala Lumpur', name: 'Kuala Lumpur International Airport' },
  { code: 'YYZ', city: 'Toronto', name: 'Toronto Pearson International Airport' },
  { code: 'MLE', city: 'Male', name: 'Velana International Airport' },
  { code: 'DOH', city: 'Doha', name: 'Hamad International Airport' },
  { code: 'JED', city: 'Jeddah', name: 'King Abdulaziz International Airport' },
  { code: 'RUH', city: 'Riyadh', name: 'King Khalid International Airport' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Airport' },
  { code: 'SIN', city: 'Singapore', name: 'Changi Airport' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International Airport' },
  { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi International Airport' },
  { code: 'KTM', city: 'Kathmandu', name: 'Tribhuvan International Airport' },
  { code: 'BJS', city: 'Beijing', name: 'Beijing Capital International Airport' },
  { code: 'PEK', city: 'Beijing', name: 'Beijing Capital International Airport' },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International Airport' },
  { code: 'NRT', city: 'Tokyo', name: 'Narita International Airport' },
  { code: 'ICN', city: 'Seoul', name: 'Incheon International Airport' },
  { code: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith Airport' },
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport' },
  { code: 'IAD', city: 'Washington', name: 'Dulles International Airport' },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport' },
  { code: 'FCO', city: 'Rome', name: 'Leonardo da Vinci International Airport' },
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport' },
  { code: 'AMS', city: 'Amsterdam', name: 'Schiphol Airport' },
  { code: 'MAN', city: 'Manchester', name: 'Manchester Airport' },
  { code: 'JNB', city: 'Johannesburg', name: 'O.R. Tambo International Airport' },
  { code: 'CAI', city: 'Cairo', name: 'Cairo International Airport' },
  { code: 'BOS', city: 'Boston', name: 'Logan International Airport' }
];

const airportByCode = new Map(airports.map((airport) => [airport.code, airport]));

export function getAirport(code?: string): Airport {
  const normalized = code?.toUpperCase() || '';
  return airportByCode.get(normalized) || { code: normalized || '---', city: normalized || 'Unknown', name: 'Airport' };
}

export function formatAirport(code?: string): string {
  const airport = getAirport(code);
  return `${airport.city} - ${airport.name} (${airport.code})`;
}
