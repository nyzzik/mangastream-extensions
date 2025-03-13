import { ContentRating } from "@paperback/types";
import { MangaStreamGeneric } from "../generic/MangaStream";
import config from "./pbconfig";
import pbconfig from "./pbconfig";

const DOMAIN_NAME = "https://xcalibrscans.com";

class xCalibrScansExt extends MangaStreamGeneric {
    name: string = config.name;
    domain: string = DOMAIN_NAME;
    contentRating: ContentRating = pbconfig.contentRating;
}

export const xCalibrScans = new xCalibrScansExt();
