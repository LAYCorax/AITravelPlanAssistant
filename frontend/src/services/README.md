# Services Directory

This directory contains all API service modules and third-party integrations.

## Structure

```
services/
├── api/
│   ├── auth.ts           # Authentication API
│   ├── travel.ts         # Travel plans API
│   ├── expense.ts        # Expense tracking API
│   └── user.ts           # User management API
├── llm/
│   └── alibabaLLM.ts     # Alibaba LLM integration
├── voice/
│   └── iflytek.ts        # iFlytek WebSocket voice recognition (流式版)
├── map/
│   └── amap.ts           # Amap (Gaode) map service
├── supabase/
│   ├── client.ts         # Supabase client setup
│   └── database.ts       # Database operations
└── index.ts              # Export all services
```

## Service Guidelines

1. Each service exports functions for specific API operations
2. Handle errors consistently
3. Use TypeScript for request/response types
4. Add request/response interceptors for common logic
5. Keep API keys in environment variables
