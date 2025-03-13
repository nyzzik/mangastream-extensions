import { ContentRating } from "@paperback/types";
import { MangaStreamGeneric } from "../generic/MangaStream";
import config from "./pbconfig";
import pbconfig from "./pbconfig";

const DOMAIN_NAME: string = "https://cypheroscans.xyz/";

class CypherScansExtension extends MangaStreamGeneric {
    domain = DOMAIN_NAME;
    name = config.name;
    contentRating: ContentRating = pbconfig.contentRating;
}

export const CypherScans = new CypherScansExtension();
