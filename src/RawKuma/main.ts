import { ContentRating } from "@paperback/types";
import { CheerioAPI } from "cheerio";
import { MangaStreamGeneric } from "../generic/MangaStream";
import config from "./pbconfig";
import pbconfig from "./pbconfig";

const DOMAIN_NAME = "https://rawkuma.com/";

class RawKumaExt extends MangaStreamGeneric {
    name: string = config.name;
    domain: string = DOMAIN_NAME;
    contentRating: ContentRating = pbconfig.contentRating;

    override language = "🇯🇵";

    override configureSections() {
        this.featuredSection.selectorFunc = ($: CheerioAPI) =>
            $("div.bsx", $("h3:contains(Popular Today)").parent().next());
        this.latestUpdatesSection.selectorFunc = ($: CheerioAPI) =>
            $("div.uta", $("h3:contains(Latest Update)")?.parent()?.next());
    }
}

export const RawKuma = new RawKumaExt();
