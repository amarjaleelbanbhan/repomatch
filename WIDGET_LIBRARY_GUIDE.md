# RepoMatch UI Widget Library Guide

Welcome to the RepoMatch UI Widget Library! This library provides 19 premium, accessible, and self-contained dark-themed components built specifically for RepoMatch.

All components are built using vanilla CSS with a strict prefix namespace (`.rm-*`) to completely avoid collisions with existing global classes (like `.btn` or `.chip`).

A live interactive showcase of every widget, state, and edge case is available at the `/ui` playground route when running the development server locally.

---

## Live Playground Screenshot
Below is the full visual page rendering from the `/ui` route:

![RepoMatch UI Playground](file:///C:/Users/Amar/.gemini/antigravity/brain/184bfe97-1575-4c54-99fe-49916d7f0623/playground.png)

---

## Getting Started

### How to Import
All components are consolidated into a single barrel export. Import them directly from the `@/components/ui` alias:

```tsx
import { Button, Card, Badge, Toggle } from "@/components/ui";
```

### Style Scope & Prefixes
All styles reside inside `apps/web/src/app/widgets.css`. Future contributors must adhere to the `.rm-` prefix class names to prevent style conflicts with existing layout rules in `globals.css`:
- **Pattern**: `rm-<component>[-<sub-element>][--<modifier>]`
- **Example**: `.rm-button`, `.rm-button--primary`, `.rm-button--loading`, `.rm-input__label`, `.rm-input--error`.

---

## Component Usage Reference

### 1. Button
Renders dynamically as a `<button>` or `<a>` tag depending on the presence of the `href` prop.
```tsx
import { Button } from "@/components/ui";

// As a standard button
<Button variant="primary" size="md" onClick={() => console.log("clicked")}>
  Save Changes
</Button>

// As a loading button
<Button variant="secondary" loading>
  Saving...
</Button>

// As an anchor link
<Button variant="ghost" href="/dashboard">
  Go to Dashboard
</Button>
```

### 2. Input
Includes full accessibility support using `aria-describedby` for error status and helpers.
```tsx
import { Input } from "@/components/ui";

<Input
  label="GitHub Username"
  placeholder="octocat"
  helper="Enter your public GitHub handle."
  required
/>

// Error state with custom focused red-outline glow
<Input
  label="Email Address"
  value="invalid-email"
  error="Please enter a valid email."
/>
```

### 3. Select
A styled selection drop-down containing an animated chevron.
```tsx
import { Select } from "@/components/ui";

<Select
  label="Primary Language"
  placeholder="Select a language"
  options={[
    { value: "typescript", label: "TypeScript" },
    { value: "rust", label: "Rust" }
  ]}
  value="typescript"
  onChange={(val) => console.log(val)}
/>
```

### 4. Checkbox
Custom custom-sized checkbox toggle with indeterminate state support.
```tsx
import { Checkbox } from "@/components/ui";

<Checkbox
  label="Welcoming repos only (has CONTRIBUTING.md)"
  checked={true}
  onChange={(checked) => console.log(checked)}
/>
```

### 5. Radio & RadioGroup
**Important constraint**: Radios must be wrapped inside a `RadioGroup` component to receive a shared `name` context and enforce exclusivity. Single, bare `Radio` elements will emit a warning console log in development.
```tsx
import { RadioGroup, Radio } from "@/components/ui";

<RadioGroup
  name="experience-level"
  value="intermediate"
  onChange={(val) => console.log(val)}
  label="Experience Level"
  direction="vertical"
>
  <Radio value="beginner" label="Beginner - New to Open Source" />
  <Radio value="intermediate" label="Intermediate - Comfortable contributing" />
  <Radio value="advanced" label="Advanced - Core Maintainer" />
</RadioGroup>
```

### 6. Toggle
Pill-based switch complying with standard keyboard spacebar/enter behavior.
```tsx
import { Toggle } from "@/components/ui";

<Toggle
  label="Receive weekly digests"
  checked={true}
  onChange={(checked) => console.log(checked)}
  size="md"
/>
```

### 7. Badge & BadgeGroup
Text chips indicating metadata or tags.
```tsx
import { Badge, BadgeGroup } from "@/components/ui";

<BadgeGroup>
  <Badge variant="primary">TypeScript</Badge>
  <Badge variant="success">✓ merged</Badge>
  <Badge variant="danger" onRemove={() => console.log("removed")}>
    stale
  </Badge>
</BadgeGroup>
```

### 8. Avatar
Presents an image with automatic initials fallback and silhouette SVG logic.
```tsx
import { Avatar } from "@/components/ui";

// With valid image
<Avatar src="https://avatars.githubusercontent.com/u/1" name="octocat" size="md" />

// Broken URL fallback (renders initials "JD")
<Avatar src="https://broken.url/image.png" name="John Doe" size="lg" />

// No details fallback (renders generic silhouette)
<Avatar size="sm" />
```

### 9. Card
Slot-based block containers avoiding default layout cascades.
```tsx
import { Card, Button } from "@/components/ui";

<Card hoverable>
  <Card.Header>
    <h3 className="rm-card__title">React Repository</h3>
  </Card.Header>
  <Card.Body>
    <p>A declarative, efficient, and flexible JavaScript library.</p>
  </Card.Body>
  <Card.Footer>
    <Button variant="ghost" size="sm">Star</Button>
  </Card.Footer>
</Card>
```

### 10. Modal
Focus-trapped dialogue using active z-index stacking.
```tsx
import { useState, useRef } from "react";
import { Modal, Button } from "@/components/ui";

export function ModalUsage() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button ref={triggerRef} onClick={() => setOpen(true)}>
        Open Modal
      </Button>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Confirm Deletion"
        triggerRef={triggerRef}
      >
        <p>This action cannot be undone.</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="danger">Delete</Button>
        </div>
      </Modal>
    </>
  );
}
```

### 11. Toast System
Provides status toasts with eviction logic that prevents danger/error messages from being dropped first.

#### Step 1: Mount the Provider in `layout.tsx`
```tsx
import { ToastProvider } from "@/components/ui";

export default function Layout({ children }) {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
}
```

#### Step 2: Invoke via hook in any child page
```tsx
import { useToast, Button } from "@/components/ui";

export function SaveButton() {
  const toast = useToast();

  return (
    <Button
      onClick={() => {
        toast.success("Success!", "Project settings updated.");
      }}
    >
      Save
    </Button>
  );
}
```

### 12. Tooltip
Focus-visible triggers that flip direction based on viewport collision.
```tsx
import { Tooltip, Button } from "@/components/ui";

<Tooltip content="Permanently hide this match" placement="top">
  <Button variant="ghost">Hide</Button>
</Tooltip>
```

### 13. Tabs
Switching tabs featuring roving tabindex for keyboard arrow keys.
```tsx
import { Tabs } from "@/components/ui";

<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Tab value="overview">Overview</Tabs.Tab>
    <Tabs.Tab value="activity">Activity</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="overview">
    <p>Repo overview statistics...</p>
  </Tabs.Panel>
  <Tabs.Panel value="activity">
    <p>Recent contribution graphs...</p>
  </Tabs.Panel>
</Tabs>
```

### 14. Spinner
Accessible SVG progress ring indicator.
```tsx
import { Spinner } from "@/components/ui";

<Spinner size="md" label="Loading repository list" />
```

### 15. Skeleton
Loading shimmer card element.
```tsx
import { Skeleton, SkeletonGroup } from "@/components/ui";

<SkeletonGroup gap={8}>
  <Skeleton variant="circle" width={40} height={40} />
  <Skeleton variant="title" width="60%" />
  <Skeleton variant="text" width="100%" />
</SkeletonGroup>
```

### 16. ProgressBar
Determinate and indeterminate progress bar.
```tsx
import { ProgressBar } from "@/components/ui";

// Determinate
<ProgressBar value={72} label="Health Score" showValue />

// Indeterminate
<ProgressBar label="Syncing star history..." />
```

### 17. Dropdown
Arrow-key navigable popover action list.
```tsx
import { Dropdown, Button } from "@/components/ui";

<Dropdown
  trigger={<Button>Options ▾</Button>}
  items={[
    { label: "Copy Snippet", onClick: () => console.log("copy") },
    { separator: true },
    { label: "Unlink Account", variant: "danger", onClick: () => console.log("delete") }
  ]}
/>
```

### 18. Table
Sortable, client-side paginated tables.
```tsx
import { Table } from "@/components/ui";

<Table
  columns={[
    { key: "name", label: "Repo Name", sortable: true },
    { key: "stars", label: "Stars", sortable: true }
  ]}
  rows={[
    { name: "vercel/next.js", stars: "124000" },
    { name: "golang/go", stars: "123000" }
  ]}
  pageSize={5}
  emptyMessage="No repositories matched the filters."
/>
```

### 19. Navbar
Fixed sticky navbar featuring visually hidden accessibility anchors.
```tsx
import { Navbar, Avatar } from "@/components/ui";

<Navbar
  brand="RepoMatch"
  brandHref="/"
  links={[
    { label: "Dashboard", href: "/dashboard", active: true },
    { label: "Matches", href: "/matches" }
  ]}
  user={<Avatar name="octocat" size="sm" />}
/>
```
