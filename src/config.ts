import { homedir } from "node:os";
import { join } from "node:path";

const DEFAULT_DATA_FOLDER = ".become-human";

export function dataDir(): string {
  return process.env.BECOME_HUMAN_HOME ?? join(homedir(), DEFAULT_DATA_FOLDER);
}
