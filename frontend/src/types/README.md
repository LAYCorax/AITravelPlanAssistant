# Types Directory

This directory contains TypeScript type definitions and interfaces.

## Structure

```
types/
├── user.ts               # User related types
├── travel.ts             # Travel plan types
├── expense.ts            # Expense types
├── api.ts                # API request/response types
├── common.ts             # Common shared types
└── index.ts              # Export all types
```

## Type Guidelines

1. Use interfaces for object shapes
2. Use type aliases for unions, intersections
3. Export all types from index.ts
4. Keep types close to domain models
5. Document complex types with comments
