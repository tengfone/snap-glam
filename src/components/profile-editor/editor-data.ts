export type OverlayPreset = {
  id: string;
  label: string;
  text: string;
  background: string;
  foreground: string;
};

export type ExportPreset = {
  id: string;
  label: string;
  size: number;
  maxMb?: number;
  note: string;
  source?: string;
  official: boolean;
};

export const overlayPresets: OverlayPreset[] = [
  { id: "open", label: "Open to work", text: "#OPEN TO WORK", background: "#167a54", foreground: "#ffffff" },
  { id: "hiring", label: "We’re hiring", text: "#WE'RE HIRING", background: "#e4543f", foreground: "#ffffff" },
  { id: "connect", label: "Let’s connect", text: "LET'S CONNECT", background: "#f1c84b", foreground: "#171915" },
  { id: "coffee", label: "Coffee first", text: "COFFEE FIRST", background: "#272923", foreground: "#ffffff" },
  { id: "offline", label: "Probably offline", text: "PROBABLY OFFLINE", background: "#6585e6", foreground: "#ffffff" },
  { id: "custom", label: "Make your own", text: "YOUR MESSAGE", background: "#167a54", foreground: "#ffffff" },
];

export const exportPresets: ExportPreset[] = [
  { id: "linkedin", label: "LinkedIn", size: 400, maxMb: 8, note: "Official: 400×400 minimum · PNG or JPG · 8 MB max", source: "https://www.linkedin.com/help/linkedin/answer/a549049", official: true },
  { id: "instagram", label: "Instagram", size: 1080, note: "Recommended high-quality square · official upload limits are not published", source: "https://www.facebook.com/help/instagram/557544397610546", official: false },
  { id: "youtube", label: "YouTube", size: 800, maxMb: 15, note: "Recommended high-quality square · JPG or PNG · 15 MB max", source: "https://support.google.com/youtube/answer/10456525", official: true },
  { id: "telegram", label: "Telegram", size: 512, note: "Recommended square · official avatar limits are not published", source: "https://core.telegram.org/api/profile", official: false },
  { id: "custom", label: "Custom", size: 1000, note: "Choose your own dimensions and format", official: false },
];
