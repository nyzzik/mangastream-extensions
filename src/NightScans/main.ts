import { BasicAcceptedElems, CheerioAPI } from "cheerio";
import { MangaStreamGeneric } from "../MangaStream";
import { AnyNode } from "domhandler";
import config from "./pbconfig"

const DOMAIN = 'https://nightsup.net'

// export const InfernalVoidScansInfo: SourceInfo = {
//     version: getExportVersion('0.0.4'),
//     name: 'InfernalVoidScans',
//     description: `Extension that pulls manga from ${DOMAIN}`,
//     author: 'nicknitewolf',
//     authorWebsite: 'http://github.com/nicknitewolf',
//     icon: 'icon.png',
//     contentRating: ContentRating.MATURE,
//     websiteBaseURL: DOMAIN,
//     intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED | SourceIntents.SETTINGS_UI,
//     sourceTags: []
// }

class NightScansExt extends MangaStreamGeneric {
    name: string = config.name;

    domain: string = DOMAIN

    override configureSections() {
        this.latestUpdatesSection.selectorFunc = ($: CheerioAPI) => $('div.bsx', $('h2:contains(Latest Update)')?.parent()?.next())
        this.latestUpdatesSection.subtitleSelectorFunc = ($: CheerioAPI, element: BasicAcceptedElems<AnyNode>) => $('a.maincl', element).first().text().trim()
    }
}

export const NightScans = new NightScansExt();