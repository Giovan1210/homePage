import { WidgetType } from "@/enums/avatar.ts";
import { AVATAR_LAYER, NONE } from "@/utils/constant";
import { widgetData } from "@/utils/dynamic-data";
import { getRandomAvatarOption } from "@/utils";

/**
 * 构建头像 SVG 字符串（与 VueColorAvatar 相同渲染逻辑）。
 * 可复用在组件或服务端生成预览。
 */
export async function buildAvatarSvg(
  size = 50,
): Promise<string> {
  const safeOption =getRandomAvatarOption();
  if (!safeOption || !safeOption.widgets) {
    return "";
  }

  const finalSize = size;
  if (!finalSize || finalSize <= 0) return "";

  const widgets = safeOption.widgets;

  const sortedList = Object.entries(widgets).sort(
    ([prevShape, prev], [nextShape, next]) => {
      const ix =
        prev.zIndex ?? AVATAR_LAYER[prevShape as WidgetType]?.zIndex ?? 0;
      const iix =
        next.zIndex ?? AVATAR_LAYER[nextShape as WidgetType]?.zIndex ?? 0;
      return ix - iix;
    },
  );

  const promises: Promise<string>[] = sortedList.map(
    async ([widgetType, opt]) => {
      try {
        if (
          opt.shape !== NONE &&
          widgetData?.[widgetType as WidgetType]?.[opt.shape]
        ) {
          return (await widgetData[widgetType as WidgetType][opt.shape]())
            .default;
        }
      } catch (err) {
        console.error(
          "buildAvatarSvg widget import failed",
          widgetType,
          opt,
          err,
        );
      }
      return "";
    },
  );

  let skinColor: string | undefined;

  const svgRawList = await Promise.all(promises).then((raw) => {
    return raw.map((svgRaw, i) => {
      const [widgetType, widget] = sortedList[i];
      let widgetFillColor = widget.fillColor;

      if (widgetType === WidgetType.Face) {
        skinColor = widgetFillColor;
      }
      if (skinColor && widgetType === WidgetType.Ear) {
        widgetFillColor = skinColor;
      }

      const content = svgRaw
        .slice(svgRaw.indexOf(">", svgRaw.indexOf("<svg")) + 1)
        .replace("</svg>", "")
        .replace(/\$fillColor/g, widgetFillColor || "transparent");

      return `
        <g id="vue-color-avatar-${sortedList[i][0]}">
          ${content}
        </g>
      `;
    });
  });

  // 固定视窗，缩放内容以适配不同尺寸，避免小尺寸裁剪
  const baseView = 400; // 与原组件一致的视图尺寸
  const translateX = 100;
  const translateY = 65;

  return `
    <svg
      width="${finalSize}"
      height="${finalSize}"
      viewBox="0 0 ${baseView} ${baseView}"
      preserveAspectRatio="xMidYMax meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(${translateX}, ${translateY})">
        ${svgRawList.join("")}
      </g>
    </svg>
  `;
}
