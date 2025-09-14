// Netlify Function for loyalty system API
import { query, createResponse, handleCORS } from './db-client.js';

export const handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCORS();
  }

  try {
    const { httpMethod, path, pathParameters } = event;
    
    switch (httpMethod) {
      case 'GET':
        if (path.includes('/user/')) {
          // Get user loyalty data: /loyalty/user/{userId}
          const userId = path.split('/user/')[1];
          return await getUserLoyalty(userId);
        } else if (path.includes('/gifts')) {
          // Get available gifts: /loyalty/gifts
          return await getAvailableGifts();
        } else if (path.includes('/transactions/')) {
          // Get user transactions: /loyalty/transactions/{userId}
          const userId = path.split('/transactions/')[1];
          return await getUserTransactions(userId);
        } else {
          return createResponse(400, null, 'Invalid endpoint');
        }

      case 'POST':
        if (path.includes('/add-points')) {
          // Add points: /loyalty/add-points
          const body = JSON.parse(event.body);
          return await addPoints(body);
        } else if (path.includes('/redeem-gift')) {
          // Redeem gift: /loyalty/redeem-gift
          const body = JSON.parse(event.body);
          return await redeemGift(body);
        } else {
          return createResponse(400, null, 'Invalid endpoint');
        }

      default:
        return createResponse(405, null, 'Method not allowed');
    }

  } catch (error) {
    console.error('Loyalty API error:', error);
    return createResponse(500, null, error.message);
  }
};

// Get user loyalty data with calculated benefits
async function getUserLoyalty(userId) {
  try {
    const loyaltyResult = await query(
      `SELECT 
        cl.*,
        get_next_level_points(cl.loyalty_level) as next_level_points
       FROM customer_loyalty cl 
       WHERE cl.user_id = $1`,
      [userId]
    );

    if (loyaltyResult.rows.length === 0) {
      // Create new loyalty record for user
      await query(
        `INSERT INTO customer_loyalty (user_id) VALUES ($1)`,
        [userId]
      );
      
      // Return default data
      return createResponse(200, {
        total_points: 0,
        current_points: 0,
        loyalty_level: 'ברונזה',
        next_level_points: 200,
        benefits: getBenefitsForLevel('ברונזה')
      });
    }

    const loyalty = loyaltyResult.rows[0];
    
    return createResponse(200, {
      total_points: loyalty.total_points,
      current_points: loyalty.current_points,
      loyalty_level: loyalty.loyalty_level,
      next_level_points: loyalty.next_level_points,
      benefits: getBenefitsForLevel(loyalty.loyalty_level)
    });

  } catch (error) {
    console.error('Error getting user loyalty:', error);
    return createResponse(500, null, 'Failed to get loyalty data');
  }
}

// Get available gifts
async function getAvailableGifts() {
  try {
    const result = await query(
      `SELECT * FROM loyalty_gifts WHERE is_active = true ORDER BY points_cost ASC`
    );

    return createResponse(200, result.rows);
  } catch (error) {
    console.error('Error getting gifts:', error);
    return createResponse(500, null, 'Failed to get gifts');
  }
}

