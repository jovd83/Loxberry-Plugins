# LoxBerry Plugins

An overview of my [LoxBerry](https://www.loxberry.de/) plugins. This list is automatically rebuilt every day from the topics of my public GitHub repositories — any repo tagged with the topic `loxberry-plugin` shows up here.

## What is LoxBerry?

[**LoxBerry**](https://www.loxberry.de/) is a free, open-source Raspberry Pi–based companion platform for the [Loxone Miniserver](https://www.loxone.com/). It extends the Miniserver with capabilities that are not available out of the box by hosting community-maintained plugins that bridge third-party devices, services, and protocols (MQTT, REST, UDP, TCP, Modbus, WebSocket, …) to Loxone — typically through the built-in **MQTT Gateway** or virtual HTTP/UDP inputs.

Useful links:

- LoxBerry homepage: <https://www.loxberry.de/>
- LoxBerry on GitHub: <https://github.com/mschlenstedt/Loxberry>
- LoxBerry Wiki: <https://wiki.loxberry.de/>
- Loxone Miniserver: <https://www.loxone.com/>

## Plugins

Below is the live list of my LoxBerry plugin repositories (4 total). Each entry links to its GitHub repository and includes the repo's own description. Categorization is driven by GitHub topics — see [`plugins-config.json`](plugins-config.json) for the topic-to-category mapping.

## Energy & batteries

Plugins that integrate solar inverters, home batteries, energy meters, and other energy-related devices with Loxone.

### Battery & storage

Bridges between home battery / storage systems (or their clouds) and the Loxone Miniserver.

- **[loxberry-marstek-cloud](https://github.com/jovd83/loxberry-marstek-cloud)** — LoxBerry plugin: bridge Marstek Cloud (eu.hamedata.com) battery telemetry to a Loxone Miniserver via the built-in MQTT Gateway.

  *Topics:* `loxberry`, `loxberry-plugin`, `marstek`

## Garden & outdoor

Plugins for robotic mowers, irrigation, and other outdoor automation devices.

### Robotic mowers

Bridges between robotic lawn mowers and the Loxone Miniserver.

- **[LoxBerry-Plugin-mammotion-mower](https://github.com/jovd83/LoxBerry-Plugin-mammotion-mower)** — LoxBerry plugin: bridge Mammotion robot mowers (Luba/Luba 2/Yuka) into Loxone Miniserver via MQTT, using PyMammotion.

  *Topics:* `home-automation`, `loxberry`, `loxberry-plugin`, `loxone`, `luba`, `mammotion`, `mqtt`, `robot-mower`, `smart-home`, `yuka`

## Tools & generators

Tooling that helps create, scaffold, or maintain LoxBerry plugins rather than integrate a specific device.

### Plugin generators

Code generators and scaffolding tools that produce LoxBerry plugin projects.

- **[loxberry-integrator](https://github.com/jovd83/loxberry-integrator)** — Agent skill that generates GitHub-ready LoxBerry plugin projects integrating devices, services, APIs, or protocols (MQTT, REST, UDP, Modbus, WebSocket) with a Loxone Miniserver.

  *Topics:* `agentskills`, `code-generation`, `homeautomation`, `loxberry`, `loxberry-plugin`, `modbus`, `mqtt`, `plugin-generator`, `smarthome`

## Other LoxBerry plugins

Plugins that do not yet fit one of the categories above.

### Uncategorized

These plugins have not been assigned a category yet. Add a matching topic on the GitHub repository (see plugins-config.json) to slot them in automatically.

- **[Loxberry-Plugins](https://github.com/jovd83/Loxberry-Plugins)** — An overview of my LoxBerry plugins — auto-rebuilt daily from GitHub topics.

  *Topics:* `loxberry`, `loxberry-plugin`, `loxone`

## How this list is maintained

- A GitHub Actions workflow ([`.github/workflows/update-plugins.yml`](.github/workflows/update-plugins.yml)) runs daily at 00:00 UTC (and on manual dispatch).
- The workflow executes [`update-readme.js`](update-readme.js), which queries the GitHub API for all public, non-fork, non-archived repos owned by [`jovd83`](https://github.com/jovd83) and keeps those tagged with the topic `loxberry-plugin`.
- Each plugin is sorted into a category based on its other GitHub topics, using the rules defined in [`plugins-config.json`](plugins-config.json).
- To add a new plugin to this overview, simply add the `loxberry-plugin` topic to the new repository on GitHub — it will appear here within 24 hours.
