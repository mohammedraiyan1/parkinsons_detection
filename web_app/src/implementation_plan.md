# Polishing and Deploying NeuroCheck

Enhance the NeuroCheck web application with a premium, AI-driven aesthetic inspired by professional AI frameworks. This includes adding 3D animations, background media, and a robust Docker-based deployment strategy for public access.

## User Review Required

> [!IMPORTANT]
> **New Dependencies**: I will be adding `three`, `@types/three`, `@react-three/fiber`, and `@react-three/drei` to the `web_app` to enable 3D animations.
> [!NOTE]
> **Deployment Platform**: For "fully public" deployment, I recommend using a VPS (like DigitalOcean or AWS) or a container service (like Railway or Render). I will provide instructions for a generic VPS setup using Docker Compose.

## Proposed Changes

### [web_app] - Frontend Polishing

#### [MODIFY] [package.json](file:///c:/Users/EQ2144/Downloads/mpdd%20parkinsons/web_app/package.json)
- Add Three.js and React Three Fiber dependencies.

#### [MODIFY] [index.css](file:///c:/Users/EQ2144/Downloads/mpdd%20parkinsons/web_app/src/index.css)
- Refine existing styles with glassmorphism, smoother gradients, and premium typography.
- Add utility classes for background video overlays.

#### [NEW] [BackgroundMedia.tsx](file:///c:/Users/EQ2144/Downloads/mpdd%20parkinsons/web_app/src/components/BackgroundMedia.tsx)
- A component to play a subtle background video or display high-quality medical imagery.

#### [NEW] [BrainModel.tsx](file:///c:/Users/EQ2144/Downloads/mpdd%20parkinsons/web_app/src/components/BrainModel.tsx)
- A 3D animation component using React Three Fiber to display a rotating, interactive neural network or brain model.

#### [MODIFY] [AuthPage.tsx](file:///c:/Users/EQ2144/Downloads/mpdd%20parkinsons/web_app/src/pages/AuthPage.tsx)
- Integrate the 3D model and background media for a "wow" first impression.

---

### [Deployment] - Docker & Public Access

#### [NEW] [Dockerfile](file:///c:/Users/EQ2144/Downloads/mpdd%20parkinsons/web_app/Dockerfile)
- Create a multi-stage Dockerfile:
  1. Build the React app using Node.
  2. Serve the static files using Nginx with optimized configurations.

#### [MODIFY] [docker-compose.prod.yml](file:///c:/Users/EQ2144/Downloads/mpdd%20parkinsons/docker-compose.prod.yml)
- Add the `web_app` service.
- Configure environment variables for production.
- Ensure the frontend can communicate with the backend and ML services.

#### [NEW] [DEPLOYMENT.md](file:///c:/Users/EQ2144/Downloads/mpdd%20parkinsons/DEPLOYMENT.md)
- A comprehensive guide on how to deploy this stack to a public server, including domain setup and SSL (Certbot/Nginx).

## Open Questions

1. **Background Video**: Do you have a specific video file you'd like to use, or should I generate/use a placeholder medical-themed abstract video?
2. **Domain Name**: Do you already have a domain name purchased for the public deployment?

## Verification Plan

### Automated Tests
- `npm run build` to ensure the production bundle can be created without errors.
- `docker compose -f docker-compose.prod.yml build` to verify Docker images build correctly.

### Manual Verification
- View the UI in the browser to ensure the 3D animations and background media are smooth and don't impact performance.
- Test the login flow and dashboard with the new styling.