// Get user transaction history
async function getUserTransactions(userId) {
  try {
    const result = await query(
      `SELECT * FROM loyalty_transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [userId]
    );

    return createResponse(200, result.rows);
  } catch (error) {
    console.error('Error getting transactions:', error);
    return createResponse(500, null, 'Failed to get transactions');
  }
}

// Add points to user account
async function addPoints(body) {
  const { user_id, points, source, reference_id, description } = body;
  
  if (!user_id || !points || !source) {
    return createResponse(400, null, 'Missing required fields');
  }

  try {
    // First try the stored procedure
    try {
      await query(
        `SELECT add_loyalty_points($1, $2, $3, $4, $5)`,
        [user_id, points, source, reference_id || null, description || null]
      );
    } catch (functionError) {
      console.log('Stored procedure not available, using manual implementation');
      
      // Manual implementation if stored procedure doesn't exist
      // Insert transaction record
      await query(
        `INSERT INTO loyalty_transactions (user_id, transaction_type, points, source, reference_id, description)
         VALUES ($1, 'earned', $2, $3, $4, $5)`,
        [user_id, points, source, reference_id || null, description || null]
      );
      
      // Update or create loyalty record
      await query(
        `INSERT INTO customer_loyalty (user_id, total_points, current_points)
         VALUES ($1, $2, $2)
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           total_points = customer_loyalty.total_points + $2,
           current_points = customer_loyalty.current_points + $2,
           updated_at = NOW()`,
        [user_id, points]
      );
      
      // Update loyalty level based on total points
      const loyaltyResult = await query(
        `SELECT total_points FROM customer_loyalty WHERE user_id = $1`,
        [user_id]
      );
      
      if (loyaltyResult.rows.length > 0) {
        const totalPoints = loyaltyResult.rows[0].total_points;
        let newLevel = 'ברונזה';
        if (totalPoints >= 2000) newLevel = 'יהלום';
        else if (totalPoints >= 1000) newLevel = 'פלטינה';
        else if (totalPoints >= 500) newLevel = 'זהב';
        else if (totalPoints >= 200) newLevel = 'כסף';
        
        await query(
          `UPDATE customer_loyalty SET loyalty_level = $1 WHERE user_id = $2`,
          [newLevel, user_id]
        );
      }
    }

    // Get updated loyalty data
    const updatedLoyalty = await getUserLoyalty(user_id);
    return updatedLoyalty;

  } catch (error) {
    console.error('Error adding points:', error);
    return createResponse(500, null, 'Failed to add points: ' + error.message);
  }
}

// Redeem gift
async function redeemGift(body) {
  const { user_id, gift_id } = body;
  
  if (!user_id || !gift_id) {
    return createResponse(400, null, 'Missing required fields');
  }

  try {
    // Get gift details
    const giftResult = await query(
      `SELECT * FROM loyalty_gifts WHERE id = $1 AND is_active = true`,
      [gift_id]
    );

    if (giftResult.rows.length === 0) {
      return createResponse(400, null, 'Gift not found or not available');
    }

    const gift = giftResult.rows[0];

    // Check if user has enough points and spend them
    const spendResult = await query(
      `SELECT spend_loyalty_points($1, $2, $3, $4, $5)`,
      [user_id, gift.points_cost, 'gift_redemption', gift_id, `Redeemed: ${gift.name}`]
    );

    if (!spendResult.rows[0].spend_loyalty_points) {
      return createResponse(400, null, 'Insufficient points');
    }

    // Create redemption record
    await query(
      `INSERT INTO gift_redemptions (user_id, gift_id, points_spent) 
       VALUES ($1, $2, $3)`,
      [user_id, gift_id, gift.points_cost]
    );

    // Get updated loyalty data
    const updatedLoyalty = await getUserLoyalty(user_id);
    return updatedLoyalty;

  } catch (error) {
    console.error('Error redeeming gift:', error);
    return createResponse(500, null, 'Failed to redeem gift');
  }
}

// Get benefits for loyalty level
function getBenefitsForLevel(level) {
  const benefits = {
    'ברונזה': [
      'נקודות על כל טיפול',
      'גישה למבצעים מיוחדים'
    ],
    'כסף': [
      'נקודות על כל טיפול',
      'הנחה של 5% על טיפולים',
      'גישה למבצעים מיוחדים',
      'עדיפות בתורים'
    ],
    'זהב': [
      'נקודות על כל טיפול',
      'הנחה של 10% על טיפולים',
      'גישה למבצעים בלעדיים',
      'עדיפות בהזמנת תורים',
      'נקודות בונוס על ביקורות'
    ],
    'פלטינה': [
      'נקודות על כל טיפול',
      'הנחה של 15% על טיפולים',
      'גישה למבצעים בלעדיים',
      'עדיפות בהזמנת תורים',
      'נקודות בונוס על ביקורות',
      'טיפול מתנה חודשי'
    ],
    'יהלום': [
      'נקודות על כל טיפול',
      'הנחה של 20% על טיפולים',
      'גישה למבצעים בלעדיים',
      'עדיפות בהזמנת תורים',
      'נקודות בונוס על ביקורות',
      'טיפול מתנה חודשי',
      'יועץ אישי ייעודי'
    ]
  };

  return benefits[level] || benefits['ברונזה'];
}
