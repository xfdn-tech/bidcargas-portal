import { cn } from "@/lib/cn";

type NavIconProps = {
  iconKey?: string | null;
  className?: string;
};

export function NavIcon({ iconKey, className }: NavIconProps) {
  const props = {
    viewBox: "0 0 24 24",
    className: cn("h-5 w-5", className),
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth: 1.75,
  };

  switch (iconKey) {
    case "package":
      return (
        <svg {...props}>
          <path d="M12 22 2 17V7l10-5 10 5v10l-10 5Z" />
          <path d="M12 22V12M22 7l-10 5L2 7" />
        </svg>
      );
    case "user":
      return (
        <svg {...props}>
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="8" r="4" />
        </svg>
      );
    case "users":
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "truck":
      return (
        <svg {...props}>
          <path d="M3 17h2.5a2 2 0 0 0 4 0H14a2 2 0 0 0 4 0H21" />
          <path d="M5 17V8l2.5-2H16L19 8v9" />
        </svg>
      );
    case "clipboard":
      return (
        <svg {...props}>
          <path d="M9 5h6M8 3h8a1 1 0 0 1 1 1v2H7V4a1 1 0 0 1 1-1Z" />
          <rect x="6" y="6" width="12" height="15" rx="2" />
          <path d="M9 11h6M9 15h4" />
        </svg>
      );
    case "home":
    default:
      return (
        <svg {...props}>
          <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      );
  }
}
