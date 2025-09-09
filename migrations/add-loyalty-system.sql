-- Create loyalty system tables for customer club

-- Create customer_loyalty table to track user points and levels
CREATE TABLE IF NOT EXISTS customer_loyalty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    current_points INTEGER DEFAULT 0, -- Available points to spend
    loyalty_level VARCHAR(50) DEFAULT 'ברונזה',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create loyalty_transactions table to track point earning/spending
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earned', 'spent')),
    points INTEGER NOT NULL,
    source VARCHAR(100) NOT NULL, -- 'appointment', 'review', 'gift_redemption', etc.
    reference_id UUID, -- ID of appointment, review, etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create loyalty_gifts table for available rewards
CREATE TABLE IF NOT EXISTS loyalty_gifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    points_cost INTEGER NOT NULL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT NULL, -- NULL = unlimited
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gift_redemptions table to track redeemed gifts
CREATE TABLE IF NOT EXISTS gift_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    gift_id UUID REFERENCES loyalty_gifts(id),
    points_spent INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fulfilled_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_loyalty_user_id ON customer_loyalty(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON loyalty_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_gift_redemptions_user_id ON gift_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_gift_redemptions_status ON gift_redemptions(status);

-- Create triggers for updated_at
CREATE TRIGGER update_customer_loyalty_updated_at 
    BEFORE UPDATE ON customer_loyalty 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_gifts_updated_at 
    BEFORE UPDATE ON loyalty_gifts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default loyalty gifts
INSERT INTO loyalty_gifts (name, description, points_cost, image_url) VALUES
('טיפול מתנה', 'טיפול קריותרפיה חינם במרכז לבחירתך', 200, '/lovable-uploads/a1b8497e-3684-42ea-9ad8-69ff9ff062d1.png'),
('חולצת מותג', 'חולצת FreezeFit עם לוגו המותג', 350, '/lovable-uploads/e8aa38a8-789a-4462-813f-069777b952bb.png'),
('סט אביזרים', 'סט אביזרי קריותרפיה ביתי', 500, '/lovable-uploads/bde00d1e-667f-47df-98d8-9c7c4fb4dbda.png'),
('הנחה 20%', 'הנחה של 20% על הטיפול הבא', 150, '/lovable-uploads/d6f7ab60-772f-434d-9ac1-f607562f7b9f.png'),
('בקבוק מים מותג', 'בקבוק מים עם לוגו FreezeFit', 100, '/lovable-uploads/f6f02c9c-d28f-4c20-a10e-4d5c4d9f9be3.png');

-- Function to calculate loyalty level based on total points
CREATE OR REPLACE FUNCTION calculate_loyalty_level(total_points INTEGER)
RETURNS VARCHAR(50) AS $$
BEGIN
    CASE 
        WHEN total_points >= 2000 THEN RETURN 'יהלום';
        WHEN total_points >= 1000 THEN RETURN 'פלטינה';
        WHEN total_points >= 500 THEN RETURN 'זהב';
        WHEN total_points >= 200 THEN RETURN 'כסף';
        ELSE RETURN 'ברונזה';
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to get next level points requirement
CREATE OR REPLACE FUNCTION get_next_level_points(current_level VARCHAR(50))
RETURNS INTEGER AS $$
BEGIN
    CASE current_level
        WHEN 'ברונזה' THEN RETURN 200;
        WHEN 'כסף' THEN RETURN 500;
        WHEN 'זהב' THEN RETURN 1000;
        WHEN 'פלטינה' THEN RETURN 2000;
        WHEN 'יהלום' THEN RETURN 2000; -- Max level
        ELSE RETURN 200;
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to add points to user
CREATE OR REPLACE FUNCTION add_loyalty_points(
    p_user_id UUID,
    p_points INTEGER,
    p_source VARCHAR(100),
    p_reference_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
    current_total INTEGER;
    new_level VARCHAR(50);
BEGIN
    -- Insert transaction record
    INSERT INTO loyalty_transactions (user_id, transaction_type, points, source, reference_id, description)
    VALUES (p_user_id, 'earned', p_points, p_source, p_reference_id, p_description);
    
    -- Update or create loyalty record
    INSERT INTO customer_loyalty (user_id, total_points, current_points)
    VALUES (p_user_id, p_points, p_points)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        total_points = customer_loyalty.total_points + p_points,
        current_points = customer_loyalty.current_points + p_points,
        updated_at = NOW();
    
    -- Update loyalty level based on total points
    SELECT total_points INTO current_total
    FROM customer_loyalty 
    WHERE user_id = p_user_id;
    
    new_level := calculate_loyalty_level(current_total);
    
    UPDATE customer_loyalty 
    SET loyalty_level = new_level
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to spend points
CREATE OR REPLACE FUNCTION spend_loyalty_points(
    p_user_id UUID,
    p_points INTEGER,
    p_source VARCHAR(100),
    p_reference_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    available_points INTEGER;
BEGIN
    -- Check if user has enough points
    SELECT current_points INTO available_points
    FROM customer_loyalty 
    WHERE user_id = p_user_id;
    
    IF available_points IS NULL OR available_points < p_points THEN
        RETURN FALSE;
    END IF;
    
    -- Insert transaction record
    INSERT INTO loyalty_transactions (user_id, transaction_type, points, source, reference_id, description)
    VALUES (p_user_id, 'spent', p_points, p_source, p_reference_id, p_description);
    
    -- Deduct points
    UPDATE customer_loyalty 
    SET 
        current_points = current_points - p_points,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create some sample loyalty data for existing users
INSERT INTO customer_loyalty (user_id, total_points, current_points, loyalty_level)
SELECT 
    id,
    CASE 
        WHEN id = '11111111-1111-1111-1111-111111111111' THEN 850 -- Avi Cohen
        WHEN id = '22222222-2222-2222-2222-222222222222' THEN 1200 -- Sara Levi  
        WHEN id = '33333333-3333-3333-3333-333333333333' THEN 350 -- Dan Golan
        WHEN id = '44444444-4444-4444-4444-444444444444' THEN 750 -- Yossi Cohen
        WHEN id = '55555555-5555-5555-5555-555555555555' THEN 450 -- Rachel David
        ELSE 100
    END as total_points,
    CASE 
        WHEN id = '11111111-1111-1111-1111-111111111111' THEN 850
        WHEN id = '22222222-2222-2222-2222-222222222222' THEN 1200
        WHEN id = '33333333-3333-3333-3333-333333333333' THEN 350
        WHEN id = '44444444-4444-4444-4444-444444444444' THEN 750
        WHEN id = '55555555-5555-5555-5555-555555555555' THEN 450
        ELSE 100
    END as current_points,
    calculate_loyalty_level(
        CASE 
            WHEN id = '11111111-1111-1111-1111-111111111111' THEN 850
            WHEN id = '22222222-2222-2222-2222-222222222222' THEN 1200
            WHEN id = '33333333-3333-3333-3333-333333333333' THEN 350
            WHEN id = '44444444-4444-4444-4444-444444444444' THEN 750
            WHEN id = '55555555-5555-5555-5555-555555555555' THEN 450
            ELSE 100
        END
    ) as loyalty_level
FROM profiles 
WHERE role = 'customer'
ON CONFLICT (user_id) DO NOTHING;

-- Add sample transactions for points earning
INSERT INTO loyalty_transactions (user_id, transaction_type, points, source, description) VALUES
('11111111-1111-1111-1111-111111111111', 'earned', 50, 'appointment', 'נקודות על השלמת טיפול'),
('11111111-1111-1111-1111-111111111111', 'earned', 50, 'appointment', 'נקודות על השלמת טיפול'),
('11111111-1111-1111-1111-111111111111', 'earned', 20, 'review', 'נקודות על כתיבת ביקורת'),
('22222222-2222-2222-2222-222222222222', 'earned', 50, 'appointment', 'נקודות על השלמת טיפול'),
('22222222-2222-2222-2222-222222222222', 'earned', 50, 'appointment', 'נקודות על השלמת טיפול'),
('33333333-3333-3333-3333-333333333333', 'earned', 50, 'appointment', 'נקודות על השלמת טיפול');
