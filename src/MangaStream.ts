import {
  BasicRateLimiter,
  Chapter,
  ChapterDetails,
  ChapterProviding,
  CloudflareBypassRequestProviding,
  CloudflareError,
  ContentRating,
  Cookie,
  CookieStorageInterceptor,
  DiscoverSection,
  DiscoverSectionItem,
  DiscoverSectionProviding,
  DiscoverSectionType,
  Extension,
  Form,
  MangaProviding,
  PagedResults,
  PaperbackInterceptor,
  Request,
  Response,
  SearchQuery,
  SearchResultItem,
  SearchResultsProviding,
  SettingsFormProviding,
  SourceManga,
  TagSection,
} from "@paperback/types";
import * as cheerio from "cheerio";
import { AnyNode } from "domhandler";
import {
  getFilterTagsBySection,
  getIncludedTagBySection,
} from "./MangaStreamHelper";
import { MangaStreamInterceptor } from "./MangaStreamIntercetor";
import {
  MangaStreamDiscoverSection,
  MangaStreamSearchMetadata,
  MangaStreamSlug,
  Months,
  StatusTypes,
} from "./MangaStreamInterfaces";
import { MangaStreamParser } from "./MangaStreamParser";
import { getUsePostIds, MangaStreamSettings } from "./MangaStreamSettingsForm";
import { URLBuilder } from "./utils/url-builder/base";

