# AI-Based Employee Performance Analytics & Recommendation System

A MERN-style application for registering employees, tracking performance data, filtering employees by department, ranking employees with deterministic rules, and generating AI recommendations for promotion, training, ranking, and feedback through the OpenRouter Chat Completions API.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Frontend:** React.js + Vite
- **HTTP Client:** Axios
- **AI API:** OpenRouter/OpenAI-compatible Chat Completions API
- **Default AI Model:** `openai/gpt-4o`
- **Deployment Target:** Render web service + Render static site + MongoDB Atlas

## Project Structure

```text
/backend
  server.js
  .env.example
  /models
    Employee.js
    Candidate.js       # compatibility alias for the existing structure
    User.js           # retained for compatibility if existing data references it
  /routes
    employees.js
    candidates.js      # compatibility alias for the existing structure
    match.js
    ai.js
  /controllers
    candidateController.js
    matchController.js
    aiController.js
  /middleware
    errorHandler.js
/frontend
  vite.config.js
  .env.example
  /src
    /components
      CandidateForm.jsx       # now Employee Registration Form
      CandidateList.jsx       # now Employee List + department search
      JobForm.jsx             # performance ranking + AI recommendation view
      ShortlistResults.jsx
      AIResults.jsx
    api.js
    App.jsx
    main.jsx
    styles.css
```

## Employee MongoDB Schema

```js
{
  employeeName: String,
  email: { type: String, unique: true },
  department: String,
  skills: [String],
  performanceScore: Number,
  yearsOfExperience: Number,
  createdAt: { type: Date, default: Date.now }
}
```

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Edit `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/employee_analytics_db
PORT=5000
OPENROUTER_API_KEY=your_openrouter_key_here
AI_MODEL=openai/gpt-4o
FRONTEND_URL=http://localhost:5173
```

The backend runs at:

```text
http://localhost:5000
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

## API Endpoints

All CRUD and recommendation endpoints are accessible directly; no bearer token or authentication header is required.

### Add Employee

```http
POST /api/employees
```

```json
{
  "employeeName": "Ada Lovelace",
  "email": "ada@example.com",
  "department": "Engineering",
  "skills": ["React", "Node.js", "Analytics"],
  "performanceScore": 92,
  "yearsOfExperience": 5
}
```

Validation includes duplicate-email checks and a required performance score.

### Get All Employees

```http
GET /api/employees
```

Returns employees sorted by newest first.

### Search Employees by Department

```http
GET /api/employees/search?department=Engineering
```

Returns employees for the selected department sorted by performance score.

### AI Recommendation

```http
POST /api/ai/recommend
```

```json
{
  "employees": [
    {
      "employeeName": "Ada Lovelace",
      "email": "ada@example.com",
      "department": "Engineering",
      "skills": ["React", "Node.js"],
      "performanceScore": 92,
      "yearsOfExperience": 5
    }
  ]
}
```

The backend sends an OpenRouter prompt similar to:

```text
Employee performance data: [details]. Suggest promotion/training/ranking.
```

It returns promotion recommendation, employee ranking, training suggestions, AI feedback, and an AI score.

## Frontend Usage

- **Add Employee:** Register employee name, email, department, skills, performance score, and years of experience.
- **Employee List:** View all employees and filter by department.
- **Performance Ranking:** Rank employees using skill matches, experience, and performance score.
- **AI Recommendations:** Call `/api/ai/recommend` for promotion readiness, training guidance, ranking, and feedback.

## Render Deployment

### Backend Web Service

| Setting | Value |
| --- | --- |
| Runtime | Node |
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

Environment variables:

| Key | Value |
| --- | --- |
| `MONGO_URI` | MongoDB Atlas connection string |
| `PORT` | `5000` |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `AI_MODEL` | `openai/gpt-4o` |
| `FRONTEND_URL` | Render frontend origin |
| `NODE_VERSION` | `20` |

Backend live URL placeholder:

```text
https://employee-performance-analytics-backend.onrender.com
```

Health check:

```text
https://employee-performance-analytics-backend.onrender.com/api/health
```

### Frontend Static Site

| Setting | Value |
| --- | --- |
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

Environment variable:

| Key | Value |
| --- | --- |
| `VITE_API_BASE_URL` | Backend Render URL, without trailing `/api` |

Frontend live URL placeholder:

```text
https://employee-performance-analytics-frontend.onrender.com
```

After deployment, update backend `FRONTEND_URL` to the final frontend URL and redeploy the backend.

## Screenshots to Capture for Submission

Add screenshots under a `docs/screenshots/` folder after running locally or deploying:

1. Postman add employee request.
2. Postman get/search employees request without an Authorization header.
3. Postman AI recommendation request without an Authorization header.
4. MongoDB employees collection data.
5. Frontend employee registration screen.
6. Frontend employee list and department filter.
7. Frontend AI recommendation output.
8. Render backend and frontend deployment dashboards.

## Notes

- Existing candidate-oriented file names are retained where needed to preserve the original project structure and compatibility.
- `/api/candidates` and `/api/ai/shortlist` are kept as backward-compatible aliases, but the employee-focused endpoints are `/api/employees` and `/api/ai/recommend`.
- No API keys or production secrets are committed.
