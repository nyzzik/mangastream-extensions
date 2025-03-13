import { ContentRating } from "@paperback/types";
import { CheerioAPI } from "cheerio";
import { MangaStreamGeneric } from "../generic/MangaStream";
import config from "./pbconfig";
import pbconfig from "./pbconfig";

const DOMAIN_NAME = "https://mythicscans.net/";

class MythicScansExt extends MangaStreamGeneric {
    name: string = config.name;
    domain: string = DOMAIN_NAME;
    contentRating: ContentRating = pbconfig.contentRating;

    override configureSections() {
        this.latestUpdatesSection.selectorFunc = ($: CheerioAPI) =>
            $("div.bsx", $("h2:contains(Latest Update)").parent().next());
    }
}

export const MythicScans = new MythicScansExt();
