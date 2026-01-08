# API Documentation

Base URL: `http://localhost:8787` (Local) or `https://your-worker.workers.dev` (Remote)

**Authentication Required**: `Authorization: Bearer <supa_base_token>`

---

## Transactions

### List Transactions (Paginated)
`GET /api/transactions?page=1&limit=10`

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "amount": -5000,
      "date": "2024-01-01",
      "category": "Food",
      "note": "Lunch",
      "bank": "Khan Bank",
      "account": "Checking",
      "currency": "₮",
      "user_id": "user-uuid",
      "created_at": "..."
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "total_pages": 5
  }
}
```

### Create Transaction
`POST /api/transactions`

**Body:**
```json
{
  "amount": -15000,
  "date": "2024-01-05",
  "category": "Groceries",
  "note": "Weekly shopping",
  "bank": "Khan Bank",
  "account": "Checking",
  "currency": "₮"
}
```

---

## Accounts

### List Accounts
`GET /api/accounts`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Checking",
    "bank_id": 1,
    "account_type": "checking",
    "balance": 2485000,
    "currency": "₮",
    "bank_name": "Khan Bank"
  }
]
```

### Create Account
`POST /api/accounts`

**Body:**
```json
{
  "name": "Savings",
  "bank_id": 1,
  "account_type": "savings",
  "balance": 5000000,
  "currency": "₮"
}
```

---

## Banks (Cached)

### List Banks
`GET /api/banks`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Khan Bank"
  },
  {
    "id": 2,
    "name": "Golomt Bank"
  }
]
```

### Create Bank
`POST /api/banks`

**Body:**
```json
{
  "name": "TDB"
}
```

---

## Categories (Cached)

### List Categories
`GET /api/categories`

**Response:**
```json
[
  {
    "id": 1,
    "name": "Food",
    "icon": "🍔",
    "color": "#FF5722",
    "budget_amount": 300000
  }
]
```

### Create Category
`POST /api/categories`

**Body:**
```json
{
  "name": "Transport",
  "icon": "🚌",
  "color": "#2196F3",
  "budget_amount": 100000
}
```

---

## Goals

### Get Active Goal
`GET /api/goals/active`

**Response:**
```json
{
  "id": 1,
  "name": "New Laptop",
  "target_amount": 3000000,
  "current_amount": 1500000,
  "currency": "₮",
  "is_active": 1
}
```

### Create Goal
`POST /api/goals`

**Body:**
```json
{
  "name": "Vacation",
  "target_amount": 5000000,
  "current_amount": 0,
  "currency": "₮"
}
```

---

## Reports

### Monthly Report
`GET /api/reports/monthly?month=2024-01`

**Response:**
```json
[
  {
    "category": "Food",
    "total": -150000,
    "count": 15
  },
  {
    "category": "Transport",
    "total": -50000,
    "count": 10
  }
]
```
