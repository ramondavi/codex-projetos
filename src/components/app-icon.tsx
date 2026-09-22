import type { ReactNode, SVGProps } from "react";

export type AppIconName = "account" | "admin" | "arrowRight" | "book" | "calendar" | "check" | "document" | "edit" | "external" | "help" | "home" | "inbox" | "lock" | "logout" | "panelCollapse" | "panelExpand" | "queue" | "request" | "review" | "search" | "settings" | "shield" | "upload" | "work";

const paths: Record<AppIconName, ReactNode> = {
  account: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-3.7 3-5.5 7-5.5s6.3 1.8 7 5.5" /></>,
  admin: <><circle cx="12" cy="8" r="3" /><path d="M5 20c.8-3.5 3-5 7-5s6.2 1.5 7 5M19 6v4M17 8h4" /></>,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16M8 7h8M8 11h8" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18M8 14h3M8 17h6" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  document: <><path d="M6 3h9l3 3v15H6zM15 3v4h4M9 12h6M9 16h4" /></>,
  edit: <><path d="m4 16.5-.8 4.3 4.3-.8L19 8.5 15.5 5zM13.8 6.7l3.5 3.5" /></>,
  external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M17 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.7 9a2.5 2.5 0 1 1 4.5 1.5c-.9 1.1-2.2 1.4-2.2 3M12 17h.01" /></>,
  home: <><path d="m3 11 9-8 9 8v9H4v-9" /><path d="M9 20v-5h6v5" /></>,
  inbox: <><path d="M4 4h16v14H4zM4 14h5l1.5 2h3L15 14h5" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  logout: <><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10" /></>,
  panelCollapse: <><rect x="3.5" y="4" width="17" height="16" rx="2" /><path d="M9 4v16M16 9l-3 3 3 3" /></>,
  panelExpand: <><rect x="3.5" y="4" width="17" height="16" rx="2" /><path d="M9 4v16M12 9l3 3-3 3" /></>,
  queue: <><path d="M8 6h12M8 12h12M8 18h12" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>,
  request: <><path d="M6 3h9l3 3v15H6zM15 3v4h4M9 12h6M9 16h4" /></>,
  review: <><path d="m5 12 4 4L19 6" /><path d="M20 12a8 8 0 1 1-3-6.2" /></>,
  search: <><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.3 4.3" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.5 2.5-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-3.6v-.2a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L5.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3.8v-3.6H4a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1L7.7 5l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h3.6v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.5 2.5-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2V14H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
  shield: <><path d="M12 3 20 6v5c0 5-3.4 8-8 10-4.6-2-8-5-8-10V6z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
  upload: <><path d="M4 15v4h16v-4M12 4v11M8 8l4-4 4 4" /></>,
  work: <><rect x="3" y="6" width="18" height="14" rx="2" /><path d="M8 6V4h8v2M3 12h18M10 12v2h4v-2" /></>,
};

export function AppIcon({ name, className, ...props }: { name: AppIconName } & SVGProps<SVGSVGElement>) {
  return <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>{paths[name]}</svg>;
}
