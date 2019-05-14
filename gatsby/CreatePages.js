const path = require("path");

module.exports = ({ actions, graphql }) => {
  const { createPage } = actions;

  return graphql(`
    {
      allMarkdownRemark(
        limit: 1000
        sort: { order: DESC, fields: frontmatter___date }
      ) {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              tags
              templateKey
              slug
            }
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      result.errors.forEach(e => console.error(e.toString()));
      return Promise.reject(result.errors);
    }

    const posts = result.data.allMarkdownRemark.edges;

    const tagSet = new Set();

    posts.forEach(({ node }, index) => {
      const { id, frontmatter, fields } = node;
      const { slug, tags, templateKey } = frontmatter;

      if (tags) {
        tags.forEach(item => tagSet.add(item));
      }

      let $path = fields.slug;
      if (slug) {
        $path = `${slug}/`;
      }

      const component = templateKey || "blog-post";

      createPage({
        path: $path,
        tags,
        component: path.resolve(`src/templates/${String(component)}.js`),
        // additional data can be passed via context
        context: {
          id,
          index
        }
      });
    });

    return tagSet.forEach(tag => {
      createPage({
        path: `/tag/${tag}/`,
        component: path.resolve("src/templates/tag.js"),
        context: {
          tag
        }
      });
    });
  });
};