export abstract class MangaStreamGeneric
  implements
    Extension,
    SearchResultsProviding,
    MangaProviding,
    ChapterProviding,
    SettingsFormProviding,
    DiscoverSectionProviding,
    CloudflareBypassRequestProviding
{
  count = 0;

  abstract domain: string;
  abstract name: string;
  directoryPath: string = "manga";
  defaultContentRating: ContentRating = ContentRating.MATURE;

  parser: MangaStreamParser = new MangaStreamParser();

  requestManager: PaperbackInterceptor | undefined;

  language = "🇬🇧";

  bypassPage = "";
  mangaSelectorAlternativeTitles = "Alternative Titles";
  mangaSelectorAuthor = "Author";
  mangaSelectorArtist = "Artist";
  mangaSelectorStatus = "Status";
  mangaTagSelectorBox = "span.mgen";

  mangaStatusTypes: StatusTypes = {
    ONGOING: "ONGOING",
    COMPLETED: "COMPLETED",
  };

  dateMonths: Months = {
    january: "January",
    february: "February",
    march: "March",
    april: "April",
    may: "May",
    june: "June",
    july: "July",
    august: "August",
    september: "September",
    october: "October",
    november: "November",
    december: "December",
  };

  featuredSection: MangaStreamDiscoverSection = {
    id: "popular",
    title: "Popular Today",
    type: DiscoverSectionType.featured,
    selectorFunc: ($: cheerio.CheerioAPI) =>
      $("div.bsx", $("h2:contains(Popular Today)")?.parent()?.next()),
    titleSelectorFunc: (
      $: cheerio.CheerioAPI,
      element: cheerio.BasicAcceptedElems<AnyNode>,
    ) => $("a", element).attr("title") ?? "",
    subtitleSelectorFunc: (
      $: cheerio.CheerioAPI,
      element: cheerio.BasicAcceptedElems<AnyNode>,
    ) => $("div.epxs", element).first().text().trim(),
    itemType: "featuredCarouselItem",
  };

  latestUpdatesSection: MangaStreamDiscoverSection = {
    id: "latest_updates",
    title: "Latest Updates",
    type: DiscoverSectionType.simpleCarousel,
    selectorFunc: ($: cheerio.CheerioAPI) =>
      $("div.uta", $("h2:contains(Latest Update)")?.parent()?.next()),
    titleSelectorFunc: (
      $: cheerio.CheerioAPI,
      element: cheerio.BasicAcceptedElems<AnyNode>,
    ) => $("a", element).attr("title") ?? "",
    subtitleSelectorFunc: (
      $: cheerio.CheerioAPI,
      element: cheerio.BasicAcceptedElems<AnyNode>,
    ) =>
      $("li > a, div.epxs", $("div.luf, div.bigor", element))
        .first()
        .text()
        .trim(),
    itemType: "chapterUpdatesCarouselItem",
  };

  discoverSections: MangaStreamDiscoverSection[] = [
    this.featuredSection,
    this.latestUpdatesSection,
  ];

  constructor() {
    this.setup();
    this.configureSections();
  }

  setup() {
    this.requestManager = new MangaStreamInterceptor("main", this.domain);
  }

  globalRateLimiter = new BasicRateLimiter("ratelimiter", {
    numberOfRequests: 20,
    bufferInterval: 1,
    ignoreImages: true,
  });

  cookieStorageInterceptor = new CookieStorageInterceptor({
    storage: "stateManager",
  });

  async initialise(): Promise<void> {
    // throw new Error("Method not implemented.");
    this.globalRateLimiter.registerInterceptor();
    this.cookieStorageInterceptor.registerInterceptor();
    this.requestManager?.registerInterceptor();
    if (Application.isResourceLimited) return;

    try {
      for (const tags of await this.getSearchTags()) {
        Application.registerSearchFilter({
          type: "multiselect",
          options: tags.tags.map((x) => ({ id: x.id, value: x.title })),
          id: tags.id,
          allowExclusion: false,
          title: tags.title,
          value: {},
          allowEmptySelection: true,
          maximum: undefined,
        });
      }
    } catch (e) {
      console.log(e);
    }

    console.log("h");
  }

  async getSearchTags(): Promise<TagSection[]> {
    let tags: TagSection[] = Application.getState("tags") as TagSection[];
    if (tags) {
      return tags;
    }
    const request = {
      url: `${this.domain}/${this.directoryPath}/`,
      method: "GET",
    };

    const [response, buffer] = await Application.scheduleRequest(request);
    this.checkResponseError(request, response);
    const $ = cheerio.load(Application.arrayBufferToUTF8String(buffer));
    tags = this.parser.parseTags($);
    for (const tag of tags[0].tags) {
      console.log(tag.id);
    }
    Application.setState(tags, "tags");
    return tags;
  }

  async getSearchResults(
    query: SearchQuery,
    metadata: MangaStreamSearchMetadata | undefined,
  ): Promise<PagedResults<SearchResultItem>> {
    // console.log("Count: " + this.count);
    // console.log(
    //   "Cookie Count: " + this.cookieStorageInterceptor.cookies.length,
    // );
    // this.cookieStorageInterceptor.cookies.forEach((cookie) => {
    //   console.log("Cookie: " + cookie.name);
    // });
    const page: number = metadata?.page ?? 1;

    let urlBuilder: URLBuilder = new URLBuilder(this.domain)
      .addPath(this.directoryPath)
      .addQuery("page", page.toString());

    if (query?.title) {
      urlBuilder = urlBuilder.addQuery(
        "s",
        encodeURIComponent(query?.title.replace(/[’–][a-z]*/g, "") ?? ""),
      );
    } else {
      const includedTags: string[] = [];
      for (const filter of query.filters) {
        const tags = (filter.value ?? {}) as Record<
          string,
          "included" | "excluded"
        >;
        for (const tag of Object.entries(tags)) {
          includedTags.push(tag[0]);
        }
      }
      console.log(includedTags.length);
      console.log(includedTags.toString());
      urlBuilder = urlBuilder
        .addQuery("genre", getFilterTagsBySection("genres", includedTags, true))
        .addQuery("status", getIncludedTagBySection("status", includedTags))
        .addQuery("type", getIncludedTagBySection("type", includedTags))
        .addQuery("order", getIncludedTagBySection("order", includedTags));
    }

    const request = {
      url: urlBuilder.build(),
      method: "GET",
    };
    // const response = await this.requestManager.schedule(request, 1)
    const [response, buffer] = await Application.scheduleRequest(request);
    this.checkResponseError(request, response);
    // console.log(response.status);
    const $ = cheerio.load(Application.arrayBufferToUTF8String(buffer));
    // console.log("Cheerio Title:", $("title").text());
    // console.log($().html());
    const results = this.parser.parseSearchResults($);

    const manga: SearchResultItem[] = [];
    for (const result of results) {
      let mangaId: string = result.mangaId;
      if (getUsePostIds()) {
        mangaId = await this.slugToPostId(result.mangaId, result.path);
      }

      manga.push({
        mangaId,
        title: result.title,
        subtitle: result.subtitle,
        imageUrl: result.imageUrl,
      });
    }

    metadata = !this.parser.isLastPage($, "view_more")
      ? { page: page + 1 }
      : undefined;
    return {
      items: manga,
      metadata,
    };
  }

  supportsTagExclusion(): boolean {
    return false;
  }

  async getMangaDetails(mangaId: string): Promise<SourceManga> {
    const request: Request = {
      url: getUsePostIds()
        ? `${this.domain}/?p=${mangaId}/`
        : `${this.domain}/${this.directoryPath}/${mangaId}/`,
      method: "GET",
    };

    // const response = await this.requestManager.schedule(request, 1)
    const [response, buffer] = await Application.scheduleRequest(request);
    this.checkResponseError(request, response);
    const $ = cheerio.load(Application.arrayBufferToUTF8String(buffer));

    return this.parser.parseMangaDetails($, mangaId, this);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getChapters(sourceManga: SourceManga, _?: Date): Promise<Chapter[]> {
    const request = {
      url: getUsePostIds()
        ? `${this.domain}/?p=${sourceManga.mangaId}/`
        : `${this.domain}/${this.directoryPath}/${sourceManga.mangaId}/`,
      method: "GET",
    };

    // const response = await this.requestManager.schedule(request, 1)
    const [response, buffer] = await Application.scheduleRequest(request);
    this.checkResponseError(request, response);
    const $ = cheerio.load(Application.arrayBufferToUTF8String(buffer));

    return this.parser.parseChapterList($, sourceManga, this);
  }
  async getChapterDetails(chap: Chapter): Promise<ChapterDetails> {
    // Request the manga page
    const request = {
      url: getUsePostIds()
        ? `${this.domain}/?p=${chap.sourceManga.mangaId}/`
        : `${this.domain}/${this.directoryPath}/${chap.sourceManga.mangaId}/`,
      method: "GET",
    };

    // const response = await this.requestManager.schedule(request, 1)
    const [response, buffer] = await Application.scheduleRequest(request);
    this.checkResponseError(request, response);
    const $ = cheerio.load(Application.arrayBufferToUTF8String(buffer));

    //const chapter = $('div#chapterlist').find('li[data-num="' + chapterId + '"]')
    const chapters = $("div#chapterlist").find("li").toArray();
    if (chapters.length === 0) {
      throw new Error(
        `Unable to fetch chapter list for manga with mangaId: ${chap.sourceManga.mangaId}`,
      );
    }

    const chapter = chapters.find(
      (x) => $(x).attr("data-num") === chap.chapterId,
    );
    if (!chapter) {
      throw new Error(
        `Unable to fetch a chapter for chapter number: ${chap.chapterId}`,
      );
    }

    // Fetch the ID (URL) of the chapter
    const id = $("a", chapter).attr("href") ?? "";
    if (!id) {
      throw new Error(
        `Unable to fetch id for chapter with chapter id: ${chap.chapterId}`,
      );
    }
    // Request the chapter page
    const _request: Request = {
      url: id,
      method: "GET",
    };

    // const _response = await this.requestManager.schedule(_request, 1)
    const [_response, _buffer] = await Application.scheduleRequest(_request);
    this.checkResponseError(_request, _response);
    const _$ = cheerio.load(Application.arrayBufferToUTF8String(_buffer));

    return this.parser.parseChapterDetails(_$, chap);
  }

  async getDiscoverSections(): Promise<DiscoverSection[]> {
    return this.discoverSections.map((x: MangaStreamDiscoverSection) => {
      return { id: x.id, subtitle: x.subtitle, type: x.type, title: x.title };
    });
  }
  async getDiscoverSectionItems(
    section: DiscoverSection,
    metadata: unknown,
  ): Promise<PagedResults<DiscoverSectionItem>> {
    const request = {
      url: this.domain,
      method: "GET",
    };

    const [response, buffer] = await Application.scheduleRequest(request);
    // console.log("--------------------------")
    // console.log("Cookies discover response");
    // console.log(response.cookies.length)
    // console.log(response.cookies.toString())
    // console.log(this.cookieStorageInterceptor.cookies.length)
    // console.log(this.cookieStorageInterceptor.cookies.toString());
    // console.log("--------------------------")
    this.checkResponseError(request, response);
    const $ = cheerio.load(Application.arrayBufferToUTF8String(buffer));
    let s: MangaStreamDiscoverSection;
    switch (section.id) {
      case "featured":
      case "popular":
        s = this.featuredSection;
        break;
      case "latest_updates":
      default:
        s = this.latestUpdatesSection;
        break;
    }

    return { items: await this.parser.parseHomeSection($, s, this), metadata };
  }

  async getSettingsForm(): Promise<Form> {
    return new MangaStreamSettings(this.name);
  }

  async saveCloudflareBypassCookies(cookies: Cookie[]): Promise<void> {
    this.count += 1;
    for (const cookie of cookies) {
      if (cookie.expires && cookie.expires.getUTCMilliseconds() <= Date.now()) {
        continue;
      }
      if (
        cookie.name.startsWith("cf") ||
        cookie.name.startsWith("_cf") ||
        cookie.name.startsWith("__cf")
      ) {
        console.log("saving cloudflare cookie " + cookie.name);
        console.log(cookie.expires);
        this.cookieStorageInterceptor.setCookie(cookie);
      }
    }
  }

  checkResponseError(request: Request, response: Response): void {
    switch (response.status) {
      case 403:
      case 503:
        throw new CloudflareError(request, "Error Code: " + response.status);
      case 404:
        throw new Error(`The requested page ${response.url} was not found!`);
    }
  }

  async slugToPostId(slug: string, path: string): Promise<string> {
    if ((await Application.getState(slug)) == null) {
      const postId = await this.convertSlugToPostId(slug, path);

      const existingMappedSlug = await Application.getState(postId);
      if (existingMappedSlug != null) {
        Application.setState(undefined, slug);
      }

      Application.setState(postId, slug);
      Application.setState(slug, postId);
    }

    const postId = Application.getState(slug) as string;
    if (!postId) {
      throw new Error(`Unable to fetch postId for slug:${slug}`);
    }

    return postId;
  }

  async convertPostIdToSlug(postId: number): Promise<MangaStreamSlug> {
    const request = {
      url: `${this.domain}/?p=${postId}`,
      method: "GET",
    };

    const [_, buffer] = await Application.scheduleRequest(request);
    const $ = cheerio.load(Application.arrayBufferToUTF8String(buffer));

    let parseSlug: string;
    // Step 1: Try to get slug from og-url
    parseSlug = String($('meta[property="og:url"]').attr("content"));

    // Step 2: Try to get slug from canonical
    if (!parseSlug.includes(this.domain)) {
      parseSlug = String($('link[rel="canonical"]').attr("href"));
    }

    if (!parseSlug || !parseSlug.includes(this.domain)) {
      throw new Error("Unable to parse slug!");
    }

    const parseSlugArr = parseSlug.replace(/\/$/, "").split("/");

    const slug: string = parseSlugArr.slice(-1).pop() as string;
    const path: string = parseSlugArr.slice(-2).shift() as string;

    return {
      path,
      slug,
    };
  }

  async convertSlugToPostId(slug: string, path: string): Promise<string> {
    // Credit to the MadaraDex team :-D
    const headRequest = {
      url: `${this.domain}/${path}/${slug}/`,
      method: "HEAD",
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [headResponse, __] = await Application.scheduleRequest(headRequest);
    this.checkResponseError(headRequest, headResponse);

    let postId: string;

    const postIdRegex = headResponse?.headers.Link?.match(/\?p=(\d+)/);
    if (postIdRegex?.[1]) {
      postId = postIdRegex[1];
    } else {
      postId = "";
    }

    if (postId || !isNaN(Number(postId))) {
      return postId?.toString();
    }

    const request = {
      url: `${this.domain}/${path}/${slug}/`,
      method: "GET",
    };

    const [_, buffer] = await Application.scheduleRequest(request);
    const $ = cheerio.load(Application.arrayBufferToUTF8String(buffer));

    // Step 1: Try to get postId from shortlink
    let postIdNum = Number(
      $('link[rel="shortlink"]')?.attr("href")?.split("/?p=")[1],
    );

    // Step 2: If no number has been found, try to parse from data-id
    if (isNaN(postIdNum)) {
      postIdNum = Number($("div.bookmark").attr("data-id"));
    }

    // Step 3: If no number has been found, try to parse from manga script
    if (isNaN(postIdNum)) {
      const page = $.root().html();
      const match = page?.match(/postID.*\D(\d+)/);
      if (match != null && match[1]) {
        postIdNum = Number(match[1]?.trim());
      }
    }

    if (!postIdNum || isNaN(postIdNum)) {
      throw new Error(
        `Unable to fetch numeric postId for this item! (path:${path} slug:${slug})`,
      );
    }

    return postIdNum.toString();
  }

  configureSections(): void {}
}
