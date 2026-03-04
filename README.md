# SheetBase

SheetBase is a web application that turns your Google Sheets into a high-performance, authenticated DuckDB database. It features a responsive React frontend for mobile-first data management and professional PDF reporting.

## Project Structure

- `backend/`: FastAPI server, DuckDB storage, and reporting logic.
- `frontend/`: React application with Tailwind CSS.
- `scripts/`: Ingestion scripts to pull data from Google Sheets.

## Getting Started

### Backend Setup

1.  Navigate to `backend/`.
2.  Install dependencies: `pip install -r requirements.txt`.
3.  Copy `.env.example` to `.env` and fill in your Google API credentials and Sheet ID.
4.  Run the ingestion script: `python scripts/ingest_sheets.py`.
5.  Start the API: `uvicorn app.main:app --reload`.

### Frontend Setup

1.  Navigate to `frontend/`.
2.  Install dependencies: `npm install`.
3.  Start the development server: `npm run dev`.

## Roadmap

- [x] Scaffolding and Directory Structure
- [x] Backend Foundation (FastAPI + DuckDB)
- [x] Google Sheets Ingestion Script
- [ ] Google OAuth 2.0 Full Integration
- [ ] React Frontend (Mobile-First)
- [ ] CRUD Operations in Web App
- [ ] PDF Reporting Engine
