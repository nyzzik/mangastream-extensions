export function getIncludedTagBySection(
  section: string,
  tags: string[],
): string {
  return (
    tags
      ?.find((x: string) => x.startsWith(`${section}:`))
      ?.replace(`${section}:`, "") ?? ""
  ).replace(" ", "+");
}

export function getFilterTagsBySection(
  section: string,
  tags: string[],
  included: boolean,
  supportsExclusion = false,
): string[] {
  if (!included && !supportsExclusion) {
    return [];
  }

  return tags
    ?.filter((x: string) => x.startsWith(`${section}:`))
    .map((x: string) => {
      let id: string = x.replace(`${section}:`, "");
      if (!included) {
        id = encodeURI(`-${id}`);
      }
      return id;
    });
}
