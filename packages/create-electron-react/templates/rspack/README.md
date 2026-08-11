# {{productName}}

Electron application with React, TypeScript, and {{bundlerName}}.

Before distributing the application, update `author`, `appId`, and `productName` for your project.

## Development

Start the compilers and renderer dev server:

```bash
pnpm install
pnpm dev
```

Then open the Electron window in another terminal:

```bash
pnpm start
```

## Validation

```bash
pnpm check
pnpm build
```

## Packaging

Build an unpacked application:

```bash
pnpm package
```

Build a platform installer:

```bash
pnpm pack
```
