import { join } from "node:path";

export interface DataPaths {
  folder: string;
  profile: string;
  myRules: string;
  maps: string;
}

export function dataPaths(folder: string): DataPaths {
  return {
    folder,
    profile: join(folder, "profile.md"),
    myRules: join(folder, "my-rules.md"),
    maps: join(folder, "maps"),
  };
}
