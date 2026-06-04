const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

// Controleer of de build op GitHub Actions draait via de standaard CI omgevingsvariabele
const isCI = process.env.CI === 'true';

const makers = [
  {
    name: '@electron-forge/maker-squirrel',
    config: {},
  },
  {
    name: '@electron-forge/maker-zip',
    platforms: ['darwin', 'linux'],
  },
  {
    name: '@electron-forge/maker-deb',
    config: {
      options: {
        categories: ['Utility', 'Development'],
        genericName: 'Local Certificate Generator'
      }
    },
  }
];

// Voeg de RPM-maker ALLEEN toe als de app in de GitHub Actions cloud (CI) wordt gebouwd
if (isCI) {
  makers.push({
    name: '@electron-forge/maker-rpm',
    config: {},
  });
}

module.exports = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: makers, // Gebruik de dynamisch opgebouwde lijst met makers
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
