import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import { EmailCell } from "./EmailCell";
import "./quiz.css";

type Row = {
  id: string;
  subject: string;
  recipients: string[];
};

const CASES: Row[] = [
  {
    id: "C1",
    subject: "Single long email",
    recipients: [
      "very-long-email-address-for-testing-truncation@example-company-domain.com",
    ],
  },
  {
    id: "C2",
    subject: "Two short emails",
    recipients: ["a@test.com", "b@test.com"],
  },
  {
    id: "C3",
    subject: "Many emails mixed",
    recipients: [
      "a@test.com",
      "b@test.com",
      "c@test.com",
      "d@test.com",
      "e@test.com",
    ],
  },
  {
    id: "C4",
    subject: "One super long + one short",
    recipients: [
      "someone-really-really-long-address@sub.domain.example.com",
      "x@x.io",
    ],
  },
  {
    id: "C5",
    subject: "Edge: empty",
    recipients: [],
  },
  {
    id: "C6",
    subject: "Three medium emails",
    recipients: ["alice@example.com", "bob@example.com", "charlie@example.com"],
  },
  {
    id: "C7",
    subject: "Edge: one empty string",
    recipients: [""],
  },
  {
    id: "C8",
    subject: "Edge: duplicate emails",
    recipients: ["dup@test.com", "dup@test.com", "unique@test.com"],
  },
  {
    id: "C9",
    subject: "Edge: special characters",
    recipients: [
      "user+tag@domain.com",
      "name.surname@company.co.uk",
      "weird_email@sub.domain.io",
    ],
  },
  {
    id: "C10",
    subject: "Edge: max length test",
    recipients: [
      "a@a.com",
      "b@b.com",
      "c@c.com",
      "d@d.com",
      "e@e.com",
      "f@f.com",
      "g@g.com",
      "h@h.com",
      "i@i.com",
      "j@j.com",
    ],
  },
];

const useElementWidth = (ref: React.RefObject<HTMLElement | null>) => {
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      setW(Math.max(0, Math.floor(entry.contentRect.width)));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return w;
};

export const EmailCellQuiz: React.FC = () => {
  const [colPct, setColPct] = useState(40);
  const tableWrapRef = useRef<HTMLDivElement>(null);
  const tableW = useElementWidth(tableWrapRef);

  const recipientsColWidthPx = useMemo(() => {
    const min = 160;
    const px = Math.max(min, Math.round((colPct / 100) * (tableW || 800)));
    return px;
  }, [colPct, tableW]);

  return (
    <div className="quiz-wrap">
      <h2 className="quiz-title">Email Recipients Visual Quiz</h2>

      <div className="quiz-panel">
        <div className="quiz-controls">
          <label className="quiz-label">
            Recipients column width: <b>{recipientsColWidthPx}px</b> ({colPct}%)
          </label>
          <input
            className="quiz-slider"
            type="range"
            min={10}
            max={80}
            value={colPct}
            onChange={(e) => setColPct(Number(e.target.value))}
          />
          <div className="quiz-note">
            Move the slider to simulate narrow vs wide cell space.
          </div>
        </div>

        <div className="quiz-table-wrap" ref={tableWrapRef}>
          <table className="tbl quiz-table">
            <thead>
              <tr>
                <th style={{ width: 90 }}>ID</th>
                <th>Subject</th>
                <th style={{ width: recipientsColWidthPx }}>
                  Recipients (Email)
                </th>
              </tr>
            </thead>
            <tbody>
              {CASES.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.subject}</td>
                  <td>
                    <EmailCell emails={r.recipients} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="hint">
            Goal: the cell's behavior must follow the rules listed in the
            challenge checklist below.
          </p>
        </div>
      </div>

      <Checklist />
    </div>
  );
};

const Checklist: React.FC = () => {
  const items = [
    "Cell shows the list of emails that fully FIT within the width (no truncation) — unless only one email fits.",
    "If only one email fits → show the first email. If it's too long, use ellipsis.",
    "If only one email fits and there are more emails → show a +N badge on the right; hovering the badge reveals a tooltip with all emails.",
    "If at least 2 full emails fit → show as many as possible (without truncation). If there are more, show a +N badge (tooltip: full list).",
    'Separator between emails must be ", " (comma + space) and must not cut through email text.',
    "Tooltip must contain the complete list of emails, separated by commas.",
    "Column width changes (slider) must react in real-time without heavy re-renders (use ResizeObserver or similar).",
    "Basic accessibility: the badge should have an aria-label/role suitable for screen readers.",
    'Edge case: if no emails exist → display a minus sign ("–") or a consistent empty state.',
  ];
  return (
    <div className="quiz-checklist">
      <h3>Checklist Challenge</h3>
      <ol>
        {items.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ol>
      <p className="quiz-tip">
        Tip: don't just count characters. Measure the <em>actual text width</em>
        (font-aware) for accuracy.
      </p>
    </div>
  );
};
