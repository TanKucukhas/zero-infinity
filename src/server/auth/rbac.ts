export type Role = "admin" | "editor" | "viewer";
export function canEdit(role: Role) { return role === "admin" || role === "editor"; }
export function canAdmin(role: Role) { return role === "admin"; }




