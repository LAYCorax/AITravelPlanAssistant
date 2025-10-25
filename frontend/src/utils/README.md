# Utils Directory

This directory contains utility functions and helpers.

## Structure

```
utils/
├── format.ts             # Formatting utilities (date, currency, etc.)
├── validation.ts         # Input validation functions
├── storage.ts            # Storage helpers (localStorage, sessionStorage)
├── error.ts              # Error handling utilities
├── api.ts                # API request helpers
├── errorHandler.ts       # ⭐ Unified error handling with user-friendly messages
└── index.ts              # Export all utilities
```

## Utility Guidelines

1. Pure functions without side effects
2. Well-documented with JSDoc comments
3. Thoroughly tested
4. Type-safe with TypeScript
5. Reusable across the application

---

## ⭐ Error Handler (errorHandler.ts)

统一的错误处理工具，提供用户友好的错误提示。

### 快速开始

```typescript
import { showFriendlyError, parseApiError } from '@/utils/errorHandler';

try {
  const result = await fetchData();
} catch (error) {
  showFriendlyError(parseApiError(error));
}
```

### 支持的错误类型

- **NETWORK** - 网络连接失败
- **AUTH** - 身份验证失败
- **VALIDATION** - 输入验证失败
- **API** - API服务异常
- **MAP** - 地图加载失败
- **GEOCODING** - 地址解析失败
- **ROUTE_PLANNING** - 路线规划失败
- **UNKNOWN** - 未知错误

### 使用包装器简化错误处理

```typescript
import { withErrorHandling } from '@/utils/errorHandler';

const plans = await withErrorHandling(
  () => getUserTravelPlans(),
  ErrorType.API
);
```

详见：`docs/Week9-Summary.md` 中的错误处理章节
