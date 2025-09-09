-- Create missing database tables to replace all mock data

-- Create workshops table (for StoreManagement)
CREATE TABLE IF NOT EXISTS workshops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    workshop_date DATE NOT NULL,
    workshop_time TIME NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    price DECIMAL(10,2) NOT NULL,
    max_participants INTEGER DEFAULT 20,
    current_participants INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles_extended table (for additional user data like phone, address)
CREATE TABLE IF NOT EXISTS user_profiles_extended (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    medical_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create institute_coordinates table (for map locations)
CREATE TABLE IF NOT EXISTS institute_coordinates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE UNIQUE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create institute_ratings table (for calculated ratings from reviews)
CREATE TABLE IF NOT EXISTS institute_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE UNIQUE,
    average_rating DECIMAL(2,1) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table (for recent activities in dashboard)
CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institute_id UUID REFERENCES institutes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'appointment', 'review', 'registration', 'update'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reference_id UUID, -- ID of related appointment, review, etc.
    metadata JSONB, -- Additional data in JSON format
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workshops_institute_id ON workshops(institute_id);
CREATE INDEX IF NOT EXISTS idx_workshops_date ON workshops(workshop_date);
CREATE INDEX IF NOT EXISTS idx_user_profiles_extended_user_id ON user_profiles_extended(user_id);
CREATE INDEX IF NOT EXISTS idx_institute_coordinates_institute_id ON institute_coordinates(institute_id);
CREATE INDEX IF NOT EXISTS idx_institute_ratings_institute_id ON institute_ratings(institute_id);
CREATE INDEX IF NOT EXISTS idx_activities_institute_id ON activities(institute_id);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at);

-- Create triggers for updated_at
CREATE TRIGGER update_workshops_updated_at 
    BEFORE UPDATE ON workshops 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_extended_updated_at 
    BEFORE UPDATE ON user_profiles_extended 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institute_coordinates_updated_at 
    BEFORE UPDATE ON institute_coordinates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_institute_ratings_updated_at 
    BEFORE UPDATE ON institute_ratings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update institute ratings when reviews change
CREATE OR REPLACE FUNCTION update_institute_rating(p_institute_id UUID)
RETURNS VOID AS $$
DECLARE
    avg_rating DECIMAL(2,1);
    total_count INTEGER;
BEGIN
    -- Calculate average rating and total count
    SELECT 
        ROUND(AVG(rating::DECIMAL), 1),
        COUNT(*)
    INTO avg_rating, total_count
    FROM reviews 
    WHERE institute_id = p_institute_id;
    
    -- Update or insert rating record
    INSERT INTO institute_ratings (institute_id, average_rating, total_reviews, last_calculated)
    VALUES (p_institute_id, COALESCE(avg_rating, 0), COALESCE(total_count, 0), NOW())
    ON CONFLICT (institute_id) 
    DO UPDATE SET 
        average_rating = COALESCE(avg_rating, 0),
        total_reviews = COALESCE(total_count, 0),
        last_calculated = NOW(),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to add activity log
