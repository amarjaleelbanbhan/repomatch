/**
 * /ui — Widget Playground
 *
 * Demo page for the RepoMatch UI component library.
 * No authentication required. Accessible at /ui in development.
 * Shows every widget with multiple states for visual and accessibility review.
 */

"use client";

import { useRef, useState } from "react";
import {
  Avatar,
  Badge,
  BadgeGroup,
  Button,
  Card,
  Checkbox,
  Dropdown,
  Input,
  Modal,
  Navbar,
  ProgressBar,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  SkeletonGroup,
  Spinner,
  Tabs,
  Toggle,
  Tooltip,
  ToastProvider,
  useToast,
} from "@/components/ui";

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 48 }}>
      <h2 style={{ color: "var(--cyan)", fontFamily: "JetBrains Mono, monospace", marginBottom: 16 }}>
        {title}
      </h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-start" }}>
        {children}
      </div>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-start", width: "100%" }}>
      {children}
    </div>
  );
}

/* ── Toast trigger wrapper (needs context) ────────────────────────────────── */
function ToastDemo() {
  const toast = useToast();
  return (
    <Row>
      <Button variant="secondary" size="sm" onClick={() => toast.success("Saved!", "Your changes have been applied.")}>
        Success toast
      </Button>
      <Button variant="danger" size="sm" onClick={() => toast.danger("Error", "Something went wrong. Please try again.")}>
        Danger toast
      </Button>
      <Button variant="ghost" size="sm" onClick={() => toast.warning("Heads up", "This action is irreversible.")}>
        Warning toast
      </Button>
      <Button variant="ghost" size="sm" onClick={() => toast.info("Update available", "A new version of RepoMatch is ready.")}>
        Info toast
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          for (let i = 0; i < 6; i++) {
            setTimeout(() => toast.info(`Toast ${i + 1}`, "Queue overflow test"), i * 50);
          }
        }}
      >
        Overflow test (6 toasts)
      </Button>
      <Button
        variant="danger"
        size="sm"
        onClick={() => {
          for (let i = 0; i < 4; i++) {
            setTimeout(() => toast.info(`Info ${i + 1}`, "Low priority"), i * 30);
          }
          setTimeout(() => toast.danger("Critical error", "This should NOT be evicted"), 200);
        }}
      >
        Priority eviction test
      </Button>
    </Row>
  );
}

/* ── Main playground ─────────────────────────────────────────────────────── */

