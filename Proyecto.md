# YaSale — Street Food Kitchen SaaS (AI Context File)

## 1. Project Overview

**YaSale** is a SaaS system designed for **street food businesses** (taquerías, burger stands, snack carts, food trucks).

The main problem it solves:

- Multiple waiters take orders
- Kitchen constantly asks “what’s next?”
- Orders are chaotic, verbal, error-prone

YaSale provides:

- Real-time order queue for kitchen
- Mobile-first experience (tablets / phones)
- Simple PIN-based login
- Cash-first mindset (no payment processing)
- Fast operations, minimal friction

This is **NOT a web app**.
Frontend is **React Native (Expo)**.
Backend is **NestJS + TypeORM + MySQL**.

---

## 2. Target Users & Roles

### Roles

- **ADMIN**: tenant owner, billing, config
- **MANAGER**: store-level management
- **WAITER**: creates orders, closes checks
- **KITCHEN**: sees & updates order status
- **CASHIER** (optional): reviews totals

### Environment

- Multiple users connected concurrently
- Multiple devices per store
- Real-time synchronization required

---

## 3. Multi-Tenant SaaS Model

### Tenant

- Represents a business owner
- Subscription-based
- Can own multiple stores (branches)

### Store (Sucursal)

- Physical location / stand
- Orders belong to a store
- Kitchen view is per store

### Subscription Plans (example)

- Plan 1: 1 store, 3 users
- Plan 2: up to 3 stores, 10 users
- 7-day free trial
- Stripe-based billing (future)

---

## 4. Core Functional Concepts

### Orders

- Two types:
  - `DINE_IN`
  - `TO_GO`
- Order flow:
  - PENDING → IN_PROGRESS → READY → COMPLETED
- Orders can be extended (customer orders more food later)

### Order Identification

- By:
  - Order number
  - Table number
  - Customer name

---

## 5. Products & Customization (CRITICAL)

This is **core to street food logic**.

### Products

Examples:

- Tacos
- Hamburgers
- Drinks (“Aguas de sabor”)

### Variant Groups (Required)

Examples:

- Taco meat: asada, suadero, pastor
- Drink size: medium, liter
- Flavor: jamaica, horchata

### Modifier Groups (Optional)

Examples:

- No onions
- Extra cheese (+$)
- Extra consomé (+$)
- No mayo / no ketchup

Each order item supports:

- Quantity
- Variants
- Modifiers
- Notes

---

## 6. Kitchen View

Kitchen UI requirements:

- Real-time updates
- Two layouts:
  - List
  - Grid (squares)
- Shows:
  - Order number
  - Items + notes
  - Status
- READY orders remain visible until **check is paid**

---

## 7. Checks & Accounting

- Checks are for **recording revenue only**
- Main payment method: CASH
- No payment processing
- Each check records:
  - Subtotal
  - Tax (optional)
  - Tip
  - Total
- Tips are tracked per order/check
- Simple dashboard for daily summaries

---

## 8. Printing

- Thermal printers (ESC/POS)
- Kitchen printing (v1)
- Large store name/logo on ticket
- Items only (no prices for kitchen)
- Multilingual-ready (ES now, EN later)

---

## 9. Authentication

- PIN-based login (4–8 digits)
- Fast access for street stands
- JWT-based backend auth
- No passwords, emails optional later

---

## 10. Frontend Stack

- React Native
- Expo
- Expo Router
- Zustand (state)
- TanStack Query (server state)
- Socket.IO client
- Mobile-first UX
- Tablet-friendly layouts

Testing:

- Jest
- React Native Testing Library

---

## 11. Backend Stack

- NestJS
- TypeORM
- MySQL
- Docker
- RabbitMQ
- Socket.IO
- JWT Auth
- Modular architecture
- Microservice-ready

No Prisma is used.

---

## 12. Database Principles (TypeORM)

- Explicit entities
- UUID primary keys
- No `synchronize: true` in production
- Migrations required
- Strong indexing for:
  - tenantId
  - storeId
  - order status

---

## 13. Real-Time Communication

- Internet required
- Socket.IO over WebSockets
- Events:
  - order.created
  - order.updated
  - order.ready
- Kitchen + waiters stay in sync

---

## 14. Messaging & Events

- RabbitMQ for:
  - Order events
  - Print jobs
  - Logs (future)
- Outbox pattern planned
- Event-driven design encouraged

---

## 15. Design Principles

- Speed over perfection
- Minimal taps
- No unnecessary features
- Offline NOT required
- Designed for noisy, fast environments

---

## 16. MVP Scope (DO NOT OVERBUILD)

Include:

- Orders
- Kitchen view
- Products with variants/modifiers
- Checks & tips
- PIN auth
- One tenant, multi-store

Exclude for now:

- Inventory
- Payment processing
- Loyalty
- Reports beyond basics
- Customer accounts

---

## 17. AI Agent Instructions

When assisting with this project:

- Assume NestJS + TypeORM
- Assume mobile-first React Native
- Prefer simple, scalable solutions
- Avoid Prisma suggestions
- Avoid web-only UX
- Favor real-time, event-driven logic
- Keep SaaS + multi-tenant in mind
- Think like a street food operation

---

## End of Context
