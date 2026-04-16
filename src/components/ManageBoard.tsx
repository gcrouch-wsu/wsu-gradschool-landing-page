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
} from "@/app/actions/apps";
import { AppTile } from "@/components/AppTile";
import type { AppCard } from "@/lib/schema";

function SortableRow({
  app,
  onRemove,
  removing,
}: {
  app: AppCard;
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

  return (
    <div ref={setNodeRef} style={style} className="flex gap-2">
      <button
        type="button"
        className="mt-2 flex h-10 w-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg border border-dashed border-[var(--wsu-gray-light)] bg-white text-[var(--wsu-gray-mid)] hover:bg-[var(--wsu-bg)] active:cursor-grabbing"
        aria-label={`Drag to reorder ${app.title}`}
        {...attributes}
        {...listeners}
      >
        <span className="text-lg leading-none text-[var(--wsu-gray-mid)]">⋮⋮</span>
      </button>
      <div className="min-w-0 flex-1">
        <AppTile app={app} />
      </div>
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

export function ManageBoard({ initialApps }: { initialApps: AppCard[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialApps);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | undefined>>({});
  const [formPending, setFormPending] = useState(false);
  const [listPending, startListTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = useMemo(() => items.map((a) => a.id), [items]);

  const syncFromServer = useCallback(() => {
    router.refresh();
  }, [router]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((a) => a.id === active.id);
    const newIndex = items.findIndex((a) => a.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    startListTransition(async () => {
      await reorderAppsAction(next.map((a) => a.id));
      syncFromServer();
    });
  };

  async function handleAdd(formData: FormData) {
    setFormError(null);
    setFieldErrors({});
    setFormPending(true);
    try {
      const res = await createAppAction(formData);
      if (!res.ok) {
        const fe = res.error;
        const first =
          fe.title?.[0] ?? fe.url?.[0] ?? fe.description?.[0] ?? "Could not save";
        setFieldErrors(fe);
        setFormError(typeof first === "string" ? first : "Could not save");
        return;
      }
      syncFromServer();
      const form = document.getElementById("add-app-form") as HTMLFormElement | null;
      form?.reset();
    } finally {
      setFormPending(false);
    }
  }

  const handleRemove = (id: string) => {
    setRemovingId(id);
    startListTransition(async () => {
      await deleteAppAction(id);
      setItems((prev) => prev.filter((a) => a.id !== id));
      setRemovingId(null);
      syncFromServer();
    });
  };

  const dataSignature = initialApps
    .map((a) => `${a.id}|${a.sortOrder}|${a.title}|${a.url}|${a.description ?? ""}`)
    .join("~~");

  useEffect(() => {
    setItems(initialApps);
  }, [dataSignature, initialApps]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h2 className="mb-2 text-xl font-bold text-[var(--wsu-gray)]">Add application</h2>
      <p className="mb-4 text-sm text-[var(--wsu-gray-mid)]">
        Titles and URLs appear on the public page. Descriptions are optional. Drag cards in the frame
        below to set order, then changes save automatically.
      </p>

      <form id="add-app-form" action={handleAdd} className="mb-8 space-y-3 rounded-[10px] bg-white p-4 shadow-[0_4px_14px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
        <div>
          <label htmlFor="title" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
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
          <label htmlFor="url" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
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
          <label htmlFor="description" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--wsu-gray-mid)]">
            Description <span className="font-normal normal-case text-[var(--wsu-gray-mid)]">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full resize-y rounded-lg border border-[var(--wsu-gray-light)] px-3 py-2 text-sm outline-none ring-[var(--wsu-crimson)] focus:ring-2"
            placeholder="Short blurb shown on the card"
          />
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
          {formPending ? "Saving…" : "Add card"}
        </button>
      </form>

      <h2 className="mb-2 text-xl font-bold text-[var(--wsu-gray)]">Card order</h2>
      <p className="mb-3 text-sm text-[var(--wsu-gray-mid)]">
        Drag by the handle. Order matches the public landing page.
      </p>

      <div className="min-h-[200px] rounded-[12px] border-2 border-dashed border-[var(--wsu-gray-mid)]/35 bg-[var(--wsu-bg)]/80 p-4">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--wsu-gray-mid)]">No cards yet. Add one above.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {items.map((app) => (
                  <li key={app.id}>
                    <SortableRow
                      app={app}
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
  );
}
