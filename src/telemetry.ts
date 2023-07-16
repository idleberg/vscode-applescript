import { env } from 'vscode';
import { getConfig } from 'vscode-get-config';
import TelemetryReporter, { type TelemetryEventProperties, type TelemetryEventMeasurements } from '@vscode/extension-telemetry';

function stringifyProperties(properties: Record<string, unknown>): TelemetryEventProperties {
  const newProperties = {};
  Object.entries(properties).map(([key, value]) => newProperties[key] = typeof value !== 'undefined' ? String(value) : undefined);

  return newProperties;
}

export async function sendTelemetryEvent(name: string, properties: Record<string, unknown> = {}, measurements: TelemetryEventMeasurements = {}) {
  const { disableTelemetry } = await getConfig('applescript');

  if (env.appName === 'VSCodium' || disableTelemetry) {
    return;
  }

  reporter.sendTelemetryEvent(name, stringifyProperties(properties), measurements);
}

export const reporter = new TelemetryReporter('ddd120bc-1e9b-474e-82e6-d49dff4227ff');
