# Candidate Profile Shortlisting System

A full-stack MERN-style application for storing candidate profiles, shortlisting candidates with deterministic matching rules, and ranking candidates with OpenRouter AI.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Frontend:** React.js + Vite
- **HTTP Client:** Axios
- **AI API:** OpenRouter Chat Completions API
- **Default AI Model:** `openai/gpt-4o`
- **Environment Variables:** `dotenv`

## Project Structure

```text
/backend
  server.js
  .env
  .env.example
  /models
    Candidate.js
  /routes
    candidates.js
    match.js
    ai.js
  /controllers
    candidateController.js
    matchController.js
    aiController.js

/frontend
  vite.config.js
  /src
    /components
      CandidateForm.jsx
      JobForm.jsx
      CandidateList.jsx
      ShortlistResults.jsx
      AIResults.jsx
    App.jsx
    main.jsx
    styles.css
```

## Prerequisites

Install the following before running the project:

1. **Node.js 18+**
2. **MongoDB Community Server** or a MongoDB Atlas connection string
3. **OpenRouter API key** for AI shortlisting

## Get an OpenRouter API Key

1. Go to [https://openrouter.ai](https://openrouter.ai).
2. Sign in or create an account.
3. Open your account/API keys page.
4. Create a new API key.
5. Copy the key and place it in `backend/.env` as `OPENROUTER_API_KEY`.

## Backend Setup

From the repository root:

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/shortlist_db
PORT=5000
OPENROUTER_API_KEY=your_openrouter_key_here
AI_MODEL=openai/gpt-4o
```

Start MongoDB locally if you are not using Atlas:

```bash
mongod
```

Run the backend API:

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

## Frontend Setup

Open a second terminal from the repository root:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

Vite proxies `/api` requests to `http://localhost:5000`, and the backend also enables CORS for `http://localhost:5173`.

## Exact Commands to Run the Project

Run these commands in order:

```bash
# Terminal 1: start MongoDB if using a local MongoDB server
mongod
```

```bash
# Terminal 2: install and run backend
cd backend
npm install
cp .env.example .env
# Edit .env and set OPENROUTER_API_KEY before using AI shortlist
npm run dev
```

```bash
# Terminal 3: install and run frontend
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

## API Endpoints

### Create Candidate

```http
POST /api/candidates
```

Body:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "skills": ["React", "Node.js", "MongoDB"],
  "experience": 5,
  "bio": "Full-stack engineer with product experience."
}
```

### Get Candidates

```http
GET /api/candidates
```

Returns all saved candidates sorted by newest first.

### Basic Shortlist

```http
POST /api/match
```

Body:

```json
{
  "requiredSkills": ["React", "Node.js"],
  "minExperience": 3,
  "preferredSkills": ["AWS", "TypeScript"]
}
```

The backend filters candidates by minimum experience, scores required skill matches, adds preferred skill bonus points, sorts by score, and classifies candidates into `High`, `Medium`, or `Low` tiers.

### AI Shortlist

```http
POST /api/ai/shortlist
```

Body:

```json
{
  "requiredSkills": ["React", "Node.js"],
  "minExperience": 3,
  "candidates": [
    {
      "name": "Ada Lovelace",
      "email": "ada@example.com",
      "skills": ["React", "Node.js", "MongoDB"],
      "experience": 5,
      "bio": "Full-stack engineer with product experience."
    }
  ]
}
```

The backend sends a recruiter-style prompt to OpenRouter, strips markdown code fences if present, parses JSON, merges AI scores and explanations back into the candidate objects, and returns candidates sorted by AI score.

## Frontend Usage

- **Add Candidate:** Create a candidate profile with comma-separated skills.
- **View All:** Review all stored candidates in a responsive card grid.
- **Shortlist:** Run deterministic matching with required and preferred skills.
- **AI Match:** Fetch all candidates, send them to OpenRouter, and display AI score, rank, reason, and skills.

## Notes

- No real API keys are committed. `backend/.env.example` and `backend/.env` contain placeholder values only.
- If AI shortlisting returns `OPENROUTER_API_KEY is not configured`, update `backend/.env` with a real OpenRouter key and restart the backend.
- You can change the AI model by editing `AI_MODEL` in `backend/.env`.
