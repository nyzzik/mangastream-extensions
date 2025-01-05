import { ContentRating, SourceInfo, SourceIntents } from "@paperback/types";

export default {
  name: "Astra Scans",
  description: "The astrascans.org extension.",
  version: "1.0.0",
  icon: "icon.png",
  language: "en",
  contentRating: ContentRating.MATURE,
  badges: [],
  capabilities:
    SourceIntents.MANGA_CHAPTERS |
    SourceIntents.DISCOVER_SECIONS |
    SourceIntents.SETTINGS_UI | 
    SourceIntents.MANGA_SEARCH |
    SourceIntents.CLOUDFLARE_BYPASS_REQUIRED,
  developers: [
    {
      name: "nyzzik",
      github: "https://github.com/nyzzik",
    },
  ],
} satisfies SourceInfo;
