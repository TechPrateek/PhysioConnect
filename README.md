<div align="center">

<img src="public/icon.svg" alt="PhysioConnect Logo" width="72" height="72" />

# PhysioConnect

### India's First On-Demand Physiotherapy Booking Platform

**Expert physiotherapy at your doorstep or nearby clinic — verified, trusted, instant.**

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-physioconnect--xi.vercel.app-0d9488?style=for-the-badge)](https://physioconnect-xi.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js%2015-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)

> ⚕️ **Pilot Active** — Currently live in Etawah, Uttar Pradesh, India
> Pan-India expansion planned.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [User Roles](#-user-roles)
- [Roadmap](#-roadmap)
- [License & Intellectual Property](#-license--intellectual-property)

---

## 🏥 Overview

**PhysioConnect** bridges the gap between patients needing physiotherapy care and verified, licensed physiotherapists in India. It eliminates the friction of traditional clinic walk-ins by enabling:

- 📍 **On-Demand Home Visits** — Patients request a physiotherapist to come directly to their home
- 🏨 **Clinic Consultations** — Book a scheduled slot at the physiotherapist's clinic
- ⚡ **Instant Matching** — Real-time service request system with multiple physiotherapists simultaneously

The platform is **admin-verified** — every physiotherapist must hold a BPT/MPT degree and pass document verification before being listed.

---

## ✨ Key Features

### For Patients
| Feature | Description |
|---|---|
| 🔍 **Browse & Search** | Find physiotherapists by name, specialization, complaint, or visit type |
| ⚡ **On-Demand Requests** | Instant requests with realistic arrival windows (45 min / 1-2 hr / Evening) |
| 📅 **Scheduled Bookings** | Book in advance with specific date & time slot selection |
| 🏠 **Home & Clinic Visits** | Choose between home visits or clinic consultations |
| 💳 **Payment Tracking** | Full fee transparency — no hidden charges |
| 📊 **Booking History** | 6-stage milestone audit trail with exact timestamps |
| 📍 **Address Management** | Save multiple home/office addresses for quick booking |
| ⭐ **Reviews & Ratings** | Leave verified reviews after completed sessions |

### For Physiotherapists
| Feature | Description |
|---|---|
| 📋 **Profile Management** | Complete professional profile with qualifications, specializations, availability |
| 📨 **Live Offer Panel** | Real-time incoming booking offers with accept/reject controls |
| 📅 **Schedule Management** | Set weekly availability slots and visit type preferences |
| 💰 **Fee Configuration** | Set home visit and clinic visit fees independently |
| 📈 **Dashboard Analytics** | Earnings overview, booking stats, session history |

### For Admins
| Feature | Description |
|---|---|
| ✅ **Verification System** | Review BPT/MPT credentials and approve/reject physiotherapists |
| 👥 **User Management** | Manage patients, physiotherapists, and system users |
| 📊 **Platform Overview** | Monitor all bookings, payments, and service requests |
| 🏷️ **Specializations** | Manage medical specialization categories |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 3, Custom Glass Island Design System |
| **UI Components** | Lucide React, Framer Motion, Radix UI primitives |
| **Authentication** | Better Auth v1 (sessions, roles, email/password) |
| **Database ORM** | Prisma 6 |
| **Database** | PostgreSQL (Neon Serverless) |
| **Payment** | Razorpay Integration |
| **Forms** | React Hook Form + Zod validation |
| **Deployment** | Vercel (Edge Network) |
| **Password Hashing** | Argon2 |
| **Theme** | next-themes (System / Light / Dark) |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    PhysioConnect                         │
│                                                          │
│  ┌──────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │  Patient  │    │ Physiotherapist│  │     Admin     │  │
│  └─────┬────┘    └──────┬───────┘    └───────┬───────┘  │
│        │                │                    │           │
│        ▼                ▼                    ▼           │
│  ┌─────────────────────────────────────────────────┐    │
│  │          Next.js 15 App Router (SSR + Client)   │    │
│  │     Server Actions · API Routes · Middleware     │    │
│  └──────────────────────┬──────────────────────────┘    │
│                         │                                │
│  ┌──────────────────────▼──────────────────────────┐    │
│  │            Better Auth (Session Layer)           │    │
│  └──────────────────────┬──────────────────────────┘    │
│                         │                                │
│  ┌──────────────────────▼──────────────────────────┐    │
│  │         Prisma ORM · PostgreSQL (Neon)           │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Core Flows

**On-Demand Booking Flow:**
```
Patient Creates Request
        │
        ▼
System Notifies Nearby Physiotherapists (real-time)
        │
        ▼
Physio Reviews & Accepts Offer
        │
        ▼
Booking Confirmed → Travel Prep Window
        │
        ▼
Session In Progress → Completed
        │
        ▼
Payment Recorded → Patient Leaves Review
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (or [Neon](https://neon.tech) free tier)
- npm / yarn / pnpm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/TechPrateek/PhysioConnect.git
cd PhysioConnect

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your DATABASE_URL, BETTER_AUTH_SECRET, etc.

# 4. Run database migrations
npx prisma migrate deploy

# 5. Seed the database (adds specializations + sample data)
npm run prisma:seed

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 🔐 Environment Variables

Create a `.env` file in the root with the following:

```env
# Database (Neon PostgreSQL or any PostgreSQL URL)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Auth Secret (generate with: openssl rand -base64 32)
BETTER_AUTH_SECRET="your-secret-key-here"

# App URL
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Razorpay (optional, for payment features)
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="your-secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
```

---

## 🗄 Database Schema

Key models in the system:

```
User ──────────────────┐
  ├── PatientProfile   │  (Patient details, addresses)
  └── PhysioProfile    │  (Doctor qualifications, availability, fees)
                       │
Booking ───────────────┤  (Scheduled sessions with status lifecycle)
ServiceRequest ────────┤  (On-demand instant matching system)
ServiceRequestOffer ───┤  (Physio acceptance/rejection of requests)
Payment ───────────────┤  (Fee tracking per booking)
Review ────────────────┤  (Post-session patient reviews)
Specialization ────────┘  (Medical specialization categories)
```

---

## 👥 User Roles

| Role | Access | Registration |
|---|---|---|
| **PATIENT** | Browse doctors, book sessions, manage addresses, view history | Self-register |
| **PHYSIOTHERAPIST** | Manage profile, accept/reject bookings, view earnings | Self-register → Admin verification |
| **ADMIN** | Full platform control, verify doctors, manage all data | Seeded manually |

**Default Admin Credentials (seeded):**
```
Email:    admin@physioconnect.in
Password: Admin@123
```
> ⚠️ Change these immediately in production!

---

## 🗺 Roadmap

- [x] Patient & Physiotherapist registration + auth
- [x] Admin verification workflow
- [x] Browse & search physiotherapists
- [x] Scheduled booking system
- [x] On-demand instant request system
- [x] Real-time offer panel for physiotherapists
- [x] Arrival window / travel buffer system
- [x] Booking history with milestone timestamps
- [x] Review & rating system
- [x] Razorpay payment integration
- [x] Glass Island Design System (light + dark mode)
- [x] Mobile-optimized responsive UI
- [x] Deployed on Vercel + Neon PostgreSQL
- [ ] Push notifications (FCM / Web Push)
- [ ] In-app chat (Patient ↔ Physiotherapist)
- [ ] Video consultation module
- [ ] AI-based physiotherapist recommendation engine
- [ ] Multi-city expansion beyond Etawah
- [ ] Mobile apps (React Native / Flutter)
- [ ] Insurance & health card integration

---

## 📄 License & Intellectual Property

```
Copyright (c) 2026 PhysioConnect — All Rights Reserved

This project and its source code, design system, business logic,
and associated assets are proprietary and confidential.

Unauthorized copying, distribution, modification, or commercial use
of this software, in whole or in part, without express written
permission from the author is strictly prohibited.

For licensing inquiries, contact: admin@physioconnect.in
```

> **⚖️ Patent Notice:** This platform's on-demand physiotherapy matching system,
> real-time offer routing mechanism, and arrival-window booking flow are
> original innovations currently under IP protection review.
> All rights reserved. Do not replicate or reproduce without written consent.

---

<div align="center">

**Built with ❤️ for India's healthcare future**

*Etawah → India → The World*

[![Made in India](https://img.shields.io/badge/Made%20in-India%20🇮🇳-FF9933?style=flat-square)](https://github.com/TechPrateek/PhysioConnect)

</div>
