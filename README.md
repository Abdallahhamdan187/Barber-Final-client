# 💈 Barber Shop Frontend (React)

This is the frontend of a full-stack **Barber Shop Appointment Management System** built with **React + Vite**.

---

## 🎯 Description

The app supports two types of users:

- 👤 **Regular Users**
  - Sign up and log in
  - View available barbers and services
  - Book appointments
  - View and manage their appointments (cancel if needed)
  

- 🛠️ **Admin Users**
  - Access a dedicated admin dashboard
  - View all appointments
  - Approve, reject, complete, or delete appointments
  - Manage services (add, edit, delete)
  - Manage barbers (add, edit, remove)
  - Manage registered users

All data is handled through a backend API and persisted in a **PostgreSQL** database.

---

## 🧑‍💻 User Requirements

- Login or Sign Up using email and password
- Role-based access (user/admin)
- **Admins** can:
  - Manage appointments
  - Manage services
  - Manage barbers
  - Manage users
- **Regular users** can:
  - Book appointments
  - View appointment history


---

## 🛠️ Technologies

- React 18
- Vite
- React Router
- Fetch API
- Tailwind CSS
- LocalStorage (session persistence)

---

## 🚀 Getting Started

```bash
cd final-barber-client
npm install
npm run dev
```

## Project Structure 
```bash
src/
 ├── componants/
 │   ├── AdminDashboard.jsx
 │   ├── AdminAppointments.jsx
 │   ├── AdminServices.jsx
 │   ├── AdminBarbers.jsx
 │   ├── AdminUsers.jsx
 │   ├── UserDashboard.jsx
 │   ├── UserAppointments.jsx
 │   ├── BookAppointment.jsx
 │   ├── AuthPage.jsx
 │   ├── LandingPage.jsx
 │   ├── Navbar.jsx
 │   ├── Footer.jsx
 │   └── ActionModal.jsx
 ├── Style/
 ├── assets/
 ├── App.jsx
 └── main.jsx
 ```

 ## 🔐 Authentication & Authorization

- Authentication is handled via backend API endpoints
- Role-based routing ensures:
  - Admin-only access to admin pages
  - User-only access to booking and personal dashboards
- Unauthorized access redirects users appropriately

---

## ✅ Key Features

- Role-based UI and routing
- Appointment booking system
- Admin management dashboard
- Confirmation modals for critical actions
- Clean, modular component structure

