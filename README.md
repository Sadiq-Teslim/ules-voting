# ULES Awards - Voting Platform Frontend

This is the official frontend for the **University of Lagos Engineering Society (ULES) Annual Awards**. It's a modern, responsive web application built with **React**, **Vite**, and **TypeScript**, providing a seamless experience for students to nominate candidates and cast their votes. It also includes a comprehensive, secure admin dashboard for managing the election.

---

## Key Features

* **Dynamic Landing Page**: A visually engaging homepage with animated elements and clear instructions.
* **Secure Voter Validation**: A modal-based system that communicates with the backend to verify student eligibility before granting access.
* **Interactive Voting Page**: A dynamically generated interface that displays all official categories and nominees, providing a clear and satisfying voting experience.
* **Public Nomination Form**: Allows any student to nominate candidates for multiple categories, including an optional image upload to Cloudinary.
* **Comprehensive Admin Dashboard**:

  * Secure password-protected access.
  * Live, auto-refreshing vote results displayed in both numerical tallies and bar charts.
  * A "Manage Nominations" tab to review pending submissions.
  * An "Election Settings" tab to open/close voting and reset nominations.
  * **PDF Export** functionality to download official results.
* **Fully Responsive Design**: Optimized for a seamless experience on desktop, tablet, and mobile devices.

---

## Tech Stack

* **Framework**: React with TypeScript
* **Build Tool**: Vite
* **Styling**: Tailwind CSS
* **API Communication**: Axios
* **Routing**: Wouter
* **Charts & Visuals**: Chart.js, Lucide Icons
* **PDF Generation**: jsPDF, html2canvas

---

## Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) (v18+ recommended)
* npm or yarn
* A running instance of the [ULES Voting Backend](https://github.com/Sadiq-Teslim/ules-voting-backend.git).

### Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Sadiq-Teslim/ules-voting.git
   cd ules-voting
   cd ules-voting-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a file named `.env` in the root of the frontend folder. This file is for **local development only**.

   ```
   # .env

   # The URL of your local backend server
   VITE_API_BASE_URL=http://localhost:4000

   # Your Cloudinary account details for image uploads
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
   ```

### Running the Development Server

To start the Vite development server, run:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Deployment

This frontend is designed for and deployed on **Netlify**.

* **Build Command**: `npm run build`
* **Publish Directory**: `dist`
* The `netlify.toml` file in the repository root handles the necessary redirect rules for a single-page application.
* All `VITE_` environment variables must be set in the **Netlify dashboard** under Site settings > Build & deploy > Environment for the live site to function correctly.

---

**Contributions & feedback are welcome!** 🎉

**Built by Sadiq Teslim Adetola** 🎉