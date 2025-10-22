# Store Directory

This directory contains global state management using React Context + useReducer.

## Structure

```
store/
├── auth/
│   ├── AuthContext.tsx   # Auth context provider
│   ├── authReducer.ts    # Auth state reducer
│   └── authActions.ts    # Auth actions
├── travel/
│   ├── TravelContext.tsx # Travel context provider
│   ├── travelReducer.ts  # Travel state reducer
│   └── travelActions.ts  # Travel actions
└── index.ts              # Root provider combining all contexts
```

## State Management Pattern

1. Each feature has its own context
2. Use reducer pattern for complex state updates
3. Separate actions for better organization
4. Combine providers in root provider
5. Use custom hooks to consume context
