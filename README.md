# 📦 Stockflow | Smart Inventory & Order Management System

[![Docker Build & Push](https://img.shields.io/badge/Docker-Build%20%26%20Push-blue?logo=docker&logoColor=white)](./build-and-push.ps1)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2015-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**Stockflow** is a modern, production-ready, full-stack SaaS platform designed for tracking products, managing customer records, processing orders, and visualizing sales metrics in real-time.

It features a high-fidelity responsive user interface, atomic database transactions with automatic rollback safety, and complete containerization for local development and cloud deployment.

---

## ✨ Features & Capabilities

- **📊 Dashboard**: Real-time sales metrics, charts, and aggregated database telemetry.
- **🛍️ Product Catalog**: Manage products, pricing, stock levels, and category structures.
- **👥 Customer Directory**: Maintain detailed customer records and purchase logs.
- **📋 Order Pipeline**: Track orders, calculate automatic totals, and manage fulfillment status.
- **🛡️ Transaction Safety**: Automatic rollback on order failures ensuring strict inventory counts.
- **🚀 DevOps Ready**: Automated PowerShell Docker build scripts and complete multi-container setup.

---

## 🛠️ Technology Stack

| Component | Technology | Key Libraries / Frameworks |
| :--- | :--- | :--- |
| **Frontend** | React 19 & Vite | Material-UI v6, React Hook Form, React Router v6, Recharts, Axios |
| **Backend** | Python 3.11 | FastAPI, SQLAlchemy ORM, Pydantic v2, Alembic Migrations, Pytest |
| **Database** | PostgreSQL 15 | Relational database schema with indexes and constraints |
| **DevOps** | Docker | Docker Compose, Multi-stage Production Nginx Dockerfile |

---

## 📁 Directory Structure

```text
inventory-management-system/
├── client/                 # React Frontend Application
│   ├── src/                # Source code (Components, Pages, Themes, Services)
│   ├── Dockerfile          # Dev server container configuration
│   ├── Dockerfile.prod     # Production-optimized Nginx build
│   └── package.json        # Dependencies & build scripts
│
├── server/                 # FastAPI Backend Application
│   ├── app/                # Application modules (API routers, Models, Schemas, Core)
│   ├── alembic/            # Database migration versions
│   ├── tests/              # Automated unit & integration tests
│   ├── Dockerfile          # Python application container configuration
│   └── requirements.txt    # Python dependencies
│
├── docker-compose.yml      # Multi-container orchestration (Db, Server, Client)
├── build-and-push.ps1      # PowerShell automation script for Docker Hub
└── .gitignore              # Git ignored files & paths
```

---

## 🚀 Quick Start Setup

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git (configured)

### 1. Booting with Docker Compose
The easiest way to launch the entire environment (Database, Backend API, React Client) with a single command:

1. Clone this repository.
2. Copy the sample environment settings to the server directory:
   ```bash
   cp .env.example server/.env
   ```
3. Run docker compose:
   ```bash
   docker compose up --build
   ```
4. Access the applications:
   - 💻 **React Client**: [http://localhost:5173](http://localhost:5173) (credentials: `admin@stockflow.com` / `password123`)
   - ⚙️ **FastAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - 🗄️ **PostgreSQL Database**: Port `5432`

---

## 🐳 Docker Automation Script

A custom PowerShell script is included at the root to automate building, tagging, and pushing client & server images to a Docker Registry:

```powershell
# Build and push to your Docker Hub username
.\build-and-push.ps1 -DockerUsername "yourusername"

# Build only (skip push for local validation)
.\build-and-push.ps1 -SkipPush

# Specify a custom version tag
.\build-and-push.ps1 -DockerUsername "yourusername" -Tag "v1.0.0"
```

---

## 🧪 Local Development (Without Docker)

### 1. Backend Setup
1. Navigate to `/server` directory:
   ```bash
   cd server
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies & run migrations:
   ```bash
   pip install -r requirements.txt
   cp .env.example .env
   alembic upgrade head
   ```
4. Launch FastAPI:
   ```bash
   uvicorn app.main:app --reload
   ```

### 2. Frontend Setup
1. Navigate to `/client` directory:
   ```bash
   cd ../client
   ```
2. Install npm dependencies and start the dev server:
   ```bash
   npm install
   npm run dev
   ```

---

## 🔒 Business & Transaction Rules

1. **Inventory Reservation**: Placing an order checks the stock of each product. If any item has insufficient stock, the transaction is rejected instantly (`HTTP 400`).
2. **Atomic Rollback**: If an order contains multiple products and one fails stock verification, the entire database transaction is rolled back. No partial order is persisted.
3. **Fulfillment Sync**: Changing an order status to `Cancelled` increments product stock back by the ordered quantities. Re-confirming a cancelled order decrements stock if inventory is available.
4. **Relational Constraints**: Customers or products linked to existing orders cannot be deleted to prevent data orphaning.
