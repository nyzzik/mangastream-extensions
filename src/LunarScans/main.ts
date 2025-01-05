import { ContentRating } from "@paperback/types";
import { MangaStreamGeneric } from "../MangaStream";
import config from "./pbconfig"

const DOMAIN: string = "https://lunarscan.org/"

class LunarScansExt extends MangaStreamGeneric{

    domain = DOMAIN;
    name = config.name

    override directoryPath = 'series'
    override defaultContentRating: ContentRating = config.contentRating;

    // override initialise(): Promise<void> {
    //     throw new Error("Method not implemented.");
    // }
}


export const LunarScans = new LunarScansExt(); 