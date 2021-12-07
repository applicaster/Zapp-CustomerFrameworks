import XRayLogger from "@applicaster/quick-brick-xray";

export const BaseSubsystem = "plugins/ch-media-login";

let logger = null;

const DEFAULT_CONFIG = {
  category: "General",
  subsystem: BaseSubsystem,
};

export function createLogger(config = DEFAULT_CONFIG) {
  if (!logger) {
    logger = new XRayLogger(config.category, config.subsystem);
  }

  return logger;
}
