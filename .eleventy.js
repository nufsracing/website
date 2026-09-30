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

  return { dir: { input: "src" } };
};
