# MiniCRM – Client Lead Management System

A full-stack Client Lead Management System designed to capture, organize, track, and manage leads generated through website contact forms.

## 🚀 Project Overview

MiniCRM provides a simple and professional interface for administrators to manage the complete lead lifecycle from initial enquiry to conversion.

The system connects a React frontend with a Node.js/Express backend and MongoDB database.

## ✨ Features

### 📊 Dashboard
- Lead overview and key metrics
- Lead pipeline summary
- Priority lead tracking
- Overdue follow-up monitoring
- CRM activity insights

### 👥 Lead Management
- View all leads in one place
- Add new leads
- Update lead information
- Search and filter leads
- Delete leads
- Lead status management

### 🔄 Lead Status
Leads can be tracked through different stages:

- New
- Contacted
- Converted
- Not Interested

### 📝 Notes & Follow-ups
- Add notes to leads
- Schedule follow-ups
- Track upcoming actions
- Monitor overdue follow-ups

### 📈 Analytics
- Lead pipeline visualization
- Lead source analysis
- Conversion insights
- Lead aging
- CRM health metrics

### 🔐 Admin Authentication
- Secure admin login
- JWT-based authentication
- Protected CRM APIs
- Environment-based credentials

### 🌐 Website Lead Capture
Website visitors can submit their details through a contact form.

Submitted leads are automatically stored in the CRM with:

- Name
- Email
- Phone
- Source
- Status
- Notes

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- Axios
- Lucide React
- Recharts

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- CORS
- dotenv

## 📁 Project Structure

```text
MiniCRM/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   └── Lead.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── leads.js
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md