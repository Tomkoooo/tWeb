# Portability Documentation

This project is designed to be highly portable between dedicated VPS hosting (Node.js/Docker) and traditional shared hosts.

## 1. Database Portability (Prisma)
We use **Prisma** as an ORM. This allows you to switch between different database engines (MongoDB, MySQL, PostgreSQL) with minimal code changes.

- **Current Config**: MongoDB
- **To switch to MySQL**:
    1. Update `prisma/schema.prisma` datasource provider to `mysql`.
    2. Update `DATABASE_URL` in `.env`.
    3. Update `prisma.config.ts` if you need specific driver adapters.
    4. Run `npx prisma db push`.

## 2. Media storage
Uploaded images and documents (products, banners, branding, legal PDFs) are stored in **MongoDB** on the `Media` collection (`data` buffer field). This works on **Vercel** and other read-only serverless hosts.

- **Serving**: `/api/media/[filename]` reads from the database (with optional legacy fallback to `./uploads/` on VPS if an old row has no `data` field).
- **Docker / VPS**: You may still mount `./uploads` for older deployments; new uploads do not require a writable disk.

## 3. How to Move the Project
1. **Zip the whole directory**: Include the `.env`, `prisma/`, `src/`, and most importantly, the `uploads/` folder.
2. **On the new host**:
    - If they support Docker: Run `docker-compose up -d`.
    - If they support Node.js directly: Run `npm install`, `npm run build`, and `npm start`.

## 4. Environment Variables
Ensure the following are set in your `.env`:
- `DATABASE_URL`: Your MongoDB connection string.
- `NEXT_PUBLIC_APP_URL`: The URL where the site is hosted (e.g., `https://your-shop.com`).
