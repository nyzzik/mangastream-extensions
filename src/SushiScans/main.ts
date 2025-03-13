import { ContentRating } from "@paperback/types";
import { CheerioAPI } from "cheerio";
import { MangaStreamGeneric } from "../generic/MangaStream";
import config from "./pbconfig";
import pbconfig from "./pbconfig";

const DOMAIN_NAME = "https://sushiscan.net";

class SushiScansExt extends MangaStreamGeneric {
    name: string = config.name;
    domain: string = DOMAIN_NAME;
    contentRating: ContentRating = pbconfig.contentRating;

    override directoryPath = "catalogue";

    override language = "🇫🇷";

    override mangaTagSelectorBox = "div.seriestugenre";

    override mangaSelectorArtist = "Dessinateur";
    override mangaSelectorAuthor = "Auteur";
    override mangaSelectorStatus = "Statut";

    override mangaStatusTypes = {
        ONGOING: "En Cours",
        COMPLETED: "Terminé",
    };

    override dateMonths = {
        january: "janvier",
        february: "février",
        march: "mars",
        april: "avril",
        may: "mai",
        june: "juin",
        july: "juillet",
        august: "août",
        september: "septembre",
        october: "octobre",
        november: "novembre",
        december: "décembre",
    };

    override configureSections() {
        this.featuredSection.selectorFunc = ($: CheerioAPI) =>
            $(
                "div.bsx",
                $("h2:contains(Populaire Aujourd'hui)")?.parent()?.next(),
            );
        this.latestUpdatesSection.selectorFunc = ($: CheerioAPI) =>
            $("div.bsx", $("h2:contains(Dernières Sorties)")?.parent()?.next());
    }
}

export const SushiScans = new SushiScansExt();
