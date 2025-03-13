import { ContentRating } from "@paperback/types";
import { BasicAcceptedElems, CheerioAPI } from "cheerio";
import { AnyNode } from "domhandler";
import { MangaStreamGeneric } from "../generic/MangaStream";
import config from "./pbconfig";
import pbconfig from "./pbconfig";

const DOMAIN_NAME: string = "https://manhwax.top/";

class ManhwaXExt extends MangaStreamGeneric {
    domain = DOMAIN_NAME;
    name = config.name;
    contentRating: ContentRating = pbconfig.contentRating;

    override configureSections(): void {
        this.featuredSection.enabled = false;
        this.latestUpdatesSection.selectorFunc = ($: CheerioAPI) =>
            $("div.bsx", $("h2:contains(Latest Update)")?.parent()?.next());
        this.latestUpdatesSection.subtitleSelectorFunc = (
            $: CheerioAPI,
            element: BasicAcceptedElems<AnyNode>,
        ) => $("div.epxs", element).first().text().trim();
    }
}

export const ManhwaX = new ManhwaXExt();
