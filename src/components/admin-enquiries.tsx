"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Enquiry, EnquiryStatus } from "@/lib/types";

export function AdminEnquiries({ initial }: { initial: Enquiry[] }) {
  const [rows, setRows] = useState(initial);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const editingNotes = useRef<string | null>(null);

  const list = useMemo(
    () =>
      rows.filter(
        (row) =>
          (status === "all" || row.status === status) &&
          `${row.reference} ${row.name} ${row.email} ${row.eventType} ${row.talent || ""}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [rows, query, status],
  );

  const refresh = useCallback(async (announce = false) => {
    if (editingNotes.current) return;
    if (announce) setRefreshing(true);
    try {
      const response = await fetch("/api/admin/enquiries", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not refresh enquiries.");
      const data = (await response.json()) as Enquiry[];
      setRows(data);
      setLastUpdated(new Date());
      if (announce) setMessage(`${data.length} ${data.length === 1 ? "enquiry" : "enquiries"} loaded.`);
    } catch (error) {
      if (announce) {
        setMessage(error instanceof Error ? error.message : "Could not refresh enquiries.");
      }
    } finally {
      if (announce) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => refresh(false), 15_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  async function update(id: string, patch: Partial<Enquiry>) {
    setMessage("Saving…");
    const response = await fetch(`/api/admin/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!response.ok) {
      setMessage("The enquiry could not be updated.");
      return;
    }
    const next = (await response.json()) as Enquiry;
    setRows((current) => current.map((row) => (row.id === id ? next : row)));
    setLastUpdated(new Date());
    setMessage("Changes saved.");
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Pipeline</p>
          <h1 className="display mt-3 text-6xl">Enquiries</h1>
          <p className="mt-3 text-sm text-black/50">
            {rows.length} total · updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn" onClick={() => refresh(true)} disabled={refreshing}>
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          <Link className="btn btn-dark" href="/api/admin/enquiries/export">
            Export CSV
          </Link>
        </div>
      </div>

      <p className="mt-3 min-h-5 text-sm" role="status" aria-live="polite">
        {message}
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search enquiries"
          className="h-11 flex-1 rounded-full border border-black/20 bg-white px-4"
          aria-label="Search enquiries"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-full border border-black/20 bg-white px-4"
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          {["new", "reviewing", "quoted", "confirmed", "closed"].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5 grid gap-4">
        {list.map((row) => (
          <article className="card p-5" key={row.id}>
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <span className="pill">{row.reference}</span>
                <h2 className="mt-3 text-xl font-bold">
                  {row.name} · {row.eventType}
                </h2>
                <p className="mt-1 text-sm text-black/55">
                  {row.email} · {row.eventDate} · {row.location} · {row.budget}
                </p>
                {(row.talent || row.service) && (
                  <p className="mt-2 text-xs font-bold uppercase tracking-wide text-black/45">
                    {[row.talent && `Talent: ${row.talent}`, row.service && `Service: ${row.service}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
              <select
                value={row.status}
                onChange={(event) =>
                  update(row.id, { status: event.target.value as EnquiryStatus })
                }
                className="h-10 rounded-lg border bg-white px-3 text-sm"
                aria-label={`Status for ${row.reference}`}
              >
                {["new", "reviewing", "quoted", "confirmed", "closed"].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <p className="text-sm leading-6 text-black/65">
                {row.message || "No additional brief."}
              </p>
              <textarea
                defaultValue={row.notes}
                onFocus={() => {
                  editingNotes.current = row.id;
                }}
                onBlur={(event) => {
                  editingNotes.current = null;
                  update(row.id, { notes: event.target.value });
                }}
                placeholder="Internal notes (saved when you leave this field)"
                className="min-h-24 rounded-lg border border-black/15 bg-white p-3 text-sm"
              />
            </div>
          </article>
        ))}
        {!list.length && (
          <div className="card p-10 text-center text-black/55">
            {rows.length
              ? "No enquiries match the current search or status filter."
              : "No enquiries have been submitted yet."}
          </div>
        )}
      </div>
    </>
  );
}
