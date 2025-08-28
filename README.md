# Frontend — Local Development Guide

This is a **Next.js (App Router)** frontend that authenticates with **Amazon Cognito** (Authorization Code + PKCE) and calls a backend API (API Gateway/Lambda).

---

## 0) Prerequisites
    - node -v   # should print v20.x
    - npm (bundled with Node 20)
    - Access to the Cognito User Pool and the API base URL


## 1) Clone and Install
    - git clone https://github.com/ryanjones1997/frontend.git
    - cd frontend
    - npm install
## 2) Environment variables (local)
Create a file named .env.local at the repo root:
    ```
    NEXT_PUBLIC_API_BASE_URL=https://8zo99udgc3.execute-api.us-east-1.amazonaws.com
    NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000
    ```
## 3) Start the app
    - npm run dev
    # open http://localhost:3000
Log in via the app’s sign-in button.
- username: ryanjavid
- password: Testing123@@

## 4) Scripts
    - npm run build
    - npm run start
    - npm run dev
    - npm run lint
    - npm run lint:fix

## 5) CI/CD summary
- **GitHub Actions** runs lint/tests/build on each PR (`Frontend CI / ci`).
- **Vercel** posts a PR Preview and deploys **production** on merges to `main`.
- **Branch protection** requires `Frontend CI / ci` and `Vercel – frontend` checks to pass.