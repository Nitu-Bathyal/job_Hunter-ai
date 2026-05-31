# JobHunter AI
> Find jobs. Score them. Apply smarter.

Built for the **Anakin Wire Hackathon 2026** in 48 hours.

## What it does
JobHunter AI is an intelligent job hunting agent that:
- Scrapes real job listings via **Anakin Wire**
- Scores each job against your resume using **Gemini AI** (0–100 match score)
- Writes a personalized cover letter for each job in one click
- Shows match reasons and missing skills for every job
- Tracks which jobs you have applied to
- Gives AI-powered resume improvement tips
- Exports all results to CSV

## Tech Stack
| Layer | Technology |
|---|---|
| Job Scraping | Anakin Wire |
| AI Scoring & Writing | Google Gemini AI |
| Backend | Node.js + Express |
| Frontend | Vanilla JS, HTML, CSS |

## Setup and Run Locally

1. Clone the repo
```bash
   git clone https://github.com/Nitu-Bathyal/job-hunter-ai.git
   cd job-hunter-ai
```

2. Install dependencies
```bash
   npm install
```

3. Create a `.env` file
   ANAKIN_API_KEY=your_anakin_key
GEMINI_API_KEY=your_gemini_key
PORT=3000

4. Run the app
```bash
   node index.js
```

5. Open browser at `http://localhost:3000`

## Demo
[Watch the demo video](#)

## Live App
[Click here to try it live](#)

## How it works
1. You enter a job title, location and paste your resume
2. Wire scrapes matching job listings from the web
3. Gemini AI scores each job from 0 to 100 based on your resume
4. You see ranked results with match reasons and missing skills
5. Click any job to instantly generate a personalized cover letter

## Built by
Nitu Bathyal · Anakin Wire Hackathon 2026
