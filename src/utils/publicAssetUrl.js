export function publicAssetUrl(path) {
  if (!path) return "";

  // Leave external and embedded image URLs as they are.
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path)) {
    return path;
  }

  const baseUrl = import.meta.env.BASE_URL || "/";
  const assetPath = String(path).replace(/^\/+/, "");
  const basePath = baseUrl.replace(/^\/+|\/+$/g, "");

  // Avoid adding the deployment base twice if a path already includes it.
  if (basePath && (assetPath === basePath || assetPath.startsWith(`${basePath}/`))) {
    return `/${assetPath}`;
  }

  return `${baseUrl}${assetPath}`;
}
