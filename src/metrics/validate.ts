import type {Vault} from 'obsidian';
import {moment} from 'obsidian';

export async function ensureVaultMetricsFile(vault: Vault): Promise<void> {
  const statsExists = vault.adapter.exists('.obsidian/vault-stats.json');
  const metricsExists = vault.adapter.exists('.obsidian/vault-metrics.json');

  if (statsExists && !metricsExists) {
    const statsFile = await vault.adapter.read('.obsidian/vault-stats.json');
    await vault.adapter.write('.obsidian/vault-metrics.json', statsFile);
    await vault.adapter.remove('.obsidian/vault-stats.json');
  }

  if (!statsExists && !metricsExists) {
    await vault.adapter.write('.obsidian/vault-metrics.json', '{}');
  }

  const metricsData = await vault.adapter.read('.obsidian/vault-metrics.json');

  let metrics;
  try {
    metrics = JSON.parse(metricsData);
  } catch (e) {
    metrics = {};
  }

  let hasVersion = false;
  let hasHistory = false;

  for (const key of Object.keys(metrics)) {
    if (key === 'version') {
      hasVersion = true;
      continue;
    }

    if (key === 'history') {
      hasHistory = true;

      if (typeof metrics[key] !== 'object') {
        delete metrics[key];
      }

      for (const date of Object.keys(metrics[key])) {
        if (typeof metrics[key][date] !== 'object') {
          delete metrics[key][date];
        }

        if (!moment(date, 'YYYY-MM-DD', true).isValid()) {
          delete metrics[key][date];
        }

        let backup = false;
        for (const metric of Object.keys(metrics[key][date])) {
          if (typeof metrics[key][date][metric] !== 'object') {
            backup = true;
          }
        }

        if (backup) {
          if (!metrics['backup']) {
            metrics['backup'] = {};
          }
          metrics['backup'][date] = metrics[key][date];
        }
      }
    }

    if (!hasVersion) {
      metrics['version'] = 1;
    }

    if (!hasHistory) {
      metrics['history'] = {};
    }
  }
}
