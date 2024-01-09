const core = require("@actions/core");
const github = require("@actions/github");
const semver = require("semver");

const nova_url = "https://nova.laravel.com";
const repo = "outl1ne/nova-multiselect-field";
const github_api_url = "https://api.github.com";
const latest_release_url = `${github_api_url}/repos/${repo}/releases/latest`;

async function main() {
  const releases_url = await fetch(`${nova_url}/packages.json`)
    .then((data) => data.json())
    .then((res) => Object.keys(res["includes"])[0]);

  const nova_releases = await fetch(`${nova_url}/${releases_url}`)
    .then((data) => data.json())
    .then((res) => res["packages"]["laravel/nova"]);

  const nova_prod_releases = Object.keys(nova_releases)
    .filter((release) => !release.includes("dev"))
    .sort(semver.compare)
    .map(semver.clean);

  const current_release = await fetch(latest_release_url)
    .then((data) => data.json())
    .then((res) => res["tag_name"]);

  let next_prod_release;
  let has_more_releases = false;
  const last_nova_release = nova_prod_releases[nova_prod_releases.length - 1];

  if (current_release) {
    const current_release_idx = nova_prod_releases.indexOf(current_release);
    next_prod_release = nova_prod_releases[current_release_idx + 1];
    has_more_releases = next_prod_release !== last_nova_release;
  } else {
    // If we don't have existing releases, let's download the two latest
    next_prod_release = nova_prod_releases.slice(-2)[0];
    has_more_releases = true;
  }

  console.log("current release:", current_release);
  console.log("next_prod_release:", next_prod_release);
  console.log("has_more_releases:", has_more_releases);
}

try {
  main();
} catch (error) {
  core.setFailed(error.message);
}
