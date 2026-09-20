import { createFileRoute } from "@tanstack/react-router";
import { ProfileEditor } from "@/components/profile-editor/ProfileEditor";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Profile Halo — Private Profile Picture Overlay Maker" },
      { name: "description", content: "Create a custom profile picture frame and export it for LinkedIn, Instagram, YouTube, or Telegram. Your photo never leaves your device." },
      { property: "og:title", content: "Profile Halo — Profile Picture Overlay Maker" },
      { property: "og:description", content: "Create private, custom profile picture frames directly in your browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <ProfileEditor />;
}
