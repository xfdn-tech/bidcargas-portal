export type NavigationItem = {
  id: string;
  label: string;
  href: string;
  iconKey?: string | null;
  exactMatch: boolean;
};

export type NavigationSection = {
  id: string;
  label: string;
  items: NavigationItem[];
};
