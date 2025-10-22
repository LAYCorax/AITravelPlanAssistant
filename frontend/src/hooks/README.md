# Hooks Directory

This directory contains custom React hooks for reusable logic.

## Structure

```
hooks/
├── useAuth.ts            # Authentication hook
├── useTravelPlan.ts      # Travel plan management
├── useVoiceInput.ts      # Voice input handling
├── useMap.ts             # Map integration
├── useExpense.ts         # Expense tracking
├── useLocalStorage.ts    # Local storage management
├── useDebounce.ts        # Debounce utility
└── index.ts              # Export all hooks
```

## Hook Guidelines

1. Prefix all hooks with `use`
2. Keep hooks focused on single responsibility
3. Document hook parameters and return values
4. Handle loading and error states
5. Write tests for complex hooks
