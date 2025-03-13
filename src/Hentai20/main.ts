import { ContentRating } from "@paperback/types";
import { MangaStreamGeneric } from "../generic/MangaStream";
import config from "./pbconfig";
import pbconfig from "./pbconfig";

const DOMAIN_NAME: string = "https://hentai20.io";

class Hentai20Extension extends MangaStreamGeneric {
    domain = DOMAIN_NAME;
    name = config.name;

    contentRating: ContentRating = pbconfig.contentRating;
}

export const Hentai20 = new Hentai20Extension();
