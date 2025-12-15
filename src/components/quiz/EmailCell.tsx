import React, { useRef, useState, useLayoutEffect } from "react";

export type EmailCellProps = {
  emails: string[];
};

const measureText = (text: string, font: string): number => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return text.length * 8;
  ctx.font = font;
  return ctx.measureText(text).width;
};

const getFont = (el: HTMLElement): string => {
  const style = window.getComputedStyle(el);
  return `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
};

export const EmailCell: React.FC<EmailCellProps> = ({ emails }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(emails.length);
  const [showTooltip, setShowTooltip] = useState(false);

  useLayoutEffect(() => {
    if (!containerRef.current || emails.length === 0) return;

    const container = containerRef.current;
    const font = getFont(container);

    const ro = new ResizeObserver(() => {
      const availableWidth = container.clientWidth;
      const separatorWidth = measureText(", ", font);
      const badgePadding = 40;

      let count = 0;
      let totalWidth = 0;

      for (let i = 0; i < emails.length; i++) {
        const emailWidth = measureText(emails[i], font);
        const separatorSpace = i > 0 ? separatorWidth : 0;
        const potentialWidth = totalWidth + separatorSpace + emailWidth;

        const needsBadge = i < emails.length - 1;
        const requiredWidth = needsBadge
          ? potentialWidth + badgePadding
          : potentialWidth;

        if (requiredWidth <= availableWidth) {
          totalWidth = potentialWidth;
          count = i + 1;
        } else {
          break;
        }
      }

      if (count === 0) {
        count = 1;
      }

      setVisibleCount(count);
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, [emails]);

  if (emails.length === 0) {
    return (
      <div ref={containerRef} className="email-cell">
        <div className="email-cell__row">–</div>
      </div>
    );
  }

  if (emails.length === 1 && emails[0] === "") {
    return (
      <div ref={containerRef} className="email-cell">
        <div className="email-cell__row">–</div>
      </div>
    );
  }

  const visibleEmails = emails.slice(0, visibleCount);
  const remainingCount = emails.length - visibleCount;
  const hasMore = remainingCount > 0;

  const shouldTruncateFirst = visibleCount === 1 && emails.length >= 1;

  return (
    <div ref={containerRef} className="email-cell">
      <div className="email-cell__row">
        <div
          className="email-cell__list"
          style={{
            overflow: shouldTruncateFirst ? "hidden" : "visible",
            textOverflow: shouldTruncateFirst ? "ellipsis" : "clip",
            whiteSpace: shouldTruncateFirst ? "nowrap" : "normal",
            flex: 1,
            minWidth: 0,
          }}
        >
          {visibleEmails.join(", ")}
        </div>
        {hasMore && (
          <div
            className="email-cell__badge"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            role="button"
            aria-label={`${remainingCount} more email${
              remainingCount !== 1 ? "s" : ""
            }: ${emails.join(", ")}`}
            tabIndex={0}
            style={{
              position: "relative",
              marginLeft: "4px",
              padding: "2px 6px",
              background: "#e0e0e0",
              borderRadius: "4px",
              fontSize: "0.85em",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            +{remainingCount}
            {showTooltip && (
              <div
                style={{
                  position: "absolute",
                  bottom: "100%",
                  right: 0,
                  marginBottom: "4px",
                  padding: "8px 12px",
                  background: "#333",
                  color: "#fff",
                  borderRadius: "4px",
                  fontSize: "0.9em",
                  whiteSpace: "normal",
                  width: "310px",
                  wordBreak: "break-word",
                  zIndex: 1000,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {emails.join(", ")}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
