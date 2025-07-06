# Coding Platform

A full-stack coding contest platform with code execution, user management, and admin features. Built with Java Spring Boot (backend), React (frontend), MongoDB, RabbitMQ, and Judge0 for code execution.

---

## Features
- User registration, login, and roles (admin/user)
- Admin dashboard for managing users, questions, and tests
- Code execution and test case evaluation via Judge0
- Real-time code submission and result display
- Asynchronous, scalable backend endpoints
- WLAN-ready: accessible to all users on the same network
- Docker and Kubernetes deployment support

---

## Tech Stack
- **Backend:** Java 17, Spring Boot, MongoDB, RabbitMQ, OkHttp, JWT
- **Frontend:** React, Bootstrap, TailwindCSS, Axios
- **Code Execution:** Judge0 (Dockerized)
- **DevOps:** Docker, Docker Compose, Kubernetes, Minikube

---

## Prerequisites
- Java 17
- Node.js (for frontend)
- MongoDB (port 27017)
- RabbitMQ (port 5672)
- Docker (for Judge0 and containerization)
- (Optional) Minikube or Docker Desktop for Kubernetes

---

## Local Development Setup

### 1. **Start Judge0**
- Download and run Judge0 (see [Judge0 docs](https://github.com/judge0/judge0)).
- Example (Docker):
  ```sh
  docker run -d --name judge0 -p 2358:2358 judge0/judge0:latest
  ```

### 2. **Start Backend**
```sh
cd coding
mvn spring-boot:run
```

### 3. **Start Frontend**
```sh
cd frontend
npm install
npm start -- --host 0.0.0.0
```

### 4. **Access the App**
- Frontend: [http://<YOUR_IP>:3000](http://<YOUR_IP>:3000)
- Backend API: [http://<YOUR_IP>:8080](http://<YOUR_IP>:8080)
- Judge0: [http://<YOUR_IP>:2358/docs](http://<YOUR_IP>:2358/docs)

---

## Docker Deployment

### Backend
```sh
cd coding
docker build -t yourusername/coding:latest .
docker run -d -p 8080:8080 \
  -e JUDGE0_API_URL=http://<JUDGE0_IP>:2358 \
  yourusername/coding:latest
```

### Frontend
```sh
cd frontend
docker build -t yourusername/frontend:latest .
docker run -d -p 3000:80 yourusername/frontend:latest
```

---

## Kubernetes Deployment

1. Build and push Docker images to a registry.
2. Apply the deployment YAMLs:
   ```sh
   kubectl apply -f coding/backend-deployment.yaml
   kubectl apply -f frontend/frontend-deployment.yaml
   ```
3. Expose services as needed (see Minikube or Ingress docs).

---

## Environment Configuration

- **Backend:**
  - `coding/src/main/resources/application.properties`
    - `server.address=0.0.0.0` (bind to all interfaces)
    - `judge0.api.url` (set to Judge0 server IP)
  - Or set `JUDGE0_API_URL` as an environment variable (recommended for Docker/K8s)
- **Frontend:**
  - `.env` or `package.json` proxy/start script for backend API URL

---

## Troubleshooting
- **Port in use:** Use `netstat`/`taskkill` to free ports 8080, 3000, 2358
- **Firewall:** Allow ports 8080, 3000, 2358 through Windows Firewall
- **Network:** Use your machine's IP, not `localhost`, for WLAN access
- **Judge0 not reachable:** Ensure Docker port mapping is `2358:2358` and firewall allows 2358
- **Kubernetes:** Use `kubectl get pods` and `kubectl logs` to debug

---

## Security Notes
- Use strong passwords for admin accounts
- Secure your WLAN
- For production, use HTTPS and a reverse proxy (nginx)

---

## Credits
- [Judge0](https://github.com/judge0/judge0)
- [Spring Boot](https://spring.io/projects/spring-boot)
- [React](https://reactjs.org/)

---
---

## License

This project is licensed under the [Apache License 2.0](LICENSE).

You are free to use, modify, and distribute this code for personal, educational, or commercial purposes, provided you retain the license and copyright.

See the [NOTICE](NOTICE) file for attribution details.
