/**
 * Convert bytes to a human readable string (KB, MB, GB).
 * Uses 1024 as the unit base.
 * Examples:
 *  - 0 => "0 B"
 *  - 1024 => "1 KB"
 *  - 1536 => "1.5 KB"
 */
export function formatSize(bytes: number): string {
  if (
    typeof bytes !== "number" ||
    Number.isNaN(bytes) ||
    !Number.isFinite(bytes)
  ) {
    return "-";
  }
  if (bytes === 0) return "0 B";

  const KB = 1024;
  const MB = KB * 1024;
  const GB = MB * 1024;

  const format = (value: number) => {
    // show one decimal for values < 10, otherwise no decimals
    const fixed = value < 10 ? value.toFixed(1) : Math.round(value).toString();
    // trim trailing .0
    return fixed.replace(/\.0$/, "");
  };

  if (bytes < KB) return `${bytes} B`;
  if (bytes < MB) return `${format(bytes / KB)} KB`;
  if (bytes < GB) return `${format(bytes / MB)} MB`;
  return `${format(bytes / GB)} GB`;
}

export default formatSize;
