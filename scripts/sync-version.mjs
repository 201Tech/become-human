// Runs on `npm version`: copies the package version to every place that repeats it.
import { readFileSync, writeFileSync } from "node:fs";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const writeJson = (path, data) => writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);

const { name, version } = readJson("package.json");

const server = readJson("server.json");
server.version = version;
server.packages.forEach((pkg) => (pkg.version = version));
writeJson("server.json", server);

const plugin = readJson("plugin/.claude-plugin/plugin.json");
plugin.version = version;
writeJson("plugin/.claude-plugin/plugin.json", plugin);

const mcp = readJson("plugin/.mcp.json");
mcp.mcpServers[name].args = ["-y", `${name}@${version}`];
writeJson("plugin/.mcp.json", mcp);

console.log(`Synced version ${version}`);
