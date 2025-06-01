
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useData } from '@/contexts/DataContext';
import { gift } from 'lucide-react';

const CustomerClubSection = () => {
  const { userClub } = useData();

  const progressPercentage = (userClub.points / userClub.nextLevelPoints) * 100;

  const benefits = [
    "10% הנחה על ויטמינים",
    "הזמנות מועדפות",
    "ביטול תורים ללא עמלה",
    "טיפול חינם בכל חום הולדת"
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <gift className="h-5 w-5" />
          מועדון לקוחות
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm inline-block">
            רמה: {userClub.level}
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">
                {userClub.points} נקודות
              </span>
              <span className="text-sm text-gray-600">
                {userClub.nextLevelPoints} נקודות לרמה הבאה
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div>
            <h4 className="font-semibold mb-2">ההטבות שלך:</h4>
            <div className="space-y-1">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center text-sm text-green-600">
                  <span className="mr-2">✓</span>
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          <Button className="w-full bg-purple-600 hover:bg-purple-700">
            צבור נקודות בטיפול הבא
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerClubSection;
