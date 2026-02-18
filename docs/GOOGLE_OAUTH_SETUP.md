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
   - (Add your production domain if applicable)
6. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - (Add your production domain callback if applicable)
7. Click **Create**.
8. Copy your **Client ID** and **Client Secret**.

## 4. Update .env File
Add the following variables to your project's `.env` file:

```env
AUTH_GOOGLE_ID=your_client_id_here
AUTH_GOOGLE_SECRET=your_client_secret_here
AUTH_SECRET=a_random_secret_string (run `npx auth secret` to generate one)
NEXTAUTH_URL=http://localhost:3000
```

## 5. Manually Set Admin Role (Optional)
By default, new users are created with the `USER` role. To access the admin dashboard, you can manually update your user record in MongoDB:

```js
// MongoDB command
db.users.updateOne({ email: "your-email@gmail.com" }, { $set: { role: "ADMIN" } })
```
