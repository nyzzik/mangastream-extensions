import { MangaStreamGeneric } from "../MangaStream";
import config from "./pbconfig"

const DOMAIN: string = "https://astrascans.org"

class AstraScansExt extends MangaStreamGeneric{

    domain = DOMAIN;
    name = config.name

    // override initialise(): Promise<void> {
    //     throw new Error("Method not implemented.");
    // }
}


export const AstraScans = new AstraScansExt(); 