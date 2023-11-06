import type { FSModule } from "browserfs/dist/node/core/FS";
import { getInfoWithExtension } from "components/system/Files/FileEntry/functions";
import type { FileInfo } from "components/system/Files/FileEntry/useFileInfo";
import type { useFileSystem } from "contexts/fileSystem";
import { join } from "path";
import {
  ICON_CACHE,
  ICON_CACHE_EXTENSION,
  TEXT_EDITORS,
  YT_ICON_CACHE,
} from "utils/constants";
import { bufferToUrl, getExtension, isYouTubeUrl } from "utils/functions";

export type ResultInfo = { icon: string; pid: string; url: string };

export const getResultInfo = async (
  { fs, exists, readFile }: ReturnType<typeof useFileSystem>,
  url: string
): Promise<ResultInfo> => {
  const {
    icon,
    pid = TEXT_EDITORS[0],
    url: infoUrl,
  } = await new Promise<FileInfo>((resolve) => {
    getInfoWithExtension(fs as FSModule, url, getExtension(url), (fileInfo) =>
      resolve(fileInfo)
    );
  });
  const isYT = isYouTubeUrl(infoUrl);
  const cachedIconPath = join(
    isYT ? YT_ICON_CACHE : ICON_CACHE,
    `${
      isYT ? new URL(infoUrl).pathname.replace("/", "") : infoUrl
    }${ICON_CACHE_EXTENSION}`
  );
  let cachedIcon = "";

  if (await exists(cachedIconPath)) {
    cachedIcon = bufferToUrl(await readFile(cachedIconPath));
  }

  return {
    icon: cachedIcon || icon,
    pid,
    url: infoUrl || url,
  };
};