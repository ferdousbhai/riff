import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "riff",
    identifier: "dev.ferdous.riff",
    version: "0.3.0",
  },
  build: {
    copy: {
      "dist/index.html": "views/mainview/index.html",
      "dist/assets": "views/mainview/assets",
    },
    watchIgnore: ["dist/**"],
    linux: {
      bundleCEF: true,
    },
  },
} satisfies ElectrobunConfig;
