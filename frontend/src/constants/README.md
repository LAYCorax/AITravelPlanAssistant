# Constants Directory

This directory contains application-wide constants and configuration.

## Structure

```
constants/
├── routes.ts             # Route paths
├── api.ts                # API endpoints
├── config.ts             # App configuration
├── messages.ts           # UI messages and labels
└── index.ts              # Export all constants
```

## Constants Guidelines

1. Use UPPER_SNAKE_CASE for constant names
2. Group related constants together
3. Export as const objects for better organization
4. Document purpose of constants
5. Keep magic numbers and strings here
