
# FreezeFit Backend

This is the backend server for the FreezeFit Location Hub application.
זהו שרת ה-Backend לאפליקציית FreezeFit Location Hub.


## Technologies Used / טכנולוגיות בשימוש

- **Node.js** - Runtime environment / סביבת הרצה
- **Express.js** - Web framework / מסגרת לפיתוח ווב
- **TypeScript** - Type-safe JavaScript / JavaScript עם טיפוסיות
- **Winston** - Logging library / ספריית לוגים
- **CORS** - Cross-origin resource sharing / שיתוף משאבים בין דומיינים


## Getting Started / תחילת עבודה

### Prerequisites / דרישות מוקדמות

- Node.js (v18 or higher) / Node.js (גרסה 18 ומעלה)
- npm


### Installation / התקנה

1. Install dependencies / התקן את התלויות:
   ```bash
   npm install
   ```

2. Create a `.env` file (already created with default values) / צור קובץ `.env` (כבר נוצר עם ערכי ברירת מחדל):
   ```
   PORT=3001
   NODE_ENV=development
   ```


### Running the Server / הרצת השרת

#### Development Mode / מצב פיתוח
```bash
npm run dev
```
This will start the server with nodemon for hot reloading.
הפקודה תפעיל את השרת עם nodemon לטעינה מחדש אוטומטית.


# פריזפיט - שרת אחורי

זהו שרת ה-Backend לאפליקציית FreezeFit Location Hub.

## טכנולוגיות בשימוש

- **Node.js** - סביבת הרצה
- **Express.js** - מסגרת לפיתוח ווב
- **TypeScript** - JavaScript עם טיפוסיות
- **Winston** - ספריית לוגים
- **CORS** - שיתוף משאבים בין דומיינים

## תחילת עבודה

### דרישות מוקדמות

- Node.js (גרסה 18 ומעלה)
- npm

### התקנה

1. התקנת תלויות:
   ```bash
   npm install
   ```

2. יצירת קובץ `.env` (כבר נוצר עם ערכי ברירת מחדל):
   ```
   PORT=3001
   NODE_ENV=development
   ```

### הרצת השרת

#### מצב פיתוח
```bash
npm run dev
```
הפקודה תפעיל את השרת עם nodemon לטעינה מחדש אוטומטית.

#### מצב ייצור
```bash
npm run build
npm start
```

### נקודות קצה API

- `GET /api` - הודעת ברוכים הבאים
- `GET /api/health` - בדיקת תקינות

### מבנה הפרויקט

```
backend/
├── src/
│   ├── app.js                # נקודת כניסה לאפליקציה
│   ├── server.js             # קובץ שרת ראשי
│   ├── config/               # קבצי קונפיגורציה
│   │   └── index.js
│   ├── controllers/          # קונטרולרים של ראוטים
│   │   ├── InstituteController.js
│   │   ├── UserController.js
│   │   └── index.js
│   ├── dal/                  # שכבת גישה לנתונים
│   │   ├── BaseDAL.js
│   │   ├── InstituteDAL.js
│   │   ├── UserDAL.js
│   │   └── index.js
│   ├── middleware/           # מידלוורים של Express
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── validation.js
│   │   └── index.js
│   ├── models/               # מודלים של נתונים
│   │   ├── Institute.js
│   │   ├── User.js
│   │   └── index.js
│   ├── routes/               # ראוטים של ה-API
│   │   ├── instituteRoutes.js
│   │   ├── userRoutes.js
│   │   └── index.js
│   ├── services/             # שירותי לוגיקה עסקית
│   │   ├── InstituteService.js
│   │   ├── UserService.js
│   │   └── index.js
│   ├── utils/                # פונקציות עזר
│   │   ├── database.js
│   │   ├── logger.js
│   │   └── index.js
```
