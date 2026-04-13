import { EmbedLibraryPageConfig } from "../types";
import { useCreateLibraryPage } from "../hooks/useCreateLibraryPage";
import { clsx } from "clsx";

interface LibraryPageEmbedProps {
  /** Base URL of the MicroStrategy Library server */
  serverUrlLibrary: string;
  /** Library page configuration */
  config?: Omit<EmbedLibraryPageConfig, "placeholder" | "serverUrl">;
  /** Optional CSS class names */
  className?: string;
  /** Optional inline styles */
  style?: React.CSSProperties;
}

/**
 * Embeds a MicroStrategy Library Page.
 *
 * @example
 * ```tsx
 * <LibraryPageEmbed
 *   serverUrlLibrary="https://your-server.com/MicroStrategyLibrary"
 *   style={{ width: "100%", height: "800px" }}
 * />
 * ```
 */
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
    <div ref={libraryPageRef} className={clsx(className)} style={style} />
  );
};

export { LibraryPageEmbed };
export type { LibraryPageEmbedProps };
