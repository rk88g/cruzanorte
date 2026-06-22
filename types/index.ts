export type NavigationItem = {
  label: string;
  href: string;
};

export type ProcessStatus =
  | "pending_review"
  | "documentation"
  | "in_progress"
  | "finalized";
