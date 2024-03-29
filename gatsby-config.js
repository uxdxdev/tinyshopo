require('dotenv').config({ path: '.env.backend' });

var proxy = require('http-proxy-middleware');

module.exports = {
  siteMetadata: {
    title: `Tiny Shopo`
  },
  plugins: [
    `gatsby-plugin-favicon`,
    `gatsby-plugin-react-helmet`,
    // `gatsby-plugin-stripe-checkout`,
    // {
    //   resolve: `gatsby-plugin-google-analytics`,
    //   options: {
    //     trackingId: 'UA-63312977-14'
    //   }
    // },
    "gatsby-plugin-stripe",
    {
      resolve: `gatsby-source-stripe`,
      options: {
        objects: ['Sku'],
        secretKey: process.env.STRIPE_SECRET_KEY,
        // downloadFiles: true,
      }
    }
  ],
  // added to gatsby dev server to allow testing of Netlify lambda functions
  developMiddleware: app => {
    app.use(
      '/.netlify/functions/',
      proxy({
        target: 'http://localhost:9000',
        pathRewrite: {
          '/.netlify/functions/': ''
        }
      })
    );
  }
};
