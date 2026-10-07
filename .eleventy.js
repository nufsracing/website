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
  // sets CF_PAGES_URL on every build, so only branch previews use it and the
  // live site always uses the real domain
  const isPreview =
    process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== "main";
  eleventyConfig.addGlobalData(
    "baseUrl",
    isPreview ? process.env.CF_PAGES_URL : "https://nufsracing.co.uk",
  );

  return { dir: { input: "src" } };
};
