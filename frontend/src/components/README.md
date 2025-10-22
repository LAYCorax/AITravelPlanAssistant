# Components Directory

This directory contains all reusable React components organized by feature.

## Structure

```
components/
├── common/          # Common UI components (Button, Input, Modal, etc.)
├── layout/          # Layout components (Header, Footer, Sidebar, etc.)
├── travel/          # Travel-related components (TravelCard, ItineraryItem, etc.)
├── voice/           # Voice input related components
├── map/             # Map related components
├── expense/         # Expense tracking components
└── settings/        # Settings page components
```

## Naming Convention

- Component files: PascalCase (e.g., `TravelCard.tsx`)
- Component styles: Same name with `.module.css` (e.g., `TravelCard.module.css`)
- Test files: Same name with `.test.tsx` (e.g., `TravelCard.test.tsx`)

## Component Guidelines

1. Keep components small and focused on a single responsibility
2. Use TypeScript for type safety
3. Document props with TypeScript interfaces
4. Use CSS Modules for styling
5. Write unit tests for complex logic
