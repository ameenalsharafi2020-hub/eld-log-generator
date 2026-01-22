# ELD Log Generator

A full-stack application for generating FMCSA-compliant ELD logs for truck drivers.

## Features

- Trip planning with route calculation
- FMCSA hours-of-service compliance calculation
- Automatic daily log sheet generation
- Route visualization with maps
- Fuel stop calculation (every 1,000 miles)
- Print and export functionality

## Tech Stack

### Backend
- Django
- Django REST Framework
- SQLite (development) / PostgreSQL (production)

### Frontend
- React
- Material-UI
- Leaflet for maps

## Installation

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
Create virtual environment:

bash
python -m venv venv
Activate virtual environment:

Windows: venv\Scripts\activate

Mac/Linux: source venv/bin/activate

Install dependencies:

bash
pip install -r requirements.txt
Run migrations:

bash
python manage.py migrate
Create superuser (optional):

bash
python manage.py createsuperuser
Run development server:

bash
python manage.py runserver
Frontend Setup
Navigate to frontend directory:

bash
cd frontend
Install dependencies:

bash
npm install
Run development server:

bash
npm start
Usage
Open browser and go to http://localhost:3000

Click "Start Planning Your Trip"

Enter trip details:

Current location

Pickup location

Drop-off location

Current cycle hours used

Click "Generate ELD Logs"

View results including route map and daily log sheets

Print or export logs as needed

FMCSA Compliance
The application follows these FMCSA regulations:

11-hour driving limit

14-hour on-duty limit

70-hour/8-day cycle limit

30-minute break after 8 hours of driving

10-hour off-duty requirement

Fuel stops every 1,000 miles (assumption)

1 hour for pickup and drop-off

API Endpoints
POST /api/trips/ - Create a new trip

GET /api/trips/:id/ - Get trip details

POST /api/calculate-route/ - Calculate route (mock)

Deployment
Backend (Heroku/Render)
Set up PostgreSQL database

Configure environment variables

Deploy using Git

Frontend (Vercel/Netlify)
Build the React app: npm run build

Deploy the build folder

License
MIT
