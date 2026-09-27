/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Talent } from "@/lib/types";

const blank = {
  id: "",
  slug: "",
  name: "",
  discipline: "",
  location: "",
  bio: "",
  image: "",
  tags: [],
  featured: false,
  published: false,
} satisfies Talent;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminTalent({ initial }: { initial: Talent[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [edit, setEdit] = useState<Talent | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function startNew() {
    setMessage("");
    setEdit({ ...blank, tags: [] });
  }

  function startEdit(talent: Talent) {
    setMessage("");
    setEdit({ ...talent, tags: [...talent.tags] });
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!edit || saving || uploading) return;
    setSaving(true);
    setMessage("Saving profile…");

    try {
      const response = await fetch(
        edit.id ? `/api/admin/talent/${edit.id}` : "/api/admin/talent",
        {
          method: edit.id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(edit),
        },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "The profile could not be saved.");
      }

      setRows((current) => [data, ...current.filter((item) => item.id !== data.id)]);
      setEdit(null);
      setMessage(
        data.published
          ? "Profile saved and published on the website."
          : "Profile saved as a draft.",
      );
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The profile could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Remove this profile?")) return;
    setMessage("Removing profile…");
    const response = await fetch(`/api/admin/talent/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setMessage("The profile could not be removed.");
      return;
    }
    setRows((current) => current.filter((item) => item.id !== id));
    setMessage("Profile removed.");
    router.refresh();
  }

  async function upload(file?: File) {
    if (!file || !edit || uploading) return;
    const formData = new FormData();
    formData.set("file", file);
    setUploading(true);
    setMessage("Uploading image…");
    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Image upload failed.");
      setEdit((current) => (current ? { ...current, image: data.url } : current));
      setMessage("Image uploaded. Save the profile to finish.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Roster</p>
          <h1 className="display mt-3 text-6xl">Talent</h1>
        </div>
        <button onClick={startNew} className="btn btn-dark">
          Add profile
        </button>
      </div>
      <p className="mt-3 min-h-5 text-sm" role="status" aria-live="polite">
        {message}
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {rows.map((talent) => (
          <article className="card flex gap-4 p-4" key={talent.id}>
            {talent.image ? (
              <img
                src={talent.image}
                alt=""
                className="h-28 w-24 rounded-lg bg-black/5 object-cover"
              />
            ) : (
              <div className="h-28 w-24 rounded-lg bg-black/10" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2">
                <div>
                  <h2 className="font-bold">{talent.name}</h2>
                  <p className="text-xs text-black/50">{talent.discipline}</p>
                </div>
                <span className={`pill ${talent.published ? "bg-green-200" : "bg-gray-200"}`}>
                  {talent.published ? "Published" : "Draft"}
                </span>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button className="text-xs font-bold underline" onClick={() => startEdit(talent)}>
                  Edit
                </button>
                {talent.published && (
                  <Link
                    href={`/talent/${talent.slug}`}
                    target="_blank"
                    className="text-xs font-bold underline"
                  >
                    View live
                  </Link>
                )}
                <button
                  className="text-xs font-bold text-red-700 underline"
                  onClick={() => remove(talent.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {edit && (
        <div className="fixed inset-0 z-20 overflow-auto bg-black/60 p-4">
          <form
            onSubmit={save}
            className="mx-auto my-6 grid max-w-2xl gap-4 rounded-2xl bg-[#f4f0e8] p-6"
          >
            <div className="flex justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{edit.id ? "Edit" : "New"} profile</h2>
                <p className="mt-1 text-xs text-black/50">Fields marked * are required.</p>
              </div>
              <button type="button" onClick={() => setEdit(null)} aria-label="Close editor">
                ✕
              </button>
            </div>

            <div className="field">
              <label htmlFor="talent-name">Name *</label>
              <input
                id="talent-name"
                value={edit.name}
                minLength={2}
                onChange={(event) => {
                  const name = event.target.value;
                  setEdit((current) =>
                    current
                      ? {
                          ...current,
                          name,
                          slug:
                            !current.id &&
                            (!current.slug || current.slug === slugify(current.name))
                              ? slugify(name)
                              : current.slug,
                        }
                      : current,
                  );
                }}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="talent-slug">URL slug *</label>
              <input
                id="talent-slug"
                value={edit.slug}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                title="Use lowercase letters, numbers and hyphens only."
                onChange={(event) => setEdit({ ...edit, slug: slugify(event.target.value) })}
                required
              />
              <small className="text-black/50">Website address: /talent/{edit.slug || "profile-name"}</small>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="field">
                <label htmlFor="talent-discipline">Discipline *</label>
                <input
                  id="talent-discipline"
                  value={edit.discipline}
                  minLength={2}
                  onChange={(event) => setEdit({ ...edit, discipline: event.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="talent-location">Location *</label>
                <input
                  id="talent-location"
                  value={edit.location}
                  minLength={2}
                  onChange={(event) => setEdit({ ...edit, location: event.target.value })}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="talent-image">Image URL *</label>
              <input
                id="talent-image"
                type="url"
                value={edit.image}
                onChange={(event) => setEdit({ ...edit, image: event.target.value })}
                required
              />
            </div>
            <label className="btn justify-self-start">
              {uploading ? "Uploading…" : "Upload image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploading}
                onChange={(event) => upload(event.target.files?.[0])}
              />
            </label>
            {edit.image && (
              <img src={edit.image} alt="Profile preview" className="h-36 w-28 rounded-lg object-cover" />
            )}
            <div className="field">
              <label htmlFor="talent-bio">Biography *</label>
              <textarea
                id="talent-bio"
                value={edit.bio}
                minLength={10}
                onChange={(event) => setEdit({ ...edit, bio: event.target.value })}
                required
              />
              <small className="text-black/50">At least 10 characters.</small>
            </div>
            <div className="field">
              <label htmlFor="talent-tags">Tags (comma separated)</label>
              <input
                id="talent-tags"
                value={edit.tags.join(", ")}
                onChange={(event) =>
                  setEdit({
                    ...edit,
                    tags: event.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .filter(Boolean),
                  })
                }
              />
            </div>
            <div className="flex flex-wrap gap-5">
              <label>
                <input
                  type="checkbox"
                  checked={edit.featured}
                  onChange={(event) => setEdit({ ...edit, featured: event.target.checked })}
                />{" "}
                Featured on homepage
              </label>
              <label className="font-bold">
                <input
                  type="checkbox"
                  checked={edit.published}
                  onChange={(event) => setEdit({ ...edit, published: event.target.checked })}
                />{" "}
                Publish on website
              </label>
            </div>

            <p className="min-h-5 text-sm text-black/60" role="status" aria-live="polite">
              {message}
            </p>
            <button className="btn btn-lime" disabled={saving || uploading}>
              {saving ? "Saving…" : edit.published ? "Save and publish profile" : "Save as draft"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
