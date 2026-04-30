# Ayuuto

Ayuuto is a community savings application based on rotating savings groups. Users can create groups, join groups, view group members, make contributions, and track payouts.

This project is built as a full-stack application with a React/Vite front end and a Node.js/Express/PostgreSQL back end.

---

## Project Overview

Ayuuto helps users manage group savings circles where members contribute money on a schedule and receive payouts based on the group payout order.

Current features include:

- User sign up and login
- Firebase authentication
- Create savings groups
- View groups on the dashboard
- Join groups using a group ID
- View group details
- View group members
- Make contributions
- Create and view payouts
- Backend routes for members, groups, memberships, contributions, payouts, and invitations

---

## Tech Stack

### Front End

- React
- Vite
- JavaScript
- Bootstrap 5
- React-Bootstrap
- Material UI
- Emotion styling

### Back End

- Node.js
- Express.js
- PostgreSQL
- Firebase Admin SDK
- Firebase token authentication middleware
- REST API routes

---

## Project Structure

```txt
Ayuuto/
│
├── front-end/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── back-end/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── model/
│   │   ├── utils/
│   │   └── server.js
│   │
│   ├── schema/
│   ├── package.json
│   └── dbConnection.js
│
└── README.md
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Ayuuto
```

---

## Back-End Setup

### 2. Go to the Back-End Folder

```bash
cd back-end
```

### 3. Install Back-End Dependencies

```bash
npm install
```

### 4. Set Up the Database

Create a PostgreSQL database, then run the schema file:

```bash
psql -d ayuuto_db -f schema/schema.sql
```

### 5. Start the Back-End Server

```bash
npm start
```

The back-end server runs on:

```txt
http://localhost:3001
```

---

## Front-End Setup

### 6. Go to the Front-End Folder

Open a second terminal:

```bash
cd front-end
```

### 7. Install Front-End Dependencies

```bash
npm install
```

### 8. Start the Front-End Development Server

```bash
npm run dev
```

The front end usually runs on:

```txt
http://localhost:5173
```

---

## Main API Routes

### Member Routes

```txt
GET    /member
GET    /member/me
GET    /member/:id
GET    /member/firebase/:uid
POST   /member
```

### Group Routes

```txt
POST   /group
GET    /group/:id
GET    /group/:id/members
PUT    /group/:id
```

### Membership Routes

```txt
POST   /membership
GET    /membership/group/:id
GET    /membership/member/:id
PUT    /membership/:id
```

### Contribution Routes

```txt
POST   /contribution
GET    /contribution/group/:id
GET    /contribution/member/:id
```

### Payout Routes

```txt
POST   /payout
GET    /payout/group/:id
GET    /payout/member/:id
PUT    /payout/:id
```

### Invitation Routes

```txt
POST   /invitation
GET    /invitation/group/:id
PUT    /invitation/:id
```

---

## Authentication

Ayuuto uses Firebase Authentication on the front end.

The front end sends the Firebase token in the request header:

```txt
Authorization: Bearer <firebase-token>
```

The back end verifies the token using Firebase Admin middleware before allowing access to protected routes.

---

## Build for Production

From the front-end folder:

```bash
npm run build
```

---

## Dependencies

### Front-End Dependencies

```txt
react
react-dom
vite
bootstrap
react-bootstrap
@mui/material
@mui/icons-material
@emotion/react
@emotion/styled
```

### Back-End Dependencies

```txt
express
cors
pg
firebase-admin
dotenv
```

---
 
 

 

