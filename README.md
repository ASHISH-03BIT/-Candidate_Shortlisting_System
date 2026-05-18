# AI-Based Employee Performance Analytics & Recommendation System

A MERN-style application for registering employees, tracking performance data, filtering employees by department, ranking employees with deterministic rules, and generating AI recommendations for promotion, training, ranking, and feedback through the OpenRouter Chat Completions API.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Frontend:** React.js + Vite
- **HTTP Client:** Axios
- **AI API:** OpenRouter/OpenAI-compatible Chat Completions API
- **Authentication:** JWT-style bearer tokens with Node.js crypto password hashing
- **Default AI Model:** `openai/gpt-4o-mini`
- **Deployment Target:** Render web service + Render static site + MongoDB Atlas

## Project Structure

```text
/backend
  server.js
  .env.example
  /models
    Employee.js
    Candidate.js       # compatibility alias for the existing structure
    User.js           # HR/Admin login users with hashed passwords
  /routes
    auth.js
    employees.js
    candidates.js      # compatibility alias for the existing structure
    match.js
    ai.js
  /controllers
    candidateController.js
    matchController.js
    aiController.js
  /middleware
    authMiddleware.js
    errorHandler.js
  /utils
    auth.js
/frontend
  vite.config.js
  .env.example
  /src
    /components
      AuthPage.jsx            # login/signup screen
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
JWT_SECRET=replace_with_a_long_random_secret
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_openrouter_key_here
AI_BASE_URL=https://openrouter.ai/api/v1
AI_MODEL=openai/gpt-4o-mini
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

Signup and login are public. Employee, ranking, and AI endpoints are protected and require an `Authorization: Bearer <token>` header.


### Signup

```http
POST /api/auth/signup
```

```json
{
  "name": "HR Admin",
  "email": "admin@example.com",
  "password": "secret123"
}
```

Returns a bearer token and user profile. Passwords are stored as salted hashes, not plain text.

### Login

```http
POST /api/auth/login
```

```json
{
  "email": "admin@example.com",
  "password": "secret123"
}
```

Use the returned token for protected APIs:

```http
Authorization: Bearer <token>
```

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

### Update Employee

```http
PUT /api/employees/:id
```

```json
{ "performanceScore": 91 }
```

### Delete Employee

```http
DELETE /api/employees/:id
```

Returns `{ "message": "Employee removed successfully." }`.

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

- **Login/Signup:** HR/Admin users authenticate before accessing protected employee and AI routes.
- **Add Employee:** Register employee name, email, department, skills, performance score, and years of experience.
- **Employee List:** View all employees, filter by department, update performance scores, and delete employee records.
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
| `JWT_SECRET` | Long random signing secret |
| `AI_PROVIDER` | `openrouter` or `openai` |
| `OPENROUTER_API_KEY` | OpenRouter API key from `https://openrouter.ai/keys` |
| `AI_BASE_URL` | `https://openrouter.ai/api/v1` for OpenRouter |
| `AI_MODEL` | `openai/gpt-4o-mini` |
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
3. Postman protected route without an Authorization header showing access denied.
4. Postman AI recommendation request with an Authorization header.
5. MongoDB employees collection data.
6. Frontend login/signup screen.
7. Frontend employee registration screen.
8. Frontend employee list, department filter, update, and delete controls.
9. Frontend AI recommendation output.
10. Render backend and frontend deployment dashboards.

## Notes

- Existing candidate-oriented file names are retained where needed to preserve the original project structure and compatibility.
- `/api/candidates` and `/api/ai/shortlist` are kept as backward-compatible aliases, but the employee-focused endpoints are `/api/employees` and `/api/ai/recommend`.
- If the AI endpoint returns `OpenRouter returned 401` or `User not found`, the configured key is invalid for OpenRouter. Create/copy a fresh key from OpenRouter, set `OPENROUTER_API_KEY` in `backend/.env` or Render, keep `AI_BASE_URL=https://openrouter.ai/api/v1`, and restart/redeploy the backend.
- No API keys or production secrets are committed.
