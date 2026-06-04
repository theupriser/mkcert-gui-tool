const path = require('path');
const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

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

if (isCI) {
  makers.push({
    name: '@electron-forge/maker-rpm',
    config: {},
  });
}

module.exports = {
  // FIX: Forceert Electron Forge om de installers ALTIJD in deze specifieke projectmap te bouwen
  outDir: path.join(__dirname, 'dist-packages'),
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: makers,
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
