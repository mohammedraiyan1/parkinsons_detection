# Deploying NeuroCheck for Free

Follow this guide to deploy your NeuroCheck Parkinson's diagnostic framework publicly for free using modern container platforms.

## Recommended Platform: Railway

[Railway](https://railway.app/) is a deployment platform that allows you to deploy Docker containers directly from GithHub. It offers a free trial ($5 credit) that can last for many months for a small application like this.

### Steps to Deploy:

1.  **Prepare your code**: Ensure all your changes are committed to a GitHub repository.
2.  **Connect to Railway**:
    *   Sign in to Railway using your GitHub account.
    *   Click **"New Project"** -> **"Deploy from GitHub repo"**.
    *   Select your repository.
3.  **Configure Services**:
    Railway will automatically detect your `docker-compose.prod.yml` (or you can set up each service individually).
    *   **Frontend**: Railway will build the `Dockerfile` in the `web_app` directory.
    *   **Backend**: Railway will build the `Dockerfile` in the `backend` directory.
    *   **Postgres/Redis**: Railway provides one-click plugins for these.
4.  **Public URL**: Once deployed, Railway will provide a public URL (e.g., `neurocheck-production.up.railway.app`).

---

## Alternative: Render (Free Tier)

[Render](https://render.com/) offers a "Free" tier for web services (Containers).

### Steps to Deploy:

1.  **Create a New Web Service**: Select "Web Service" from the dashboard.
2.  **Connect GitHub**: Select your repository.
3.  **Configuration**:
    *   **Name**: `neurocheck-frontend`
    *   **Environment**: `Docker`
    *   **Docker Command**: Leave default (uses `Dockerfile`).
    *   **Plan**: Select **Free**.
4.  **Note**: The Free tier on Render will spin down the container after 15 minutes of inactivity, causing a slow initial load when someone visits the site again.

---

## Technical Details

### Frontend (Nginx + React)
The `web_app` is built as a static site and served via Nginx. The Dockerfile handles:
- Multi-stage build for efficiency.
- Nginx configuration to support Single Page Application (SPA) routing.
- Exposing port 80.

### Environment Variables
For public deployment, ensure your `.env` variables (like Supabase URL/Keys) are added to the platform's "Environment Variables" settings, NOT committed to GitHub.

> [!IMPORTANT]
> **No Domain Required**: Both Railway and Render provide free subdomains. You do not need to purchase a domain to have a public link.
