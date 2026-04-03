# &#x20;A Child Height Predictor

A science-backed adult height estimator using the Khamis-Roche method, with AI-powered explanations via Claude.

## How it works

* **Frontend** (`public/index.html`) — pure HTML/CSS/JS, no framework
* **Backend** (`src/server.js`) — tiny Express proxy that injects your Anthropic API key server-side
* The browser never sees your API key. All Claude calls go through `/api/claude` on your server.

## Local development

```bash
npm install
cp .env.example .env        # then edit .env and add your key
npm run dev                  # starts server with auto-reload on :3000
```

Open http://localhost:3000

## Deploy to Railway (recommended — free tier)

1. Push this folder to a GitHub repo
2. Go to railway.app → New Project → Deploy from GitHub
3. Select your repo
4. In Railway dashboard → Variables → add:

   * `ANTHROPIC\_API\_KEY` = your key
5. Done — Railway auto-detects Node and runs `npm start`

## Deploy to Render (free tier)

1. Push to GitHub
2. render.com → New Web Service → connect repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variable: `ANTHROPIC\_API\_KEY`

## Deploy to Fly.io

```bash
npm install -g flyctl
fly launch          # follow prompts
fly secrets set ANTHROPIC\_API\_KEY=sk-ant-your-key-here
fly deploy
```

## Rate limiting

The proxy limits each IP to **20 requests per hour** to protect your API key from abuse.
Adjust in `src/server.js` → `rateLimit({ max: 20 })`.

## Project structure

```
height-predictor/
├── public/
│   └── index.html      # entire frontend (self-contained)
├── src/
│   └── server.js       # Express proxy server
├── .env.example        # copy to .env, add your key
├── .gitignore
├── package.json
└── README.md
```

