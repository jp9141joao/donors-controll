# 🩺 **Donor Control System (Node.js + Prisma)** 💾

This project implements a donor management system, handling donors, families, donations, and financial transactions with secure routes using **Node.js**, **Express**, **Prisma**, and permission-based authentication. The system is designed to provide CRUD operations and secure handling of data related to donors and their donations.

---

## **Notes**

\-- Only the donor module was uploaded to this Git repository for security reasons.
If you are interested in other parts of the code, please contact us.

---

## 🚀 **Project Overview**

This project aims to:

* Manage data of **donors**, **families**, **donations**, and **PIX transactions**.
* Provide a RESTful API with secure routes through **role-based permission authentication**.
* Use **Prisma ORM** to manage database interactions.
* Automatically document routes using **Swagger**.

---

## 🛠️ **Project Structure**

The system consists of the following components:

```
/donors-system
│
├── /controllers          # Contains the core logic for each operation.
│   ├── index.js          # Functions for CRUD operations control.
│
├── /routes               # Main routes with secure access.
│   └── index.js
│
├── /middlewares          # Logic to verify permissions and authorizations.
│   └── verify-permissions.middleware.js
│
├── /prisma               # Configuration for Prisma database interactions.
│   └── schema.prisma
│
├── /docs                 # Swagger documentation.
│   └── swagger.json
│
├── server.js             # Main configuration to initialize Express.
│
├── package.json          # npm package management.
│
└── README.md             # Project documentation.
```

---

## ⚙️ **Setup**

### Prerequisites

Make sure you have the following installed on your machine:

1. **Node.js**: [Install Node.js here](https://nodejs.org/).
2. **Prisma ORM**: Configure it with your preferred database.

---

### Installation

1. Clone the repository:

```bash
git clone https://github.com/jp9141joao/donors-controll.git
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database with Prisma:

```bash
npx prisma migrate dev
```

4. Start the server:

```bash
npm run dev
```

The application will now be running. You can access the routes and the Swagger documentation automatically at `http://localhost:3000/docs`.

---

## 📂 **Data Structure**

The system data is organized into 4 main tables:

* **Donors**: Contains information about all donors.
* **Families**: Contains data about donors’ families.
* **Donations**: Records of donations made.
* **Pix Donations**: Financial transactions of the PIX type.
* **Items Donations**: Detailed information about items involved in donations.

---

Now you’re ready to use, test, and contribute to the **Donor Control System!** ✨🖥️