export default function UIPlayground() {
  const [checkA, setCheckA] = useState(false);
  const [toggleA, setToggleA] = useState(false);
  const [radioVal, setRadioVal] = useState("intermediate");
  const [selectVal, setSelectVal] = useState("");
  const [inputVal, setInputVal] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modal2Open, setModal2Open] = useState(false);
  const modalTriggerRef = useRef<HTMLButtonElement>(null);
  const modal2TriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <ToastProvider>
      <Navbar
        brand="RepoMatch"
        brandHref="/"
        links={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Matches", href: "/matches" },
          { label: "UI Playground", href: "/ui", active: true },
        ]}
      />

      <main
        id="rm-main-content"
        style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px 96px" }}
      >
        <div style={{ paddingTop: 40 }}>
          <h1 style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "1.75rem", marginBottom: 8 }}>
            UI Playground
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: 0 }}>
            Every widget in the RepoMatch component library — with all states.
          </p>
        </div>

        {/* ── BUTTON ──────────────────────────────────────────────────────── */}
        <Section title="Button">
          <Row>
            <span style={{ fontSize: "0.775rem", color: "var(--text-muted)", width: "100%" }}>Variants × sizes</span>
            <Button variant="primary" size="sm">Primary sm</Button>
            <Button variant="primary">Primary md</Button>
            <Button variant="primary" size="lg">Primary lg</Button>
          </Row>
          <Row>
            <Button variant="secondary" size="sm">Secondary sm</Button>
            <Button variant="secondary">Secondary md</Button>
            <Button variant="secondary" size="lg">Secondary lg</Button>
          </Row>
          <Row>
            <Button variant="ghost" size="sm">Ghost sm</Button>
            <Button variant="ghost">Ghost md</Button>
            <Button variant="ghost" size="lg">Ghost lg</Button>
          </Row>
          <Row>
            <Button variant="danger" size="sm">Danger sm</Button>
            <Button variant="danger">Danger md</Button>
            <Button variant="danger" size="lg">Danger lg</Button>
          </Row>
          <Row>
            <span style={{ fontSize: "0.775rem", color: "var(--text-muted)", width: "100%" }}>States</span>
            <Button variant="primary" loading>Loading</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="primary" href="/ui">As anchor (&lt;a&gt;)</Button>
          </Row>
        </Section>

        {/* ── INPUT ───────────────────────────────────────────────────────── */}
        <Section title="Input">
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Username" placeholder="octocat" value={inputVal} onChange={(e) => setInputVal(e.target.value)} />
            <Input label="Email (required)" type="email" placeholder="you@example.com" required helper="We'll never share your email." />
            <Input label="Repository name" value="broken-repo" error="This repo could not be found on GitHub." />
            <Input label="Disabled field" value="read only" disabled />
          </div>
        </Section>

        {/* ── SELECT ──────────────────────────────────────────────────────── */}
        <Section title="Select">
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
            <Select
              label="Language filter"
              placeholder="All languages"
              options={["TypeScript", "Python", "Rust", "Go", "JavaScript"]}
              value={selectVal}
              onChange={setSelectVal}
            />
            <Select label="Error state" options={["a", "b"]} error="Please select a language." />
            <Select label="No options" options={[]} />
            <Select label="Disabled" options={["x"]} disabled />
          </div>
        </Section>

        {/* ── CHECKBOX ────────────────────────────────────────────────────── */}
        <Section title="Checkbox">
          <Checkbox label="Welcoming repos only" checked={checkA} onChange={setCheckA} />
          <Checkbox label="Checked (uncontrolled)" checked />
          <Checkbox label="Indeterminate" indeterminate />
          <Checkbox label="Disabled unchecked" disabled />
          <Checkbox label="Disabled checked" checked disabled />
        </Section>

        {/* ── RADIO ───────────────────────────────────────────────────────── */}
        <Section title="Radio">
          <RadioGroup name="skill" value={radioVal} onChange={setRadioVal} label="Skill level" direction="horizontal">
            <Radio value="beginner" label="Beginner" />
            <Radio value="intermediate" label="Intermediate" />
            <Radio value="advanced" label="Advanced" />
          </RadioGroup>
          <RadioGroup name="skill-disabled" value="beginner" onChange={() => {}} label="Disabled group" disabled>
            <Radio value="beginner" label="Beginner" />
            <Radio value="advanced" label="Advanced" />
          </RadioGroup>
        </Section>

        {/* ── TOGGLE ──────────────────────────────────────────────────────── */}
        <Section title="Toggle">
          <Toggle label="Dark mode" checked={toggleA} onChange={setToggleA} size="sm" />
          <Toggle label="Notifications" checked={toggleA} onChange={setToggleA} />
          <Toggle label="Beta features" checked={toggleA} onChange={setToggleA} size="lg" />
          <Toggle label="Disabled off" disabled />
          <Toggle label="Disabled on" checked disabled />
        </Section>

        {/* ── BADGE ───────────────────────────────────────────────────────── */}
        <Section title="Badge">
          <BadgeGroup>
            <Badge variant="primary">primary</Badge>
            <Badge variant="secondary">secondary</Badge>
            <Badge variant="success">✓ merged</Badge>
            <Badge variant="warning">⚠ stale</Badge>
            <Badge variant="danger">✕ archived</Badge>
            <Badge variant="info">ℹ info</Badge>
          </BadgeGroup>
          <BadgeGroup>
            <Badge variant="primary" size="sm">sm</Badge>
            <Badge variant="primary">md</Badge>
            <Badge variant="primary" size="lg">lg</Badge>
          </BadgeGroup>
          <BadgeGroup>
            <Badge variant="success" onRemove={() => {}}>removable ×</Badge>
            <Badge variant="secondary">{"a".repeat(40)}</Badge>
          </BadgeGroup>
        </Section>

        {/* ── AVATAR ──────────────────────────────────────────────────────── */}
        <Section title="Avatar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar src="https://avatars.githubusercontent.com/u/1" name="octocat" size="sm" />
            <Avatar src="https://avatars.githubusercontent.com/u/1" name="octocat" size="md" />
            <Avatar src="https://avatars.githubusercontent.com/u/1" name="octocat" size="lg" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar src="https://broken.url/404.png" name="John Doe" size="sm" />
            <Avatar src="https://broken.url/404.png" name="John Doe" size="md" />
            <Avatar src="https://broken.url/404.png" name="John Doe" size="lg" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar size="sm" />
            <Avatar size="md" />
            <Avatar size="lg" />
          </div>
        </Section>

        {/* ── CARD ────────────────────────────────────────────────────────── */}
        <Section title="Card">
          <Card style={{ width: "100%" }}>
            <Card.Header>
              <h3 className="rm-card__title">vercel/next.js</h3>
            </Card.Header>
            <Card.Body>
              <p style={{ color: "var(--text-muted)", margin: 0 }}>
                The React Framework for the Web. Used by some of the world&apos;s largest companies.
              </p>
            </Card.Body>
            <Card.Footer>
              <Badge variant="success">✓ actively welcoming</Badge>
              <Button variant="ghost" size="sm">View →</Button>
            </Card.Footer>
          </Card>
          <Card hoverable style={{ width: "100%" }}>
            <Card.Body>
              <p style={{ color: "var(--text-muted)", margin: 0 }}>
                Hoverable card — border glows on hover.
              </p>
            </Card.Body>
          </Card>
        </Section>

        {/* ── MODAL ───────────────────────────────────────────────────────── */}
        <Section title="Modal">
          <button
            ref={modalTriggerRef}
            className="rm-button rm-button rm-button rm-button--secondary rm-button--md"
            onClick={() => setModalOpen(true)}
          >
            Open modal
          </button>
          <button
            ref={modal2TriggerRef}
            className="rm-button rm-button rm-button rm-button--ghost rm-button--md"
            onClick={() => setModal2Open(true)}
          >
            Open second (stacked)
          </button>

          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Delete account"
            triggerRef={modalTriggerRef}
          >
            <p style={{ color: "var(--text-muted)" }}>
              This will permanently delete your account and all associated data. This action
              cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="danger">Delete account</Button>
            </div>
          </Modal>

          <Modal
            isOpen={modal2Open}
            onClose={() => setModal2Open(false)}
            title="Second modal (z-index stacked)"
            triggerRef={modal2TriggerRef}
          >
            <p style={{ color: "var(--text-muted)" }}>
              This modal has a higher z-index than any other. Focus is trapped here.
              Escape closes only this one.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <Button variant="primary" onClick={() => setModal2Open(false)}>Got it</Button>
            </div>
          </Modal>
        </Section>

        {/* ── TOAST ───────────────────────────────────────────────────────── */}
        <Section title="Toast">
          <ToastDemo />
        </Section>

        {/* ── TOOLTIP ─────────────────────────────────────────────────────── */}
        <Section title="Tooltip">
          <Tooltip content="Copy markdown to clipboard" placement="top">
            <Button variant="ghost" size="sm">Hover/focus me (top)</Button>
          </Tooltip>
          <Tooltip content="Opens in a new tab" placement="right">
            <Button variant="ghost" size="sm">Right</Button>
          </Tooltip>
          <Tooltip content="Dismiss this notification" placement="bottom">
            <Button variant="ghost" size="sm">Bottom</Button>
          </Tooltip>
          <Tooltip content="Previously saved" placement="left">
            <Button variant="ghost" size="sm">Left</Button>
          </Tooltip>
        </Section>

        {/* ── TABS ────────────────────────────────────────────────────────── */}
        <Section title="Tabs">
          <div style={{ width: "100%" }}>
            <Tabs defaultValue="matches">
              <Tabs.List>
                <Tabs.Tab value="matches">Matches</Tabs.Tab>
                <Tabs.Tab value="saved">Saved repos</Tabs.Tab>
                <Tabs.Tab value="network">Network</Tabs.Tab>
              </Tabs.List>
              <Tabs.Panel value="matches">
                <p style={{ color: "var(--text-muted)" }}>Your top matched repos appear here.</p>
              </Tabs.Panel>
              <Tabs.Panel value="saved">
                <p style={{ color: "var(--text-muted)" }}>Repos you've saved with 👍 appear here.</p>
              </Tabs.Panel>
              <Tabs.Panel value="network">
                <p style={{ color: "var(--text-muted)" }}>Repos your GitHub network contributes to appear here.</p>
              </Tabs.Panel>
            </Tabs>
          </div>
        </Section>

        {/* ── SPINNER ─────────────────────────────────────────────────────── */}
        <Section title="Spinner">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </Section>

        {/* ── SKELETON ────────────────────────────────────────────────────── */}
        <Section title="Skeleton">
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <Skeleton variant="circle" width={40} height={40} />
              <SkeletonGroup gap={6}>
                <Skeleton variant="title" width={180} />
                <Skeleton variant="text" width={120} />
              </SkeletonGroup>
            </div>
            <SkeletonGroup gap={8}>
              <Skeleton width="100%" height={16} />
              <Skeleton width="80%" height={16} />
              <Skeleton width="92%" height={16} />
            </SkeletonGroup>
          </div>
        </Section>

        {/* ── PROGRESS BAR ────────────────────────────────────────────────── */}
        <Section title="ProgressBar">
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
            <ProgressBar value={72} label="Health score" showValue />
            <ProgressBar value={28} label="Completion" showValue size="sm" />
            <ProgressBar value={100} label="Fully indexed" showValue size="lg" />
            <ProgressBar label="Indexing…" />
            <ProgressBar value={0} label="Not started" showValue />
            <ProgressBar value={150} label="Over 100 (clamped)" showValue />
          </div>
        </Section>

        {/* ── DROPDOWN ────────────────────────────────────────────────────── */}
        <Section title="Dropdown">
          <Dropdown
            trigger={<Button variant="secondary">Actions ▾</Button>}
            items={[
              { label: "Edit interests", onClick: () => {} },
              { label: "Copy widget snippet", onClick: () => {} },
              { separator: true },
              { label: "View on GitHub", href: "https://github.com" },
              { separator: true },
              { label: "Delete account", variant: "danger", onClick: () => {} },
            ]}
          />
          <Dropdown
            trigger={<Button variant="ghost" size="sm">No options ▾</Button>}
            items={[]}
          />
        </Section>

        {/* ── TABLE ───────────────────────────────────────────────────────── */}
        <Section title="Table">
          <div style={{ width: "100%" }}>
            <p style={{ color: "var(--text-muted)", marginBottom: 12, fontSize: "0.875rem" }}>
              Sortable (click column headers), paginated (pageSize=5 in demo).
            </p>
            <DemoTable />
          </div>
          <div style={{ width: "100%", marginTop: 16 }}>
            <p style={{ color: "var(--text-muted)", marginBottom: 8, fontSize: "0.875rem" }}>Empty state:</p>
            <DemoTableEmpty />
          </div>
        </Section>
      </main>
    </ToastProvider>
  );
}

