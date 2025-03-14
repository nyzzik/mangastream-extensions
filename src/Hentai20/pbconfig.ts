import { ContentRating, SourceInfo, SourceIntents } from "@paperback/types";

export default {
    name: "Hentai20",
    description: "Extension that pulls content from hentai20.io.",
    version: "1.0.0-alpha.1",
    icon: "icon.jpg",
    language: "en",
    contentRating: ContentRating.ADULT,
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
