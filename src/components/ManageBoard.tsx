"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  createAppAction,
  deleteAppAction,
  reorderAppsAction,
  updateAppAction,
} from "@/app/actions/apps";
import { updateSiteSettingsAction } from "@/app/actions/settings";
import { AppTile } from "@/components/AppTile";
import { CardStyleForm } from "@/components/CardStyleForm";
import { LiveSiteTheme } from "@/components/LiveSiteTheme";
import {
  SiteHeaderBar,
  type HeaderDisplaySettings,
  type SiteHeaderAction,
} from "@/components/SiteHeaderBar";
import { SiteAppearanceForm } from "@/components/SiteAppearanceForm";
import { APP_CARD_DESCRIPTION_MAX } from "@/lib/app-card-limits";
import type { AppCard, SiteSettingsRow } from "@/lib/schema";

type AdminTab = "appearance" | "apps" | "styling";

function pickHeaderDisplaySettings(settings: SiteSettingsRow): HeaderDisplaySettings {
  return {
    brandLine1: settings.brandLine1,
    brandLine2: settings.brandLine2,
    headerTitle: settings.headerTitle,
    headerSubtitle: settings.headerSubtitle,
    headerTitleSizePx: settings.headerTitleSizePx,
    headerTextPaddingTopPx: settings.headerTextPaddingTopPx,
    headerTextPaddingBottomPx: settings.headerTextPaddingBottomPx,
    headerTextPaddingLeftPx: settings.headerTextPaddingLeftPx,
    headerTextPaddingRightPx: settings.headerTextPaddingRightPx,
    headerTitleSubtitleGapPx: settings.headerTitleSubtitleGapPx,
    logoUrl: settings.logoUrl,
    logoAlt: settings.logoAlt,
    logoSizePx: settings.logoSizePx,
    headerLayout: settings.headerLayout,
    headerPlacement: settings.headerPlacement,
  };
}

const adminTabs: { id: AdminTab; label: string; description: string }[] = [
  {
    id: "apps",
    label: "Applications",
    description: "Add, edit, remove, and reorder directory cards",
  },
  {
    id: "appearance",
    label: "Page and appearance",
    description: "Branding, copy, colors, and login content",
  },
  {
    id: "styling",
    label: "Card styling",
    description: "Tune colors, type, and spacing for public cards",
  },
];

const cardStyleFallbackApps: AppCard[] = [
  {
    id: "sample-1",
    title: "Degree audit",
    actionLabel: "Open audit",
    url: "https://example.wsu.edu/degree-audit",
    description: "Track milestones, approvals, and completion status in one place.",
    sortOrder: 0,
    createdAt: new Date(0),
  },
  {
    id: "sample-2",
    title: "Funding dashboard",
    actionLabel: "View funding",
    url: "https://example.wsu.edu/funding",
    description: "Review assistantships, tuition coverage, and appointment details.",
    sortOrder: 1,
    createdAt: new Date(0),
  },
  {
    id: "sample-3",
    title: "Forms hub",
    actionLabel: "Open forms",
    url: "https://example.wsu.edu/forms",
    description: "Open common graduate school forms and supporting instructions quickly.",
    sortOrder: 2,
    createdAt: new Date(0),
  },
];

function previewAppsForStyling(items: AppCard[]): AppCard[] {
  return items.length > 0 ? items.slice(0, 3) : cardStyleFallbackApps;
}

