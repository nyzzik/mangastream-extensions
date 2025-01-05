import { PaperbackInterceptor, Request, Response } from "@paperback/types";

export class MangaStreamInterceptor extends PaperbackInterceptor {
  domain: string;

  constructor(id: string, domain: string) {
    super(id);
    this.domain = domain;
  }

  override async interceptRequest(request: Request): Promise<Request> {
    request.headers = {
      ...(request.headers ?? {}),
      ...{
        "user-agent": await Application.getDefaultUserAgent(),
        referer: `${this.domain}/`,
        ...((request.url.includes("wordpress.com") ||
          request.url.includes("wp.com")) && {
          Accept: "image/avif,image/webp,*/*",
        }), // Used for images hosted on Wordpress blogs
      },
    };

    return request;
  }

  override async interceptResponse(
    request: Request,
    response: Response,
    data: ArrayBuffer,
  ): Promise<ArrayBuffer> {
    return data;
  }
}