/* ── Demo table data ─────────────────────────────────────────────────────── */

import { Table, type TableColumn } from "@/components/ui";

const TABLE_COLS: TableColumn[] = [
  { key: "repo", label: "Repository", sortable: true },
  { key: "stars", label: "Stars", sortable: true, minWidth: 80 },
  { key: "lang", label: "Language", sortable: true },
  { key: "status", label: "Status" },
];

const TABLE_ROWS = [
  { repo: "vercel/next.js",       stars: "124000", lang: "TypeScript", status: <Badge variant="success">active</Badge> },
  { repo: "microsoft/vscode",     stars: "162000", lang: "TypeScript", status: <Badge variant="success">active</Badge> },
  { repo: "rust-lang/rust",       stars: "96000",  lang: "Rust",       status: <Badge variant="info">stable</Badge> },
  { repo: "golang/go",            stars: "123000", lang: "Go",         status: <Badge variant="info">stable</Badge> },
  { repo: "denoland/deno",        stars: "94000",  lang: "Rust",       status: <Badge variant="warning">beta</Badge> },
  { repo: "facebook/react",       stars: "225000", lang: "JavaScript", status: <Badge variant="success">active</Badge> },
  { repo: "vuejs/vue",            stars: "207000", lang: "TypeScript", status: <Badge variant="success">active</Badge> },
  { repo: "sveltejs/svelte",      stars: "78000",  lang: "TypeScript", status: <Badge variant="info">stable</Badge> },
  { repo: "withastro/astro",      stars: "45000",  lang: "TypeScript", status: <Badge variant="success">active</Badge> },
  { repo: "prisma/prisma",        stars: "38000",  lang: "TypeScript", status: <Badge variant="success">active</Badge> },
  { repo: "trpc/trpc",            stars: "33000",  lang: "TypeScript", status: <Badge variant="success">active</Badge> },
  { repo: "biomejs/biome",        stars: "14000",  lang: "Rust",       status: <Badge variant="warning">beta</Badge> },
];

function DemoTable() {
  return <Table columns={TABLE_COLS} rows={TABLE_ROWS} pageSize={5} />;
}

function DemoTableEmpty() {
  return <Table columns={TABLE_COLS} rows={[]} emptyMessage="No repositories matched your filters." />;
}
