import { Form, LabelRow, Section, ToggleRow } from "@paperback/types";

function toBoolean(value: unknown): boolean {
  return (value ?? false) === "true";
}

export function getUsePostIds(): boolean {
  return toBoolean(Application.getState("postIds"));
}

export function setUsePostIds(value: boolean): void {
  Application.setState(value.toString(), "postIds");
}

export class MangaStreamSettings extends Form {
  name: string;
  constructor(name: string) {
    super();
    this.name = name;
  }

  override getSections(): Application.FormSectionElement[] {
    return [
      Section(`${this.name} Settings`, [
        ToggleRow("postIds", {
          title: "Use Post IDs",
          value: getUsePostIds(),
          onValueChange: Application.Selector(
            this as MangaStreamSettings,
            "usePostIdsChange",
          ),
        }),
        LabelRow("label", {
          title: "",
          subtitle:
            "Enabling will make the source slower, but more reliable!\nCHANGING THIS OPTION WILL ERASE YOUR READING PROGRESS FOR THIS SOURCE!",
        }),
      ]),
    ];
  }

  async usePostIdsChange(value: boolean): Promise<void> {
    setUsePostIds(value);
  }
}
