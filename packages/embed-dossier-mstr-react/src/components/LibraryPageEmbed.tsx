import { EmbedLibraryPageConfig } from "../types";
import { useCreateLibraryPage } from "../hooks/useCreateLibraryPage";
import cn from "classnames";

interface LibraryPageEmbedProps {
  serverUrlLibrary: string;
  config?: Omit<EmbedLibraryPageConfig, "placeholder" | "serverUrl">;
  className?: string;
  style?: React.CSSProperties;
}

const LibraryPageEmbed = ({
  serverUrlLibrary,
  config,
  className,
  style,
}: LibraryPageEmbedProps) => {
  const { libraryPageRef } = useCreateLibraryPage({
    serverUrlLibrary,
    config,
  });

  return (
    <div ref={libraryPageRef} className={cn(className)} style={style}></div>
  );
};

export { LibraryPageEmbed };
