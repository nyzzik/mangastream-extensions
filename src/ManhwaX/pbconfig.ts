import { ContentRating, SourceInfo, SourceIntents } from "@paperback/types";

export default {
    name: "ManhwaX",
    description: "Extension that pulls content from manhwax.top.",
    version: "1.0.0-alpha.1",
    icon: "icon.jpg",
    language: "en",
    contentRating: ContentRating.ADULT,
    badges: [
        { label: "18+", textColor: "#000000", backgroundColor: "#FF0000" },
    ],
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
