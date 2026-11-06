import { getToken, getEndpoint, saveConfig } from "../config.js";

// ponytail: cli token persistence; upgrade to interactive oauth flow when supported
export async function run({ positionals = [], flags = {} }) {
  const token = getToken();
  if (!token) throw new Error("No token provided. Set MEGABRAIN_TOKEN.");
  const effectiveEndpoint = flags.endpoint || getEndpoint();
  saveConfig({ token, endpoint: effectiveEndpoint });
  const out = { status: "ok", token: Boolean(token), endpoint: effectiveEndpoint };
  console.log(flags.json ? JSON.stringify(out) : `Configured credentials for ${effectiveEndpoint}`);
  return out;
}
