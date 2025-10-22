# Contexts Directory

This directory contains React Context providers for shared state.

## Structure

```
contexts/
├── ThemeContext.tsx      # Theme context (light/dark mode)
├── LanguageContext.tsx   # Language/i18n context
└── index.ts              # Export all contexts
```

## Context Guidelines

1. Keep contexts focused on specific concerns
2. Provide sensible default values
3. Create custom hooks for consuming context
4. Optimize re-renders with useMemo
5. Document context values and methods
