import { ContentRating, SourceInfo, SourceIntents } from "@paperback/types";

export default {
    name: "Cypher Scans",
    description: "Extension that pulls content from cypheroscans.xyz.",
    version: "1.0.0-alpha.1",
    icon: "icon.png",
    language: "en",
    contentRating: ContentRating.EVERYONE,
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
