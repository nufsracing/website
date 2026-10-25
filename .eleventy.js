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

  // the year the site was built, for the footer copyright
  eleventyConfig.addGlobalData("year", new Date().getFullYear());

  return { dir: { input: "src" } };
};
