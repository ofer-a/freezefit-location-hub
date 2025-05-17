
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
  },
  {
    id: 4,
    name: 'קריו ירושלים',
    address: 'דרך יפו 97, ירושלים',
    distance: 60.5,
    rating: 4.9,
    reviewCount: 87,
    therapists: [
      { id: 6, name: 'יעקב לוי', specialty: 'כאבי שרירים', experience: 12, image: '/placeholder.svg' },
      { id: 7, name: 'רחל אהרוני', specialty: 'ספורטאים', experience: 9, image: '/placeholder.svg' }
    ],
    hours: 'א-ה: 8:00-19:00, ו: 9:00-14:00',
    coordinates: { lat: 31.7857, lng: 35.2007 }
  },
  {
    id: 5,
    name: 'חיפה קריותרפי',
    address: 'שדרות הנשיא 124, חיפה',
    distance: 90.2,
    rating: 4.5,
    reviewCount: 62,
    therapists: [
      { id: 8, name: 'דנה כרמלי', specialty: 'שיקום', experience: 8, image: '/placeholder.svg' },
      { id: 9, name: 'עומר פרץ', specialty: 'טיפול מקצועי', experience: 5, image: '/placeholder.svg' }
    ],
    hours: 'א-ו: 9:00-20:00',
    coordinates: { lat: 32.8184, lng: 34.9885 }
  },
  {
    id: 6,
    name: 'צפון קריו',
    address: 'רחוב הגליל 45, כרמיאל',
    distance: 110.7,
    rating: 4.3,
    reviewCount: 41,
    therapists: [
      { id: 10, name: 'יוסי מור', specialty: 'קריותרפיה מתקדמת', experience: 7, image: '/placeholder.svg' }
    ],
    hours: 'א-ה: 10:00-19:00, ו: 9:00-13:00',
    coordinates: { lat: 32.9186, lng: 35.2939 }
  }
];

// Mock city/address suggestions
export const mockSuggestions: string[] = [
  'תל אביב, אבן גבירול 30',
  'תל אביב, הרצל 15',
  'תל אביב, מנחם בגין 132',
  'ירושלים, יפו 97',
  'חיפה, הנשיא 124',
  'כרמיאל, הגליל 45',
  'רמת גן, ביאליק 76',
  'באר שבע, שדרות רגר 31'
];
