export const SLUG_TO_NAME: Record<string, string> = {
  mechanical: "Mechanical",
  wrapping: "Wrapping",
  electrical: "Electrical",
  ppf: "PPF",
  painting: "Auto Painting",
  ceramic: "Ceramic",
  upholstery: "Upholstery",
  tinting: "Window Tinting",
};

export function getTitle(pathname: string): string {
  const m = pathname.match(/^\/services\/([^/]+)/);
  const slug = m?.[1]?.toLowerCase();

  if (slug && SLUG_TO_NAME[slug]) {
    return `YallaFinder | ${SLUG_TO_NAME[slug]}`;
  }

  switch (pathname) {
    case "/":
      return "YallaFinder";
    case "/about":
      return "YallaFinder | About";
    case "/contact":
      return "YallaFinder | Contact";
    case "/adminanalytics":
      return "YallaFinder | Admin Analytics";
    case "/partner":
      return "YallaFinder | Garage Partner";
    default:
      return "YallaFinder";
  }
}
