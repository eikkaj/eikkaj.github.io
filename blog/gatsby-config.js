module.exports = {
  pathPrefix: "/blog",
  plugins: [
    {
      resolve: `gatsby-theme-blog`,
      options: {},
    },
  ],
  // Customize your site metadata:
  siteMetadata: {
    title: `Jackie Sweet's Blog`,
    author: `Jackie Sweet`,
    description: `thoughts and rantings about code and beyond`,
    social: [
      {
        name: `github`,
        url: `https://github.com/eikkaj`,
      },
    ],
  },
}
