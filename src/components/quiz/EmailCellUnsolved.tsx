import React from "react";

export type EmailCellProps = {
  emails: string[];
};

export const EmailCellUnsolved: React.FC<EmailCellProps> = ({ emails }) => {
  return (
    <div className="email-cell">
      <div className="email-cell__row">
        <div className="email-cell__list">{emails.join(", ")}</div>
      </div>
    </div>
  );
};
