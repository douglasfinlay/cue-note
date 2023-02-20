import { MakerDMG } from '@electron-forge/maker-dmg';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { WebpackPlugin } from '@electron-forge/plugin-webpack';
import { PublisherGithub } from '@electron-forge/publisher-github';
import type { ForgeConfig } from '@electron-forge/shared-types';

import { mainConfig } from './webpack.main.config';
import { rendererConfig } from './webpack.renderer.config';

const config: ForgeConfig = {
    packagerConfig: {},
    rebuildConfig: {},
    makers: [new MakerDMG({}), new MakerSquirrel({})],
    publishers: [
        new PublisherGithub({
            draft: true,
            repository: {
                owner: 'douglasfinlay',
                name: 'cue-note',
            },
            tagPrefix: '',
        }),
    ],
    plugins: [
        new WebpackPlugin({
            mainConfig,
            renderer: {
                config: rendererConfig,
                entryPoints: [
                    {
                        html: './src/index.html',
                        js: './src/renderer.tsx',
                        name: 'main_window',
                        preload: {
                            js: './src/preload.ts',
                        },
                    },
                ],
            },
        }),
    ],
};

export default config;
