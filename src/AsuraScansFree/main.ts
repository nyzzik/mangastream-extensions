import { BasicAcceptedElems, CheerioAPI } from "cheerio";
import { MangaStreamGeneric } from "../MangaStream";
import { AnyNode } from "domhandler";
import config from "./pbconfig"

const DOMAIN: string = "https://asurascansfree.com"

class AsuraScansFreeExtension extends MangaStreamGeneric{

    domain = DOMAIN;
    name = config.name

    override directoryPath: string = "serie";

    override configureSections(): void {
        this.latestUpdatesSection.selectorFunc = ($: CheerioAPI) => $('div.bsx', $('h2:contains(Latest Update)')?.parent()?.next());
        this.latestUpdatesSection.subtitleSelectorFunc = ($: CheerioAPI, element: BasicAcceptedElems<AnyNode>) => $('.fivchap', element).first().text().trim();
    }
}


export const AsuraScansFree = new AsuraScansFreeExtension(); 