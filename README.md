# Laravel Nova Release Tracking

Tracks Laravel/Nova releases by pushing the changes to your repository seemlessly.
Twice a day at midday and midnight the github actions will run a scheduled action which will check for new releases.

### Setup

1. **Fork** the repository
2. **Secrets** need to be configured
   - `NOVA_PASSWORD`: liscense password
   - `NOVA_USER`: liscense username/email
   - `NOVA_REPO_ACCESS_TOKEN`: PAT to your private nova tracking repository
3. **Variables**
   - `TARGET_NOVA_REPO` owner/name for the target nova repository (example: outl1ne/nova)

## Contribution

Issues & Pull Requests are welcome.<br>

## Credits

- [Kaspar Rosin](https://github.com/KasparRosin)
