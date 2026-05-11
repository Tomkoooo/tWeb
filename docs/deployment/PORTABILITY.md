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

## 2. Local File Persistence
Product images are stored locally in the `/uploads` directory at the root of the project.

- **Storage Strategy**: Files are uploaded to the physical server disk.
- **Docker Support**: The `docker-compose.yml` file mounts the `./uploads` directory to the container. This ensures that images persist even if the container is recreated.
- **Next.js Serving**: Since Next.js cannot access files added after build-time in the `public` folder, we use a custom API route `/api/media/[filename]` to serve these files to the browser.

## 3. How to Move the Project
1. **Zip the whole directory**: Include the `.env`, `prisma/`, `src/`, and most importantly, the `uploads/` folder.
2. **On the new host**:
    - If they support Docker: Run `docker-compose up -d`.
    - If they support Node.js directly: Run `npm install`, `npm run build`, and `npm start`.

## 4. Environment Variables
Ensure the following are set in your `.env`:
- `DATABASE_URL`: Your MongoDB connection string.
- `NEXT_PUBLIC_APP_URL`: The URL where the site is hosted (e.g., `https://your-shop.com`).
