<div align="center">

# GARMENTLy

### Your intelligent digital wardrobe.

Organize your clothing, understand garment care, and create personalized outfits using pieces you already own.

<br />

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Powered-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-AI-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)

<br />
<br />

<a href="https://garmently-eta.vercel.app">
  <strong>Launch GARMENTLy →</strong>
</a>

<br />
<br />

[![Live Website](https://img.shields.io/badge/Live_Website-garmently--eta.vercel.app-C7A66A?style=flat-square&logo=vercel&logoColor=white)](https://garmently-eta.vercel.app)

</div>

---

## About GARMENTLy

GARMENTLy is an AI-powered virtual closet that transforms an existing wardrobe into an organized, private, and intelligent clothing-management system.

Users can photograph garments and care labels, receive AI-generated clothing details and care guidance, and build personalized outfits using items they already own.

> **Dress with intention. Care for what you own.**

---

## Live Prototype

The working GARMENTLy prototype is available at:

### [Visit GARMENTLy](https://garmently-eta.vercel.app)

The current version demonstrates the complete core experience, including wardrobe organization, AI garment analysis, clothing-care guidance, catalog-photo generation, and personalized outfit creation.

---

## Core Features

| | Feature | What it does |
|---|---|---|
| 👕 | **Digital Wardrobe** | Upload, organize, edit, and manage garments in one private closet. |
| ✨ | **AI Garment Analysis** | Identify likely categories, colors, materials, and garment details from photographs. |
| 🧺 | **Clothing Care Guidance** | Generate washing, drying, detergent, and care recommendations. |
| 🏷️ | **Care-Label and Barcode Scanning** | Scan clothing labels and supported barcodes to improve garment identification. |
| 📸 | **AI Catalog Photos** | Create cleaner catalog-style images for a more consistent digital wardrobe. |
| 🧥 | **Personalized Outfit Generation** | Build outfits using garments already saved in the user's closet. |
| 🔖 | **Saved Outfits** | Save generated looks for future occasions and styling inspiration. |
| 🔒 | **Private Accounts** | Protect user data and garment images using Supabase authentication and Row Level Security. |

---

## How It Works

1. **Create a private account**
2. **Upload a garment photograph**
3. **Add an optional care-label image or barcode**
4. **Allow Gemini to analyze the garment**
5. **Review and edit the generated information**
6. **Save the garment to your digital wardrobe**
7. **Generate outfits using your own collection**
8. **Save favorite looks for later**

---

## Product Experience

GARMENTLy is designed around a premium dark interface with neutral tones and muted gold accents.

- Responsive on desktop and mobile
- Simple wardrobe navigation
- Private garment-image storage
- Personalized garment details
- AI-supported care and styling tools
- Clean catalog-style presentation
- Outfit recommendations based on owned garments

<!--
Add a product screenshot to the repository at:

public/garmently-preview.png

Then remove the comment markers around the line below.

![GARMENTLy product preview](public/garmently-preview.png)
-->

---

## Technology Stack

| Area | Technology |
|---|---|
| Framework | Next.js |
| Language | TypeScript |
| Interface | React and Tailwind CSS |
| Authentication | Supabase Auth |
| Database | Supabase PostgreSQL |
| Image Storage | Supabase Storage |
| Artificial Intelligence | Google Gemini API |
| Barcode Scanning | ZXing |
| Validation | Zod |
| Deployment | Vercel |

---

## Current Infrastructure

GARMENTLy is currently operating as an early-stage prototype using the free development tiers of:

- Google Gemini API
- Supabase
- Vercel

These services currently support product demonstrations, testing, and early user feedback while allowing the core experience to be developed efficiently.

Because this is a prototype, the platform may currently experience limitations involving:

- AI request volume
- Processing speed
- Database usage
- Image-storage capacity
- Simultaneous users
- AI model availability

As GARMENTLy grows and additional funding becomes available, the platform will move toward paid infrastructure to support:

- Higher AI request limits
- Faster and more reliable processing
- Expanded database and storage capacity
- Improved monitoring and security
- More simultaneous users
- More advanced AI personalization
- Greater production reliability

The current infrastructure is intended to validate the product experience before expanding GARMENTLy for larger-scale use.

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/garmently.git
cd garmently
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env.local`

Create a file named `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Start the development server

```bash
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

---

## Production Build

Test the production version locally:

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Connects GARMENTLy to the Supabase project |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Enables client access through configured Supabase security policies |
| `GEMINI_API_KEY` | Enables server-side AI garment analysis and outfit generation |

> Never commit `.env.local` or private API keys to GitHub.

---

## Project Status

### Working early-stage prototype

GARMENTLy currently demonstrates the complete core product experience.

Currently implemented:

- User authentication
- Private digital wardrobes
- Garment and care-label image uploads
- AI garment analysis
- Clothing-care recommendations
- Barcode scanning
- AI catalog-photo generation
- Personalized outfit generation
- Saved outfits
- Responsive interface
- Live Vercel deployment

The platform is actively being tested and improved before wider public release.

---

## Roadmap

- [ ] Weather-aware outfit recommendations
- [ ] Occasion and dress-code personalization
- [ ] Wardrobe usage analytics
- [ ] Clothing-care history
- [ ] Improved garment recognition
- [ ] Wardrobe-gap recommendations
- [ ] Social outfit sharing
- [ ] Expanded user personalization
- [ ] Native mobile application
- [ ] Paid production infrastructure

---

## Founders

GARMENTLy was created by **Talal Mehmood and Malasa Khan**.

---

## Disclaimer

AI-generated garment information and care recommendations should be reviewed alongside the official care label provided by the clothing manufacturer.

<div align="center">

### GARMENTLy

**Your wardrobe. Better understood.**

<br />

<a href="https://garmently-eta.vercel.app">
  <strong>Explore the Live Prototype →</strong>
</a>

</div>
