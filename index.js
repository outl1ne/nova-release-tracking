require("dotenv").config();
import { getInput, setOutput, setFailed, info } from "@actions/core";
import { getOctokit } from "@actions/github";
import { compare } from "semver";

const nova_url = "https://nova.laravel.com";

async function run() {
  const token = getInput("personal_access_token");
  const [owner, repo] = getInput("target_nova_repo").split("/");
  const nova_user = getInput("nova_user");
  const nova_password = getInput("nova_password");
  const auth_encoded = btoa(`${nova_user}:${nova_password}`);
  const octokit = getOctokit(token);

  const releases_url = await fetch(`${nova_url}/packages.json`)
    .then((data) => data.json())
    .then((res) => Object.keys(res["includes"])[0]);

  const nova_releases = await fetch(`${nova_url}/${releases_url}`)
    .then((data) => data.json())
    .then((res) => res["packages"]["laravel/nova"]);

  const nova_release_tags = Object.keys(nova_releases)
    .filter((release) => !release.includes("dev"))
    .sort(compare);

  const current_release = await octokit
    .request("GET /repos/{owner}/{repo}/releases/latest", {
      owner,
      repo,
    })
    .then(({ data }) => data["tag_name"])
    .catch(() => null);

  let next_prod_release_tag;
  let has_more_releases = false;
  const last_nova_release_tag = nova_release_tags[nova_release_tags.length - 1];

  if (current_release) {
    const current_release_idx = nova_release_tags.indexOf(current_release);
    next_prod_release_tag = nova_release_tags[current_release_idx + 1];
    has_more_releases = next_prod_release_tag !== last_nova_release_tag;
  } else {
    // If we don't have existing releases, let's download the two latest
    next_prod_release_tag = nova_release_tags.slice(-2)[0];
    has_more_releases = true;
  }

  if (!next_prod_release_tag || !nova_releases[next_prod_release_tag]) {
    console.log("🚨 No valid next release tag found.");
    console.log("next_prod_release_tag:", next_prod_release_tag);
    console.log("Available nova_releases:", Object.keys(nova_releases));
    process.exitCode = 78; 
    return; 
  }

  const next_prod_release = nova_releases[next_prod_release_tag];
  const nova_dist_url = next_prod_release["dist"]["url"];

  setOutput("nova_dist_url", nova_dist_url);
  setOutput("next_release_tag", next_prod_release_tag);
  setOutput("current_release_tag", current_release);
  setOutput("nova_auth_encoded", auth_encoded);
}

try {
  run();
} catch (error) {
  setFailed(error.message);
}
