export type NavigationItem = {
  label: string;
  href: string;
};

export type UserRole = "client" | "admin";

export type ProcessStatus =
  | "pending_review"
  | "documentation"
  | "in_progress"
  | "finalized";
