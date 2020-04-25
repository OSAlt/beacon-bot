module.exports = {
  title: 'GeekBeacon',
  tagline: 'Geek Beacon Discord Bot',
  url: 'https://osalt.github.io',
  baseUrl: '/beacon-bot/',
  favicon: 'img/favicon.ico',
  organizationName: 'osalt', // Usually your GitHub org/user name.
  projectName: 'beacon-bot', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Beacon Bot',
      logo: {
        alt: 'Beacon Bot Logo',
        src: 'img/logo.png',
      },
      links: [
        {
          to: 'docs/install',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
       {
          to: 'docs/user_guide',
          activeBasePath: 'docs',
          label: 'User Guides',
          position: 'left',
        },
        {

          href: 'https://github.com/OSAlt/beacon-bot',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Style Guide',
              to: 'docs/doc1',
            },
            {
              label: 'Second Doc',
              to: 'docs/doc2',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
          ],
        },
        {
          title: 'Social',
          items: [
            {
              label: 'Blog',
              to: 'blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/docusaurus',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