function SortableRow({
  app,
  editing,
  gridMode,
  onEdit,
  onRemove,
  removing,
}: {
  app: AppCard;
  editing: boolean;
  gridMode: boolean;
  onEdit: (app: AppCard) => void;
  onRemove: (id: string) => void;
  removing: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: app.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };

  if (gridMode) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`flex h-full flex-col rounded-[18px] p-2 ${
          editing ? "bg-[var(--wsu-bg)] ring-1 ring-[var(--wsu-crimson)]/20" : ""
        }`}
      >
        <div className="min-h-0 flex-1">
          <AppTile app={app} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg border border-dashed border-[var(--wsu-gray-light)] bg-white text-[var(--wsu-gray-mid)] hover:bg-[var(--wsu-bg)] active:cursor-grabbing"
            aria-label={`Drag to reorder ${app.title}`}
            {...attributes}
            {...listeners}
          >
            <span className="font-mono text-sm leading-none text-[var(--wsu-gray-mid)]">::</span>
          </button>
          <span className="flex-1" />
          <button
            type="button"
            onClick={() => onEdit(app)}
            className={`h-8 shrink-0 rounded-lg border px-2.5 text-xs font-semibold transition ${
              editing
                ? "border-[var(--wsu-crimson)] bg-[var(--wsu-crimson)] text-white hover:bg-[var(--wsu-crimson-dark)]"
                : "border-[var(--wsu-gray-light)] text-[var(--wsu-gray)] hover:bg-[var(--wsu-bg)]"
            }`}
          >
            {editing ? "Editing" : "Edit"}
          </button>
          <button
            type="button"
            disabled={removing}
            onClick={() => onRemove(app.id)}
            className="h-8 shrink-0 rounded-lg border border-[var(--wsu-gray-light)] px-2.5 text-xs font-semibold text-[var(--wsu-crimson)] hover:bg-red-50 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex gap-2 rounded-[18px] p-2 ${
        editing ? "bg-[var(--wsu-bg)] ring-1 ring-[var(--wsu-crimson)]/20" : ""
      }`}
    >
      <button
        type="button"
        className="mt-2 flex h-10 w-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg border border-dashed border-[var(--wsu-gray-light)] bg-white text-[var(--wsu-gray-mid)] hover:bg-[var(--wsu-bg)] active:cursor-grabbing"
        aria-label={`Drag to reorder ${app.title}`}
        {...attributes}
        {...listeners}
      >
        <span className="font-mono text-lg leading-none text-[var(--wsu-gray-mid)]">::</span>
      </button>
      <div className="min-w-0 flex-1">
        <AppTile app={app} />
      </div>
      <button
        type="button"
        onClick={() => onEdit(app)}
        className={`mt-2 h-10 shrink-0 rounded-lg border px-3 text-sm font-semibold transition ${
          editing
            ? "border-[var(--wsu-crimson)] bg-[var(--wsu-crimson)] text-white hover:bg-[var(--wsu-crimson-dark)]"
            : "border-[var(--wsu-gray-light)] text-[var(--wsu-gray)] hover:bg-[var(--wsu-bg)]"
        }`}
      >
        {editing ? "Editing" : "Edit"}
      </button>
      <button
        type="button"
        disabled={removing}
        onClick={() => onRemove(app.id)}
        className="mt-2 h-10 shrink-0 rounded-lg border border-[var(--wsu-gray-light)] px-3 text-sm font-semibold text-[var(--wsu-crimson)] hover:bg-red-50 disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  );
}

function TabButton({
  active,
  description,
  id,
  label,
  onSelect,
}: {
  active: boolean;
  description: string;
  id: AdminTab;
  label: string;
  onSelect: (tab: AdminTab) => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={`admin-tab-${id}`}
      aria-controls={`admin-panel-${id}`}
      aria-selected={active}
      onClick={() => onSelect(id)}
      className={`rounded-[16px] px-4 py-3 text-left transition ${
        active
          ? "bg-white shadow-[0_6px_18px_rgba(0,0,0,0.08)] ring-1 ring-black/5"
          : "bg-transparent hover:bg-white/70"
      }`}
    >
      <div className="text-sm font-semibold text-[var(--wsu-gray)]">{label}</div>
      <p className="mt-1 text-xs leading-5 text-[var(--wsu-gray-mid)]">{description}</p>
    </button>
  );
}

export function ManageBoard({
  initialApps,
  settings,
  supportsLogoStorage,
}: {
  initialApps: AppCard[];
  settings: SiteSettingsRow;
  supportsLogoStorage: boolean;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("apps");
  const [items, setItems] = useState(initialApps);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});
  const [formPending, setFormPending] = useState(false);
  const [addDescriptionLength, setAddDescriptionLength] = useState(0);
  const [listPending, startListTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [listBanner, setListBanner] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    title: "",
    actionLabel: "Open tool",
    url: "",
    description: "",
  });
  const [editPending, setEditPending] = useState(false);
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string[] | undefined>>(
    {},
  );
  const [editBanner, setEditBanner] = useState<string | null>(null);
  const [liveSettings, setLiveSettings] = useState<SiteSettingsRow>(settings);
  const [gridColumns, setGridColumns] = useState(settings.gridColumns ?? 3);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = useMemo(() => items.map((app) => app.id), [items]);
  const headerActions: SiteHeaderAction[] = useMemo(
    () => [
      { kind: "link", href: "/", label: "View directory", tone: "secondary" },
      { kind: "logout", label: "Sign out", tone: "primary" },
    ],
    [],
  );
  const previewApps = useMemo(() => previewAppsForStyling(items), [items]);
  const editingApp = useMemo(
    () => (editingId ? items.find((app) => app.id === editingId) ?? null : null),
    [editingId, items],
  );
  const cardsPanelTitle = useMemo(() => {
    const stored = settings.manageOrderTitle?.trim();
    if (
      !stored ||
      stored === "Card order" ||
      stored === "Card order and styling"
    ) {
      return "Your cards";
    }
    return stored;
  }, [settings.manageOrderTitle]);

  const cardsPanelBlurb = useMemo(() => {
    const stored = settings.manageOrderBlurb?.trim();
    if (
      !stored ||
      stored === "Drag by the handle. The order here matches the public landing page."
    ) {
      return "Edit or remove any card, or drag the handle to change the public page order.";
    }
    return stored;
  }, [settings.manageOrderBlurb]);

  const emptyCardsText = useMemo(() => {
    const stored = settings.manageEmptyDragText?.trim();
    if (!stored || stored === "No cards yet. Add one above.") {
      return "No cards yet. Use the form below to add the first application.";
    }
    return stored;
  }, [settings.manageEmptyDragText]);

  const addPanelTitle = useMemo(() => {
    const stored = settings.manageAddTitle?.trim();
    return stored || "Add application";
  }, [settings.manageAddTitle]);

  const addPanelBlurb = useMemo(() => {
    const stored = settings.manageAddBlurb?.trim();
    if (
      !stored ||
      stored.includes("Reorder cards below")
    ) {
      return "Create a new directory card with a title, action label, URL, and optional description.";
    }
    return stored;
  }, [settings.manageAddBlurb]);

  const syncFromServer = useCallback(() => {
    router.refresh();
  }, [router]);

  const beginEdit = useCallback((app: AppCard) => {
    setEditBanner(null);
    setEditFieldErrors({});
    setListBanner(null);
    setEditingId(app.id);
    setEditValues({
      title: app.title,
      actionLabel: app.actionLabel,
      url: app.url,
      description: app.description ?? "",
    });
  }, []);

  const handleColumnChange = useCallback(
    (cols: number) => {
      setGridColumns(cols);
      startListTransition(async () => {
        const fd = new FormData();
        fd.set("gridColumns", String(cols));
        await updateSiteSettingsAction(fd);
        syncFromServer();
      });
    },
    [syncFromServer, startListTransition],
  );

  const sortStrategy = gridColumns > 1 ? rectSortingStrategy : verticalListSortingStrategy;
  const gridCls =
    gridColumns === 3
      ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
      : gridColumns === 2
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1";

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((app) => app.id === active.id);
    const newIndex = items.findIndex((app) => app.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const previous = items;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    setListBanner(null);
    startListTransition(async () => {
      try {
        const res = await reorderAppsAction(next.map((app) => app.id));
        if (!res.ok) {
          setItems(previous);
          setListBanner(res.error || "Could not save the new order.");
          return;
        }
        syncFromServer();
      } catch {
        setItems(previous);
        setListBanner("Could not save the new order. Try again.");
      }
    });
  };

  async function handleAdd(formData: FormData) {
    setFormError(null);
    setFieldErrors({});
    setListBanner(null);
    setFormPending(true);
    try {
      const res = await createAppAction(formData);
      if (!res.ok) {
        const fe = res.error;
        const first =
          fe.title?.[0] ??
          fe.actionLabel?.[0] ??
          fe.url?.[0] ??
          fe.description?.[0] ??
          "Could not save";
        setFieldErrors(fe);
        setFormError(typeof first === "string" ? first : "Could not save");
        return;
      }
      setItems((prev) => [...prev, res.app]);
      setListBanner(`Added “${res.app.title}”.`);
      syncFromServer();
      const form = document.getElementById("add-app-form") as HTMLFormElement | null;
      form?.reset();
      setAddDescriptionLength(0);
    } catch {
      setFormError("Could not save. Check your session and try again.");
    } finally {
      setFormPending(false);
    }
  }

  const handleRemove = (id: string) => {
    const app = items.find((item) => item.id === id);
    const label = app?.title ? `“${app.title}”` : "this card";
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Remove ${label} from the directory? This cannot be undone.`)
    ) {
      return;
    }

    setRemovingId(id);
    setListBanner(null);
    startListTransition(async () => {
      try {
        const res = await deleteAppAction(id);
        if (!res.ok) {
          setListBanner(res.error || "Could not remove that card.");
          setRemovingId(null);
          return;
        }
        setItems((prev) => prev.filter((item) => item.id !== id));
        if (editingId === id) {
          setEditingId(null);
          setEditValues({ title: "", actionLabel: "Open tool", url: "", description: "" });
          setEditFieldErrors({});
          setEditBanner(null);
        }
        setListBanner(`Removed ${label}.`);
        syncFromServer();
      } catch {
        setListBanner("Could not remove that card. Check your session and try again.");
      } finally {
        setRemovingId(null);
      }
    });
  };

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingId) return;
    setEditBanner(null);
    setEditFieldErrors({});
    setListBanner(null);
    setEditPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      const res = await updateAppAction(formData);
      if (!res.ok) {
        const first =
          res.error.title?.[0] ??
          res.error.actionLabel?.[0] ??
          res.error.url?.[0] ??
          res.error.description?.[0] ??
          res.error.id?.[0] ??
          "Could not save";
        setEditFieldErrors(res.error);
        setEditBanner(typeof first === "string" ? first : "Could not save");
        return;
      }

      setItems((prev) => prev.map((app) => (app.id === res.app.id ? res.app : app)));
      setEditValues({
        title: res.app.title,
        actionLabel: res.app.actionLabel,
        url: res.app.url,
        description: res.app.description ?? "",
      });
      setEditBanner("Card saved successfully.");
      syncFromServer();
    } catch {
      setEditBanner("Could not save. Check your session and try again.");
    } finally {
      setEditPending(false);
    }
  }

  const dataSignature = initialApps
    .map(
      (app) =>
        `${app.id}|${app.sortOrder}|${app.title}|${app.actionLabel}|${app.url}|${app.description ?? ""}`,
    )
    .join("~~");

  useEffect(() => {
    setItems(initialApps);
  }, [dataSignature, initialApps]);

  useEffect(() => {
    setLiveSettings(settings);
    setGridColumns(settings.gridColumns ?? 3);
  }, [settings]);

  useEffect(() => {
    if (!editingId) return;
    const current = items.find((app) => app.id === editingId);
    if (!current) {
      setEditingId(null);
      setEditValues({ title: "", actionLabel: "Open tool", url: "", description: "" });
      setEditFieldErrors({});
      setEditBanner(null);
    }
  }, [editingId, items]);

  return (
    <>
      <LiveSiteTheme settings={liveSettings} />
      <SiteHeaderBar
        settings={pickHeaderDisplaySettings(liveSettings)}
        actions={headerActions}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[20px] bg-[var(--wsu-bg)]/90 p-2 ring-1 ring-black/5">
          <div role="tablist" aria-label="Admin sections" className="grid gap-2 sm:grid-cols-3">
            {adminTabs.map((tab) => (
              <TabButton
                key={tab.id}
                id={tab.id}
                label={tab.label}
                description={tab.description}
                active={activeTab === tab.id}
                onSelect={setActiveTab}
              />
            ))}
          </div>
        </div>

        <section
          role="tabpanel"
          id="admin-panel-apps"
          aria-labelledby="admin-tab-apps"
          hidden={activeTab !== "apps"}
          className={activeTab !== "apps" ? "hidden" : "space-y-6"}
        >
          <div className="rounded-[18px] bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.06)] ring-1 ring-black/5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-2xl">
                <h2 className="mb-2 text-xl font-bold text-[var(--wsu-gray)]">{cardsPanelTitle}</h2>
                <p className="mb-3 whitespace-pre-wrap text-sm text-[var(--wsu-gray-mid)]">
                  {cardsPanelBlurb}
                </p>
                <p className="text-sm text-[var(--wsu-gray-mid)]">
                  Use <span className="font-semibold text-[var(--wsu-gray)]">Edit</span> to change
                  a card, <span className="font-semibold text-[var(--wsu-gray)]">Remove</span> to
                  delete it, or drag the handle to reorder.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 rounded-full bg-[var(--wsu-bg)] p-1 ring-1 ring-black/5">
                  {([1, 2, 3] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => handleColumnChange(n)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                        gridColumns === n
                          ? "bg-[var(--wsu-crimson)] text-white shadow-sm"
                          : "text-[var(--wsu-gray-mid)] hover:bg-white hover:text-[var(--wsu-gray)]"
                      }`}
                    >
                      {n} col{n > 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
                <div className="rounded-full bg-[var(--wsu-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
                  {items.length} card{items.length === 1 ? "" : "s"}
                </div>
              </div>
            </div>

            {listBanner ? (
              <p
                className={`mt-4 rounded-xl px-3 py-2 text-sm ${
                  listBanner.startsWith("Added") || listBanner.startsWith("Removed")
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {listBanner}
              </p>
            ) : null}

            {editingApp ? (
              <form
                onSubmit={handleEditSubmit}
                className="mt-6 space-y-4 rounded-[16px] border border-[var(--wsu-crimson)]/20 bg-[var(--wsu-bg)]/70 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-[var(--wsu-gray)]">
                    Editing {editingApp.title}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setEditValues({
                        title: "",
                        actionLabel: "Open tool",
                        url: "",
                        description: "",
                      });
                      setEditFieldErrors({});
                      setEditBanner(null);
                    }}
                    className="rounded-full border border-[var(--wsu-gray-light)] bg-white px-4 py-2 text-sm font-semibold text-[var(--wsu-gray)] transition hover:bg-[var(--wsu-bg)]"
                  >
                    Close editor
                  </button>
                </div>

                <input type="hidden" name="id" value={editingApp.id} />

                {editBanner ? (
                  <p
                    className={`rounded-xl px-3 py-2 text-sm ${
                      editBanner.includes("saved")
                        ? "bg-green-50 text-green-800"
                        : "bg-red-50 text-red-800"
                    }`}
                  >
                    {editBanner}
                  </p>
                ) : null}

                <div className="grid gap-4 lg:grid-cols-3">
                  <div>
                    <label
                      htmlFor="edit-title"
                      className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]"
                    >
                      Title
                    </label>
                    <input
                      id="edit-title"
                      name="title"
                      value={editValues.title}
                      onChange={(e) =>
                        setEditValues((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="w-full rounded-lg border border-[var(--wsu-gray-light)] bg-white px-3 py-2 text-sm outline-none ring-[var(--wsu-crimson)] focus:ring-2"
                    />
                    {editFieldErrors.title?.length ? (
                      <p className="mt-1 text-xs text-red-600">{editFieldErrors.title[0]}</p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="edit-action-label"
                      className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]"
                    >
                      Action label
                    </label>
                    <input
                      id="edit-action-label"
                      name="actionLabel"
                      value={editValues.actionLabel}
                      onChange={(e) =>
                        setEditValues((prev) => ({ ...prev, actionLabel: e.target.value }))
                      }
                      className="w-full rounded-lg border border-[var(--wsu-gray-light)] bg-white px-3 py-2 text-sm outline-none ring-[var(--wsu-crimson)] focus:ring-2"
                    />
                    {editFieldErrors.actionLabel?.length ? (
                      <p className="mt-1 text-xs text-red-600">{editFieldErrors.actionLabel[0]}</p>
                    ) : null}
                  </div>

                  <div>
                    <label
                      htmlFor="edit-url"
                      className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]"
                    >
                      URL
                    </label>
                    <input
                      id="edit-url"
                      name="url"
                      value={editValues.url}
                      onChange={(e) =>
                        setEditValues((prev) => ({ ...prev, url: e.target.value }))
                      }
                      className="w-full rounded-lg border border-[var(--wsu-gray-light)] bg-white px-3 py-2 text-sm outline-none ring-[var(--wsu-crimson)] focus:ring-2"
                    />
                    {editFieldErrors.url?.length ? (
                      <p className="mt-1 text-xs text-red-600">{editFieldErrors.url[0]}</p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="edit-description"
                    className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]"
                  >
                    Description{" "}
                    <span className="font-normal normal-case text-[var(--wsu-gray-mid)]">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    id="edit-description"
                    name="description"
                    rows={4}
                    maxLength={APP_CARD_DESCRIPTION_MAX}
                    value={editValues.description}
                    onChange={(e) =>
                      setEditValues((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full resize-y rounded-lg border border-[var(--wsu-gray-light)] bg-white px-3 py-2 text-sm outline-none ring-[var(--wsu-crimson)] focus:ring-2"
                  />
                  <p className="mt-1 text-xs text-[var(--wsu-gray-mid)]">
                    {editValues.description.length}/{APP_CARD_DESCRIPTION_MAX} characters. Cards
                    show about six lines before the action label.
                  </p>
                  {editFieldErrors.description?.length ? (
                    <p className="mt-1 text-xs text-red-600">{editFieldErrors.description[0]}</p>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={editPending}
                  className="rounded-full bg-[var(--wsu-crimson)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--wsu-crimson-dark)] disabled:opacity-60"
                >
                  {editPending ? "Saving..." : "Save card changes"}
                </button>
              </form>
            ) : null}

            <div className="mt-4 min-h-[200px] rounded-[12px] border-2 border-dashed border-[var(--wsu-gray-mid)]/35 bg-[var(--wsu-bg)]/80 p-4">
              {items.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--wsu-gray-mid)]">{emptyCardsText}</p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={ids} strategy={sortStrategy}>
                    <ul
                      className={`m-0 list-none gap-3 p-0 ${
                        gridColumns > 1 ? `grid ${gridCls}` : "flex flex-col"
                      }`}
                    >
                      {items.map((app) => (
                        <li key={app.id} className={gridColumns > 1 ? "h-full" : ""}>
                          <SortableRow
                            app={app}
                            editing={editingId === app.id}
                            gridMode={gridColumns > 1}
                            onEdit={beginEdit}
                            onRemove={handleRemove}
                            removing={removingId === app.id && listPending}
                          />
                        </li>
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>

          <div className="rounded-[18px] bg-white p-6 shadow-[0_10px_28px_rgba(0,0,0,0.06)] ring-1 ring-black/5">
            <h2 className="mb-2 text-xl font-bold text-[var(--wsu-gray)]">{addPanelTitle}</h2>
            <p className="mb-4 whitespace-pre-wrap text-sm text-[var(--wsu-gray-mid)]">
              {addPanelBlurb}
            </p>

            <form id="add-app-form" action={handleAdd} className="space-y-3">
              <div>
                <label
                  htmlFor="title"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]"
                >
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  required
                  className="w-full rounded-lg border border-[var(--wsu-gray-light)] px-3 py-2 text-sm outline-none ring-[var(--wsu-crimson)] focus:ring-2"
                  placeholder="e.g. Degree audit"
                />
                {fieldErrors.title?.length ? (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.title[0]}</p>
                ) : null}
              </div>
              <div>
                <label
                  htmlFor="actionLabel"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]"
                >
                  Action label
                </label>
                <input
                  id="actionLabel"
                  name="actionLabel"
                  defaultValue="Open tool"
                  className="w-full rounded-lg border border-[var(--wsu-gray-light)] px-3 py-2 text-sm outline-none ring-[var(--wsu-crimson)] focus:ring-2"
                  placeholder="Open tool"
                />
                {fieldErrors.actionLabel?.length ? (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.actionLabel[0]}</p>
                ) : null}
              </div>
              <div>
                <label
                  htmlFor="url"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]"
                >
                  URL
                </label>
                <input
                  id="url"
                  name="url"
                  required
                  className="w-full rounded-lg border border-[var(--wsu-gray-light)] px-3 py-2 text-sm outline-none ring-[var(--wsu-crimson)] focus:ring-2"
                  placeholder="https://example.wsu.edu"
                />
                {fieldErrors.url?.length ? (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.url[0]}</p>
                ) : null}
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]"
                >
                  Description{" "}
                  <span className="font-normal normal-case text-[var(--wsu-gray-mid)]">
                    (optional)
                  </span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  maxLength={APP_CARD_DESCRIPTION_MAX}
                  onChange={(e) => setAddDescriptionLength(e.target.value.length)}
                  className="w-full resize-y rounded-lg border border-[var(--wsu-gray-light)] px-3 py-2 text-sm outline-none ring-[var(--wsu-crimson)] focus:ring-2"
                  placeholder="Short blurb shown on the card"
                />
                <p className="mt-1 text-xs text-[var(--wsu-gray-mid)]">
                  {addDescriptionLength}/{APP_CARD_DESCRIPTION_MAX} characters. Cards show about
                  six lines before the action label.
                </p>
                {fieldErrors.description?.length ? (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.description[0]}</p>
                ) : null}
              </div>
              {formError && !fieldErrors.title && !fieldErrors.url ? (
                <p className="text-sm text-red-600">{formError}</p>
              ) : null}
              <button
                type="submit"
                disabled={formPending}
                className="rounded-full bg-[var(--wsu-crimson)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--wsu-crimson-dark)] disabled:opacity-60"
              >
                {formPending ? "Saving..." : "Add card"}
              </button>
            </form>
          </div>
        </section>

        <section
          role="tabpanel"
          id="admin-panel-appearance"
          aria-labelledby="admin-tab-appearance"
          hidden={activeTab !== "appearance"}
          className={activeTab === "appearance" ? "block" : "hidden"}
        >
          <SiteAppearanceForm
            key={settings.updatedAt?.valueOf() ?? "defaults"}
            settings={settings}
            supportsLogoStorage={supportsLogoStorage}
            onHeaderSettingsChange={(nextSettings) =>
              setLiveSettings((prev) => ({ ...prev, ...nextSettings }))
            }
          />
        </section>

        <section
          role="tabpanel"
          id="admin-panel-styling"
          aria-labelledby="admin-tab-styling"
          hidden={activeTab !== "styling"}
          className={activeTab !== "styling" ? "hidden" : "space-y-6"}
        >
          <section className="rounded-[18px] border border-[var(--wsu-gray-light)] bg-[var(--wsu-bg)]/65 p-6 ring-1 ring-black/5">
            <div className="max-w-2xl">
              <h3 className="text-lg font-bold text-[var(--wsu-gray)]">Live card preview</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--wsu-gray-mid)]">
                Styling changes below update this preview. Column count and card content are
                managed on the Applications tab.
              </p>
            </div>
            <div className={`mt-6 grid gap-5 ${gridCls}`}>
              {previewApps.map((app) => (
                <AppTile key={`preview-${app.id}`} app={app} href={app.url} />
              ))}
            </div>
          </section>

          <CardStyleForm
            key={`card-style-${settings.updatedAt?.valueOf() ?? "defaults"}`}
            settings={settings}
            onCardSettingsChange={(nextSettings) =>
              setLiveSettings((prev) => ({ ...prev, ...nextSettings }))
            }
          />
        </section>
      </div>
    </>
  );
}
