# FraudGuard AI — Operations Runbook & Setup Guide

## Quick Start (PowerShell)

### Prerequisites
- Python 3.10+ (Installed: Python 3.13)
- Node.js 18+ (Installed: Node v24)
- Windows PowerShell

---

### Step 1: Start Backend API Service
Open a PowerShell terminal and run:

```powershell
# Navigate to the project backend
cd "C:\Users\badri\Desktop\FraudGuard-AI\backend"

# Activate Python Virtual Environment
.\venv\Scripts\Activate.ps1

# Run the FastAPI server with Uvicorn
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API and Swagger docs will be live at:
- **API URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

---

### Step 2: Start Frontend Application
Open a second PowerShell terminal and run:

```powershell
# Navigate to the project frontend
cd "C:\Users\badri\Desktop\FraudGuard-AI\frontend"

# Start the Vite development server
npm run dev
```
The frontend UI will be live at:
- **Web Application URL**: `http://localhost:5173`

---

### Step 3: Run Backend Tests
To verify all unit tests, model scoring, and API endpoints:

```powershell
cd "C:\Users\badri\Desktop\FraudGuard-AI\backend"
.\venv\Scripts\pytest.exe tests -v
```

---

### Default Login Accounts
| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@fraudguard.ai` | `Admin@123` |
| **Analyst** | `analyst@fraudguard.ai` | `Analyst@123` |
| **Auditor** | `auditor@fraudguard.ai` | `Auditor@123` |
