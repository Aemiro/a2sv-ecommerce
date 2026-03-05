# 🧩 Product & Order Management API

This project is a backend service built with **NestJS** that provides APIs for managing **Products** and **Orders**.  
It includes **file upload**, **advanced filtering**, and **Docker-based setup** for easy deployment.

---

## 🚀 Features

- **Product Management**
  - Create, update, delete, and list products
  - Upload product images or files
  - Advanced filtering support (e.g., filter by price, category, etc.)

- **Order Management**
  - Customers can order multiple products at a time
  - View order details with associated products
  - Track order status

- **Advanced Filtering**
  - Supports flexible query filters such as:
    ```
    filter[0][0].field=price&filter[0][0].operator=>=&filter[0][0].value=10
    ```
  - Allows multiple filter conditions in a single request

- **File Upload**
  - Supports uploading single or multiple files
  - Stores metadata and file paths securely

- **Role-based Access (Guard)**
  - Custom `RoleGuard` for protecting endpoints
  - Supports roles like `admin`, `user`, and `super_admin`

---

## 🧱 Tech Stack

- **NestJS**
- **TypeORM**
- **PostgreSQL**
- **Minio**
- **Redis**
- **Docker & Docker Compose**
- **Multer (File Uploads)**
- **Swagger (API Documentation)**

---

## ⚙️ Getting Started

### 1. Clone the repository

``` bash
git clone https://github.com/Aemiro/a2sv-ecommerce.git

cd a2sv-ecommerce
```

### 2. Start with Docker

Ensure Docker and Docker Compose are installed.

docker-compose up -d --build

  . This will automatically:

  . Build the NestJS service

  . Spin up the PostgreSQL database, Minio, and Redis 


### 🔑 Default Demo User

The system includes a **default admin account** for testing and demonstration purposes.  
This user is automatically seeded when the application starts.

**Credentials:**

``` json
{
  "email": "admin@gmail.com",
  "password": "P@ssw0rd2018"
}