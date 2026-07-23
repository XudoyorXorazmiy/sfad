"use client";

import { useState, useTransition } from "react";
import { submitForm } from "@/app/(site)/actions";
import type { FormType } from "@/lib/generated/prisma/enums";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--white)",
  border: "1px solid var(--line)",
  borderRadius: 12,
  padding: "14px 16px",
  font: "400 15px var(--font-manrope), Manrope, sans-serif",
  color: "var(--ink)",
  outline: "none",
  transition: "border-color .25s, box-shadow .25s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 7,
};

function Field({
  name,
  label,
  type = "text",
  required,
  textarea,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  const [focus, setFocus] = useState(false);
  const style = {
    ...inputStyle,
    ...(focus
      ? { borderColor: "var(--sfad-red)", boxShadow: "0 0 0 3px rgba(200,16,46,.12)" }
      : {}),
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle} htmlFor={name}>
        {label}
        {required && " *"}
      </label>
      {textarea ? (
        <textarea
          id={name}
          name={name}
          rows={4}
          required={required}
          style={{ ...style, resize: "vertical" }}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          style={style}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        />
      )}
    </div>
  );
}

/** Universal sayt formasi — natija Submission jadvaliga tushadi */
export function ContactForm({
  type,
  fields,
  labels,
  submitLabel,
  successLabel,
}: {
  type: FormType;
  fields: { name: string; label: string; type?: string; required?: boolean; textarea?: boolean }[];
  labels?: Record<string, string>;
  submitLabel: string;
  successLabel: string;
}) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <div
        style={{
          borderRadius: 16,
          background: "rgba(16,185,129,.08)",
          border: "1px solid rgba(16,185,129,.25)",
          padding: 24,
          textAlign: "center",
          fontWeight: 600,
          color: "#047857",
        }}
      >
        {successLabel || "✓ Yuborildi"}
      </div>
    );
  }

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          const data: Record<string, string> = {};
          for (const f of fields) data[f.name] = String(fd.get(f.name) ?? "");
          const res = await submitForm(type, data, String(fd.get("website") ?? ""));
          if (res.ok) setDone(true);
          else setError(res.error);
        })
      }
    >
      {fields.map((f) => (
        <Field
          key={f.name}
          name={f.name}
          label={labels?.[f.name] ?? f.label}
          type={f.type}
          required={f.required}
          textarea={f.textarea}
        />
      ))}

      {/* honeypot — foydalanuvchiga ko'rinmaydi */}
      <input
        name="website"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
        aria-hidden
      />

      {error && (
        <p style={{ color: "var(--sfad-red)", fontSize: 14, marginBottom: 12 }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        data-sheen="1"
        style={{
          width: "100%",
          background: "var(--sfad-red)",
          color: "#fff",
          border: 0,
          borderRadius: 14,
          padding: "16px 28px",
          font: "600 15px var(--font-manrope), Manrope, sans-serif",
          cursor: pending ? "wait" : "pointer",
          boxShadow: "0 10px 24px rgba(200,16,46,.22)",
        }}
      >
        {pending ? "Yuborilmoqda…" : submitLabel}
      </button>
    </form>
  );
}
