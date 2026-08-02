# Anova Tech Company Website

A full-stack premium tech company website inspired by the provided reference, built with React + Vite on the frontend and Node.js + Express + MySQL on the backend.

## Tech Stack

- Frontend: React.js, Vite, Tailwind CSS, Framer Motion, Lucide React, Axios
- Backend: Node.js, Express.js, JWT, Multer, MySQL, ImageKit, Sharp
- UI Features: glassmorphism, dark/light mode, responsive layout, smooth animations, reusable sections

## Project Structure

```text
project-root/
├── Frontend/
│   ├── public/
│   └── src/
└── Backend/
```

## Setup

### 1. Backend

1. Go to `Backend/`.
2. Create your MySQL database named `anova_tech_company`.
3. Update `Backend/.env` with your MySQL credentials, JWT secret, and ImageKit credentials.
4. Start the API:

```bash
npm install
npm run dev
```

The backend bootstraps the schema automatically and seeds a default admin user when credentials are available.

Default admin login from `Backend/.env`:

- Email: `admin@anova.com`
- Password: `Admin@12345`

### 2. Frontend

1. Go to `Frontend/`.
2. Run the app:

```bash
npm install
npm run dev
```

If your backend is running on a different URL, set `VITE_API_URL` in a frontend `.env` file.

### Required Backend Environment Variables

- `JWT_SECRET`
- `MYSQL_HOST` (Railway public host, do not use internal `mysql.railway.internal` from outside Railway)
- `MYSQL_PORT` (Railway public TCP port)
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`
- `MYSQL_SSL` (`true` or `false`, based on your Railway/MySQL requirement)
- `MYSQL_SSL_REJECT_UNAUTHORIZED` (`true` by default, set `false` only if your provider requires it)
- `IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY`
- `IMAGEKIT_URL_ENDPOINT`

## REST API

- `POST /api/auth/login`
- `GET /api/services`
- `POST /api/services`
- `PUT /api/services/:id`
- `DELETE /api/services/:id`
- `GET /api/projects`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `GET /api/blogs`
- `POST /api/blogs`
- `PUT /api/blogs/:id`
- `DELETE /api/blogs/:id`
- `GET /api/testimonials`
- `POST /api/testimonials`
- `PUT /api/testimonials/:id`
- `DELETE /api/testimonials/:id`
- `POST /api/contact`
- `GET /api/contact`
- `DELETE /api/contact/:id`

## MySQL Tables

- `users`
- `services`
- `projects`
- `blogs`
- `testimonials`
- `contacts`

Each table includes a primary key, `created_at`, and `updated_at` fields.

## Notes

- The frontend uses route-based pages for Home, About, Services, Projects, Blog, Contact, Login, and Admin Dashboard.
- Admin routes are protected with JWT auth.
- Uploaded images are processed in-memory with Multer, optimized with Sharp, and stored permanently in ImageKit.
- Project records store `image_url` plus cloud metadata (`image_file_id`, `image_file_path`, `image_hash`) to support safe replace/delete and duplicate prevention.
- Search, pagination, dark/light mode, and toast notifications are included in the UI.
