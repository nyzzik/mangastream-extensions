import { ContentRating, SourceInfo, SourceIntents } from "@paperback/types";

export default {
  name: "Night Scans",
  description: "The https://nightsup.net extension.",
  version: "1.0.0",
  icon: "icon.png",
  language: "en",
  contentRating: ContentRating.MATURE,
  badges: [],
  capabilities:
    SourceIntents.MANGA_CHAPTERS |
    SourceIntents.DISCOVER_SECIONS |
    SourceIntents.SETTINGS_UI | 
    SourceIntents.MANGA_SEARCH,
  developers: [
    {
      name: "nyzzik",
      github: "https://github.com/nyzzik",
    },
  ],
} satisfies SourceInfo;