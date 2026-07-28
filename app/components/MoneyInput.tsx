"use client";

import { formatKoreanWon } from "../lib/calculator";

interface MoneyInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  hint?: string;
}

export function MoneyInput({
  id,
  label,
  value,
  onChange,
  disabled = false,
  hint,
}: MoneyInputProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="money-wrap">
        <input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          disabled={disabled}
          value={value ? value.toLocaleString("ko-KR") : ""}
          placeholder="0"
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "");
            onChange(digits ? Math.min(Number(digits), Number.MAX_SAFE_INTEGER) : 0);
          }}
          aria-describedby={`${id}-words${hint ? ` ${id}-hint` : ""}`}
        />
        <span>원</span>
      </div>
      <small id={`${id}-words`}>{formatKoreanWon(value)}</small>
      {hint && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
    </div>
  );
}
