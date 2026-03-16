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
    mac: {
      bundleCEF: false,
    },
    linux: {
      // CEF recommended on Linux for WebKitGTK limitations
      bundleCEF: true,
    },
    win: {
      bundleCEF: false,
    },
  },
} satisfies ElectrobunConfig;
