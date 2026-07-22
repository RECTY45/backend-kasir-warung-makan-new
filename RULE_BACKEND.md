## 📌 RULE BACKEND

---

## 🎯 1. Arsitektur Backend

### 🧠 Konsep

- Clean Architecture (modular)
- REST API + WebSocket (real-time)
- Role-based access control (RBAC)
- Stateless + JWT Auth
- Support Guest (QR Mode)

### 🏗️ Struktur Arsitektur

```

Client (Vue / WhatsApp Bot)
        ↓
Controller (NestJS)
        ↓
Service (Business Logic)
        ↓
Repository / ORM
        ↓
Database

```

---

## ⚙️ 2. Teknologi

### 🧩 Core

- NestJS
- TypeScript
- MySQL
- Prisma

### 🔐 Auth

- JWT
- Passport.js
- OAuth Google (optional)

### 🔄 Realtime

- WebSocket (Socket.io)

### 🤖 Chatbot

- Webhook API (Venom-bot / WA)
- NLP service (optional)

### 📦 Others

= Redis (cache & session)

- Bull Queue (job queue - notifikasi, chatbot)

---

## 🧩 3. Struktur Module NestJS

```
src/
│
├── modules/
│   ├── auth/
│   ├── users/
│   ├── menus/
│   ├── categories/
│   ├── carts/
│   ├── orders/
│   ├── payments/
│   ├── deliveries/
│   ├── tables/
│   ├── guest/
│   ├── chatbot/
│   ├── vouchers/
│
├── common/
│   ├── guards/
│   ├── decorators/
│   ├── interceptors/
│
├── config/
├── database/
```

---

## 🔐 4. Role & Authorization

### 🎭 Roles

1. ADMIN
2. CUSTOMER
3. KASIR
4. KITCHEN
5. DRIVER
6. GUEST (QR)

### 🛡️ Guard Example

```
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
```

### 🔁 Middleware

- AuthGuard (JWT)
- RoleGuard

---

## 🪑 5. QR Code Flow (Guest Mode)

### 🔁 Flow

```
Scan QR → /qr/:table_id
        ↓
Create guest_session
        ↓
Return token (guest_token)
        ↓
Use token untuk order
```

### 📌 Endpoint

````
GET /qr/:table_id
``

Response JSON

```json
{
  "guest_token": "xxxx",
  "table_id": 5
}
````

---

## 🔐 6. Authentication Flow

### 👤 User Login

```http
POST /auth/login
POST /auth/register
```

### 👤 Guest

- Tidak login
- Menggunakan :

```
Authorization: Bearer guest_token
```

---

## 🧩 7. API ENDPOINT (LENGKAP)

### 👤 AUTH

```http
POST   /auth/register
POST   /auth/login
GET    /auth/me
```

### 🍽️ MENU

```http
GET    /menus
GET    /menus/:id
POST   /menus        (ADMIN)
PUT    /menus/:id    (ADMIN)
DELETE /menus/:id    (ADMIN)
```

### 🗂️ CATEGORY

```http
GET    /categories
POST   /categories (ADMIN)
```

### 🛒 CART

```http
GET    /cart
POST   /cart/add
PUT    /cart/update
DELETE /cart/remove
```

### 📦 ORDERS

```http
POST   /orders
GET    /orders
GET    /orders/:id
PUT    /orders/:id/status
```

### 💳 PAYMENTS

```http
POST   /payments
GET    /payments/:order_id
```

### 🚚 DELIVERY

```http
GET    /deliveries
POST   /deliveries/assign
PUT    /deliveries/status
```

### 🪑 TABLES

```http
GET    /tables
POST   /tables
GET    /tables/:id/qr
```

### 👤 GUEST

```http
POST   /guest/session
GET    /guest/session/:id
```

### 🤖 CHATBOT

```http
POST   /chatbot/message
GET    /chatbot/history
```

### 🎟️ VOUCHER

```http
POST   /vouchers
POST   /vouchers/apply
```

---

## 🚀 VIBE CODING PROMPT (NESTJS) 🔥

```
Buatkan backend NestJS untuk sistem pemesanan makanan restoran.

Fitur:
- Auth JWT + role
- QR table guest mode (tanpa login)
- Cart & order system
- Payment handling
- Kitchen & delivery flow
- Chatbot webhook API
- WebSocket real-time

Gunakan:
- NestJS modular
- Prisma ORM
- Clean architecture
- DTO validation
- Guard (RBAC)

Struktur rapi dan scalable.
```

---

## BEST PRACTICES

Gunakan:
DTO (class-validator)
Service layer (jangan logic di controller)
Guard untuk role
Interceptor untuk response format
Pisahkan:
Auth vs Guest
Order vs Payment
