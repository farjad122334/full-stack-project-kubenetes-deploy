# 🏝️ Safarnama - Tourism Management System

A comprehensive tourism platform enabling tour management, driver coordination, restaurant partnerships, and seamless booking experiences.

## 🚀 Live Demo
- **Frontend:** `http://18.206.145.114:30007`

## 🏗️ Architecture
```text
User → Browser → NodePort:30007 → Frontend Pod (Nginx)
                                        ↓
                                  /api/ requests
                                        ↓
                                 Backend Service (ClusterIP)
                                        ↓
                                 Backend Pod (.NET)
                                        ↓
                                 SQL Server (AWS RDS)
```

## 📁 Repository Structure
```text
safarnama/
├── backend/            # .NET 8 Web API
├── frontend/           # Angular 17 SPA with Nginx
├── deployments/        # Kubernetes Manifests (Deployments, Services, Configs)
├── FYP.sln            # Solution File
└── README.md           # Project Documentation
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Angular 17, Bootstrap, Chart.js |
| **Backend** | .NET 8, Entity Framework |
| **Database** | SQL Server 2022 (AWS RDS) |
| **Container** | Docker, KIND (Kubernetes in Docker) |
| **Cloud** | AWS EC2 |
| **Proxy** | Nginx |

## 🔧 Features

### 👤 User Roles
- **Tourists**: Browse tours, book packages, track history.
- **Drivers**: Accept trips, manage vehicles, view earnings.
- **Restaurants/Hotels**: Manage menu/rooms, handle orders.
- **Admin**: User management, tour planning, payment oversight.

### 💳 Integrations
- **Stripe** Payment Gateway for secure transactions.
- **Google Gemini AI** for automated document verification.
- **Cloudinary** for high-performance image storage.
- **SMTP** for reliable email notifications.

## 🐳 Deployment Architecture

### Local Development
```bash
# Backend
cd backend
dotnet run

# Frontend
cd frontend
ng serve
```

### Kubernetes Deployment
```bash
# Create namespace
kubectl create namespace safarnama

# Apply secrets and configs
kubectl apply -f deployments/secrets.yml
kubectl apply -f deployments/configmap.yml

# Deploy services
kubectl apply -f deployments/backend/deployment.yml
kubectl apply -f deployments/frontend/deployment.yml

# Expose services
kubectl expose deployment backend-deployment --type=ClusterIP --port=80 --target-port=8080 -n safarnama
kubectl expose deployment frontend-deployment --type=NodePort --port=80 --target-port=80 -n safarnama
```

## 🔥 Problem-Solving Highlights

### Challenge 1: Database Connectivity
**Issue:** Backend pods couldn't connect to RDS database.
**Solution:**
- Added inbound rules to RDS security group for EC2 VPC CIDR.
- Configured proper SQL Server connection string in Kubernetes secrets.
- Increased command timeout for migrations to handle network latency.

### Challenge 2: Frontend-Backend Communication
**Issue:** Angular app calling `localhost:5238` instead of the Kubernetes service.
**Solution:**
- Implemented **Nginx reverse proxy** in the frontend container.
- Configured `proxy_pass` for `/api/*` requests to the backend service.
- Enabled seamless communication without rebuilding the Angular application for different environments.

### Challenge 3: Service Discovery
**Issue:** Backend service targeting the wrong port (80 vs 8080).
**Solution:** Updated service `targetPort` to match the container's listening port (8080).

## 📊 Monitoring & Logs
```bash
# View logs
kubectl logs -f deployment/backend-deployment -n safarnama
kubectl logs -f deployment/frontend-deployment -n safarnama

# Port forwarding for local access
kubectl port-forward service/backend-service 8080:80 -n safarnama

# Check service endpoints
kubectl get endpoints -n safarnama
```

## 🚢 CI/CD Pipeline (GitHub Actions)
```yaml
name: Deploy to Kubernetes

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Build Backend Image
        run: docker build -t wantedmind11/backend:latest ./backend
        
      - name: Build Frontend Image
        run: docker build -t wantedmind11/frontend:latest ./frontend
        
      - name: Push to Docker Hub
        run: |
          docker push wantedmind11/backend:latest
          docker push wantedmind11/frontend:latest
          
      - name: Restart Deployments
        run: |
          kubectl rollout restart deployment/backend-deployment -n safarnama
          kubectl rollout restart deployment/frontend-deployment -n safarnama
```

## 🎯 Lessons Learned
- **Kubernetes Networking:** Deep understanding of ClusterIP, NodePort, and LoadBalancer.
- **Nginx Reverse Proxy:** Efficiently routing API requests without frontend rebuilds.
- **AWS Security Groups:** Least privilege configuration for RDS and EC2.
- **Docker Best Practices:** Multi-stage builds and image size optimization.
- **Troubleshooting:** Mastered `kubectl exec`, `curl`, and log analysis for debugging.

## 📞 Contact
- **GitHub:** (https://github.com/farjad122334)
- **LinkedIn:** www.linkedin.com/in/muhammad-farjad-b231a8299
- **Portfolio:** https://app.netlify.com/projects/farjad-porfolio/overview

## 🙏 Acknowledgments
- Stack Overflow community for troubleshooting help.
- Kubernetes documentation.
- AWS Free Tier for hosting.
