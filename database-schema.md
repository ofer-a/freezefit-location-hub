// FreezeFit Location Hub Database Schema
// dbdiagram.io compatible version

// Custom types (represented as comments since dbdiagram.io doesn't support ENUMs)
// user_role: 'customer', 'provider'
// gender_type: 'male', 'female', 'other'  
// appointment_status: 'pending', 'confirmed', 'completed', 'cancelled'

Table profiles {
  id uuid [pk, default: `gen_random_uuid()`]
  email varchar(255) [unique, not null]
  full_name varchar(255)
  role varchar(20) [default: 'customer']
  age integer
  gender varchar(10)
  address text
  image_url text
  phone varchar(20)
  password_hash varchar(255)
  is_active boolean [default: true]
  deactivated_at timestamp
  image_data bytea
  image_mime_type varchar(50)
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table institutes {
  id uuid [pk, default: `gen_random_uuid()`]
  owner_id uuid [ref: > profiles.id]
  institute_name varchar(255) [not null]
  address text
  service_name varchar(255)
  image_url text
  image_data bytea
  image_mime_type varchar(50)
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table therapists {
  id uuid [pk, default: `gen_random_uuid()`]
  institute_id uuid [ref: > institutes.id]
  name varchar(255) [not null]
  experience text
  certification text
  additional_certification text
  bio text
  image_url text
  is_active boolean [default: true]
  deactivated_at timestamp
  image_data bytea
  image_mime_type varchar(50)
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table services {
  id uuid [pk, default: `gen_random_uuid()`]
  institute_id uuid [ref: > institutes.id]
  name varchar(255) [not null]
  description text
  price decimal(10,2) [not null]
  duration varchar(50)
  type varchar(20) [default: 'service']
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table business_hours {
  id uuid [pk, default: `gen_random_uuid()`]
  institute_id uuid [ref: > institutes.id]
  day_of_week integer [not null]
  open_time time
  close_time time
  is_open boolean [default: true]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table appointments {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [ref: > profiles.id]
  institute_id uuid [ref: > institutes.id]
  service_name varchar(255) [not null]
  appointment_date date [not null]
  appointment_time time [not null]
  status varchar(20) [default: 'pending']
  price decimal(10,2)
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table reviews {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [ref: > profiles.id]
  institute_id uuid [ref: > institutes.id]
  rating integer [not null]
  content text [not null]
  review_date date
  created_at timestamp [default: `now()`]
}

Table messages {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [ref: > profiles.id]
  institute_id uuid [ref: > institutes.id]
  sender_type varchar(20) [not null]
  message_type varchar(30) [not null]
  subject text [not null]
  content text [not null]
  is_read boolean [default: false]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table gallery_images {
  id uuid [pk, default: `gen_random_uuid()`]
  institute_id uuid [ref: > institutes.id]
  image_url text [not null]
  category varchar(100) [not null]
  image_data bytea
  image_mime_type varchar(50)
  created_at timestamp [default: `now()`]
}

Table workshops {
  id uuid [pk, default: `gen_random_uuid()`]
  institute_id uuid [ref: > institutes.id]
  title varchar(255) [not null]
  description text
  workshop_date date [not null]
  workshop_time time [not null]
  duration integer [not null]
  price decimal(10,2) [not null]
  max_participants integer [default: 20]
  current_participants integer [default: 0]
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table user_profiles_extended {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [ref: > profiles.id, unique]
  phone varchar(20)
  address text
  emergency_contact_name varchar(255)
  emergency_contact_phone varchar(20)
  medical_conditions text
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table institute_coordinates {
  id uuid [pk, default: `gen_random_uuid()`]
  institute_id uuid [ref: > institutes.id, unique]
  latitude decimal(10,8) [not null]
  longitude decimal(11,8) [not null]
  address_verified boolean [default: false]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table institute_ratings {
  id uuid [pk, default: `gen_random_uuid()`]
  institute_id uuid [ref: > institutes.id, unique]
  average_rating decimal(2,1) [default: 0]
  total_reviews integer [default: 0]
  last_calculated timestamp [default: `now()`]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table activities {
  id uuid [pk, default: `gen_random_uuid()`]
  institute_id uuid [ref: > institutes.id]
  user_id uuid [ref: > profiles.id]
  activity_type varchar(50) [not null]
  title varchar(255) [not null]
  description text
  reference_id uuid
  metadata jsonb
  created_at timestamp [default: `now()`]
}

Table customer_loyalty {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [ref: > profiles.id, unique]
  total_points integer [default: 0]
  current_points integer [default: 0]
  loyalty_level varchar(50) [default: 'ברונזה']
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table loyalty_transactions {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [ref: > profiles.id]
  transaction_type varchar(20) [not null]
  points integer [not null]
  source varchar(100) [not null]
  reference_id uuid
  description text
  created_at timestamp [default: `now()`]
}

Table loyalty_gifts {
  id uuid [pk, default: `gen_random_uuid()`]
  name varchar(255) [not null]
  description text
  points_cost integer [not null]
  image_url text
  is_active boolean [default: true]
  stock_quantity integer
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}

Table gift_redemptions {
  id uuid [pk, default: `gen_random_uuid()`]
  user_id uuid [ref: > profiles.id]
  gift_id uuid [ref: > loyalty_gifts.id]
  points_spent integer [not null]
  status varchar(20) [default: 'pending']
  redeemed_at timestamp [default: `now()`]
  fulfilled_at timestamp
  notes text
}

Table newsletter_subscribers {
  id uuid [pk, default: `gen_random_uuid()`]
  email varchar(255) [unique, not null]
  name varchar(255)
  source varchar(100) [default: 'website']
  subscribed_at timestamp [default: `now()`]
  unsubscribed_at timestamp
  is_active boolean [default: true]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
}