
export interface Therapist {
  id: number;
  name: string;
  specialty: string;
  experience: number;
  image: string;
}

export interface Institute {
  id: number;
  name: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  therapists: Therapist[];
  hours: string;
  coordinates: { lat: number; lng: number };
}

// Mock data for institutes
export const mockInstitutes: Institute[] = [
  {
    id: 1,
    name: 'מרכז קריוסטיים',
    address: 'רחוב הרצל 15, תל אביב',
    distance: 2.3,
    rating: 4.8,
    reviewCount: 124,
    therapists: [
      { id: 1, name: 'דני כהן', specialty: 'ספורטאים', experience: 5, image: '/placeholder.svg' },
      { id: 2, name: 'מיכל לוי', specialty: 'שיקום', experience: 8, image: '/placeholder.svg' }
    ],
    hours: 'א-ה: 8:00-20:00, ו: 8:00-14:00',
    coordinates: { lat: 32.0853, lng: 34.7818 }
  },
  {
    id: 2,
    name: 'קריו פלוס',
    address: 'דרך מנחם בגין 132, תל אביב',
    distance: 3.6,
    rating: 4.6,
    reviewCount: 89,
    therapists: [
      { id: 3, name: 'רונית דוד', specialty: 'קריותרפיה', experience: 10, image: '/placeholder.svg' },
    ],
    hours: 'א-ה: 7:00-21:00, ו: 8:00-13:00, ש: 10:00-14:00',
    coordinates: { lat: 32.0733, lng: 34.7913 }
  },
  {
    id: 3,
    name: 'אייס פיט',
    address: 'רחוב אבן גבירול 30, תל אביב',
    distance: 5.1,
    rating: 4.7,
    reviewCount: 56,
    therapists: [
      { id: 4, name: 'אלון ברק', specialty: 'ספורטאי עילית', experience: 7, image: '/placeholder.svg' },
      { id: 5, name: 'נועה פרץ', specialty: 'שחזור שריר', experience: 6, image: '/placeholder.svg' }
    ],
    hours: 'א-ה: 9:00-22:00, ו-ש: 10:00-15:00',
    coordinates: { lat: 32.0873, lng: 34.7733 }
  }
];

// Mock city/address suggestions
export const mockSuggestions: string[] = [
  'תל אביב, אבן גבירול 30',
  'תל אביב, הרצל 15',
  'תל אביב, מנחם בגין 132',
  'ירושלים, יפו 97',
  'חיפה, הנמל 11',
  'רמת גן, ביאליק 76'
];
