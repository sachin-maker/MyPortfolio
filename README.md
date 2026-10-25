# Sachin Deshpande — Full-Stack Developer Portfolio

A modern, responsive full-stack portfolio built with Next.js, TypeScript, Tailwind CSS, and MongoDB. It showcases my projects, technical skills, professional experience, and education, with a secure admin panel for managing portfolio content.

**Live Website:** https://my-portfolio-henna-psi-99.vercel.app

---

## ✨ Features

### Public Portfolio
- Responsive portfolio homepage with a modern dark theme.
- About me, technical skills, professional experience, and education sections.
- Project listing with individual project detail pages.
- Project thumbnails, technology stacks, and links to live demos.
- Contact form with email delivery.
- Scroll-reveal animations and responsive navigation.

### Admin Dashboard
- GitHub OAuth authentication for authorized administrators.
- Create, update, and delete projects.
- Upload project images using Cloudinary.
- Manage skills, categories, proficiency levels, and display order.
- Manage professional experience and education.
- Activate or deactivate skills and control published content.
- Protected admin routes and API endpoints.

### Backend and Security
- MongoDB Atlas integration with Mongoose.
- REST API endpoints for portfolio content.
- Request validation using Zod.
- Request body size limits and input validation.
- Admin authorization checks for protected operations.
- Contact form validation, spam protection, and rate limiting.
- Image processing and validation before upload.

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Framework | Next.js 16, React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State Management | Redux Toolkit, RTK Query |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | Auth.js, GitHub OAuth |
| Image Storage | Cloudinary, Sharp |
| Email | Resend |
| Validation | Zod |
| Deployment | Vercel |
| Version Control | Git, GitHub |

---

## 📁 Project Structure

```text
sachin-portfolio/
├── public/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── portfolio/
│   │   │   └── providers/
│   │   ├── contact/
│   │   ├── lib/
│   │   ├── models/
│   │   ├── projects/
│   │   ├── store/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── auth.ts
│   └── proxy.ts
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js version compatible with the project's Next.js dependencies.
- npm.
- A MongoDB Atlas database.
- A GitHub OAuth application.
- A Cloudinary account for project image uploads.
- A Resend account for contact form email delivery.

### 1. Clone the repository

```bash
git clone https://github.com/sachin-maker/MyPortfolio.git
cd MyPortfolio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root.

```env
MONGODB_URI=

AUTH_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

ADMIN_EMAIL=
ADMIN_GITHUB_ID=

NEXT_PUBLIC_APP_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RESEND_API_KEY=
CONTACT_FROM_EMAIL=
CONTACT_TO_EMAIL=
```

Fill in the values using your own credentials. Check the application's configuration before using these variable names, because the exact names required depend on the implementation.

**Never commit `.env.local`, API keys, OAuth secrets, or database credentials to Git.**

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Run production checks

Type-check the project:

```bash
npx tsc --noEmit
```

Build the production application:

```bash
npm run build
```

---

## 🔐 Admin Panel

The admin panel is available at:

```text
/admin/login
```

Sign-in uses GitHub OAuth. Access to protected administration features is restricted to the configured administrator.

Configure the GitHub OAuth callback URL for your deployment:

```text
https://YOUR_DOMAIN/api/auth/callback/github
```

For local development, configure the callback URL required by your Auth.js and GitHub OAuth setup.

---

## 🌐 API Routes

| Endpoint | Purpose |
|---|---|
| `GET /api/projects` | Retrieve published projects |
| `POST /api/projects` | Create a project |
| `PATCH /api/projects/:id` | Update a project |
| `DELETE /api/projects/:id` | Delete a project |
| `GET /api/skills` | Retrieve active skills |
| `POST /api/skills` | Create a skill |
| `PATCH /api/skills/:id` | Update a skill |
| `DELETE /api/skills/:id` | Delete a skill |
| `/api/experience` | Manage professional experience |
| `/api/education` | Retrieve and manage education records |
| `/api/contact` | Process contact form submissions |
| `/api/uploads/projects` | Upload project images |
| `/api/auth/[...nextauth]` | Authentication handlers |

Protected operations require appropriate administrator authorization. Refer to the implementation for the supported HTTP methods and access rules for each endpoint.

---

## 🖼️ Image Storage

Project images are uploaded to Cloudinary. The application stores the returned image URL with the project record so images remain available in production rather than relying on temporary local uploads.

Configure Cloudinary credentials in your environment before using the upload functionality.

---

## ☁️ Deployment

The portfolio is deployed on Vercel.

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Configure the required environment variables for the Production environment.
4. Configure MongoDB Atlas network access for the deployed application.
5. Register the correct GitHub OAuth callback URL.
6. Verify Cloudinary and Resend configuration.
7. Deploy and test the public pages, admin panel, APIs, and contact form.

**Security note:** Avoid unrestricted database network access in production where a suitable restricted configuration is available.

---

## 👨‍💻 About Me

I'm Sachin Deshpande, a frontend developer with 4+ years of experience building responsive and user-friendly web applications.

My primary interests include React, Next.js, TypeScript, frontend performance, reusable component architecture, and full-stack web development.

---

## 📄 License

Add a license file if you intend to distribute this project under a specific open-source license. Otherwise, specify the applicable usage terms before redistributing the source code.
