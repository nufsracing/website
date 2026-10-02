module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");

  eleventyConfig.addFilter("monthsUntil", (dateString) => {
    const target = new Date(dateString);
    const today = new Date();
    return (
      (target.getFullYear() - today.getFullYear()) * 12 +
      (target.getMonth() - today.getMonth())
    );
  });

  // adds up the points for one type of event, static or dynamic
  eleventyConfig.addFilter("points", (events, type) =>
    events.filter((event) => event.type === type).reduce((total, event) => total + event.points, 0)
  );

  // the live address, so link previews point at the right image. cloudflare
  // and netlify set these on their preview builds, otherwise it is the real domain
  eleventyConfig.addGlobalData(
    "baseUrl",
    process.env.CF_PAGES_URL || process.env.URL || "https://nufsracing.co.uk",
  );

  return { dir: { input: "src" } };
};
