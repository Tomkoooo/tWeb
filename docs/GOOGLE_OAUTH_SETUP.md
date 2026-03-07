# Google OAuth Setup Guide

To enable Google Login for the Krausz Webshop, follow these steps to create your credentials in the Google Cloud Console.

## 1. Create a Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., "Krausz Webshop").

## 2. Configure OAuth Consent Screen
1. Go to **APIs & Services > OAuth consent screen**.
2. Select **External** and Click **Create**.
3. Fill in the required App information:
   - App name: `Krausz Webshop`
   - User support email: (Your email)
   - Developer contact info: (Your email)
4. Click **Save and Continue** through the Scopes and Test Users screens.

## 3. Create Credentials
1. Go to **APIs & Services > Credentials**.
2. Click **+ Create Credentials > OAuth client ID**.
3. Select **Web application** as the Application type.
4. Name: `Krausz Webshop Web Client`.
5. **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `https://your-production-domain.com`
   - `https://your-ngrok-subdomain.ngrok-free.app` (only if testing via tunnel)
6. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-production-domain.com/api/auth/callback/google`
   - `https://your-ngrok-subdomain.ngrok-free.app/api/auth/callback/google` (only if testing via tunnel)
7. Click **Create**.
8. Copy your **Client ID** and **Client Secret**.

## 3.1 Canonical host rule (important)
Use one host per login flow from start to callback:

- `localhost` flow: start sign-in on `http://localhost:3000` and return to `http://localhost:3000`.
- `ngrok` flow: start sign-in on the ngrok URL and return to the same ngrok URL.
- production flow: start and return on the production domain.

Do not start on one host and complete callback on another host, because PKCE/state cookies are host-bound and Auth.js will fail with `InvalidCheck`.

## 4. Update .env File
Add the following variables to your project's `.env` file:

```env
AUTH_GOOGLE_ID=your_client_id_here
AUTH_GOOGLE_SECRET=your_client_secret_here
AUTH_SECRET=a_random_secret_string (run `npx auth secret` to generate one)
AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
```

For reverse-proxy deployments, set:

```env
AUTH_URL=https://your-production-domain.com
NEXTAUTH_URL=https://your-production-domain.com
AUTH_TRUST_HOST=true
```

## 5. Manually Set Admin Role (Optional)
By default, new users are created with the `USER` role. To access the admin dashboard, you can manually update your user record in MongoDB:

```js
// MongoDB command
db.users.updateOne({ email: "your-email@gmail.com" }, { $set: { role: "ADMIN" } })
```