CREATE OR REPLACE FUNCTION add_activity(
    p_institute_id UUID,
    p_user_id UUID,
    p_activity_type VARCHAR(50),
    p_title VARCHAR(255),
    p_description TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO activities (institute_id, user_id, activity_type, title, description, reference_id, metadata)
    VALUES (p_institute_id, p_user_id, p_activity_type, p_title, p_description, p_reference_id, p_metadata);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ratings when reviews are added/updated/deleted
CREATE OR REPLACE FUNCTION trigger_update_institute_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM update_institute_rating(OLD.institute_id);
        RETURN OLD;
    ELSE
        PERFORM update_institute_rating(NEW.institute_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_update_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_institute_rating();

-- Insert sample workshops data
INSERT INTO workshops (institute_id, title, description, workshop_date, workshop_time, duration, price, max_participants, current_participants) VALUES
-- מרכז קריוסטיים workshops
('bbbbbbbb-1111-1111-1111-111111111111', 'סדנת התאוששות לספורטאים', 'סדנה מעשית לספורטאים הרוצים ללמוד טכניקות התאוששות מתקדמות', '2024-12-20', '18:00', 90, 200, 15, 8),
('bbbbbbbb-1111-1111-1111-111111111111', 'יסודות קריותרפיה', 'סדנת מבוא לשיטות טיפול בקור וההשפעות הבריאותיות', '2024-12-25', '17:30', 120, 180, 20, 12),
-- קריו פלוס workshops  
('bbbbbbbb-2222-2222-2222-222222222222', 'קריותרפיה לכאבי גב', 'טכניקות מתקדמות לטיפול בכאבי גב כרוניים', '2024-12-22', '19:00', 75, 160, 12, 6),
('bbbbbbbb-2222-2222-2222-222222222222', 'התאוששות מהירה', 'שיטות להתאוששות מהירה לאחר פעילות גופנית', '2024-12-28', '16:00', 60, 140, 18, 9),
-- אייס פיט workshops
('bbbbbbbb-3333-3333-3333-333333333333', 'קריותרפיה לספורטאי עילית', 'סדנה מתקדמת לספורטאי ברמה הגבוהה ביותר', '2024-12-30', '20:00', 105, 300, 10, 4);

-- Insert sample coordinates for institutes (around Tel Aviv area)
INSERT INTO institute_coordinates (institute_id, latitude, longitude, address_verified) VALUES
('bbbbbbbb-1111-1111-1111-111111111111', 32.0853, 34.7818, true), -- מרכז קריוסטיים - Tel Aviv center
('bbbbbbbb-2222-2222-2222-222222222222', 32.0890, 34.7850, true), -- קריו פלוס - Near Sarona
('bbbbbbbb-3333-3333-3333-333333333333', 32.0820, 34.7750, true), -- אייס פיט - Ramat Aviv area
('bbbbbbbb-4444-4444-4444-444444444444', 31.7683, 35.2137, true), -- קריו ירושלים - Jerusalem
('bbbbbbbb-5555-5555-5555-555555555555', 32.7940, 34.9896, true), -- חיפה קריותרפי - Haifa
('bbbbbbbb-6666-6666-6666-666666666666', 32.9242, 35.0818, true); -- צפון קריו - Karmiel

-- Insert extended profile data for existing users
INSERT INTO user_profiles_extended (user_id, phone, address) VALUES
('11111111-1111-1111-1111-111111111111', '050-1234567', 'רחוב האלון 5, תל אביב'), -- Avi Cohen
('22222222-2222-2222-2222-222222222222', '050-2345678', 'שדרות רוטשילד 15, תל אביב'), -- Sara Levi
('33333333-3333-3333-3333-333333333333', '050-3456789', 'רחוב בילו 22, רמת גן'), -- Dan Golan
('44444444-4444-4444-4444-444444444444', '050-4567890', 'רחוב הנביאים 8, תל אביב'), -- Yossi Cohen
('55555555-5555-5555-5555-555555555555', '050-5678901', 'רחוב הרצל 45, הרצליה'); -- Rachel David

-- Calculate and insert initial institute ratings
SELECT update_institute_rating(id) FROM institutes;

-- Insert sample activities for recent dashboard activity
INSERT INTO activities (institute_id, user_id, activity_type, title, description, reference_id) VALUES
('bbbbbbbb-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'appointment', 'תור חדש מאבי כהן', 'תור לטיפול שיקום', NULL),
('bbbbbbbb-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'review', 'ביקורת חדשה התקבלה', 'ביקורת חדשה נכתבה (5 כוכבים)', NULL),
('bbbbbbbb-1111-1111-1111-111111111111', NULL, 'update', 'עדכון מחירון', 'עדכון מחירי הטיפולים', NULL),
('bbbbbbbb-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'registration', 'לקוח חדש נרשם', 'דן גולן נרשם לאתר', NULL),
('bbbbbbbb-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'appointment', 'תור בוטל', 'ביטול תור ליוסי כהן', NULL);
