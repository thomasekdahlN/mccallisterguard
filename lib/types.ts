'use strict';

export type Mode = 'disarmed' | 'armed_away' | 'armed_stay';

export type AlarmType = 'perimeter' | 'intrusion' | 'entry_delay_timeout' | 'panic';

export type EventLevel = 'info' | 'warning' | 'alarm' | 'critical';

export interface EventEntry {
  ts: number;
  level: EventLevel;
  message: string;
  zoneId?: string;
  zoneName?: string;
  deviceId?: string;
}

export type ZoneMatrix = Record<string, string>;

export type KevinZones = Record<string, boolean>;

export type ZoneSeconds = Record<string, number>;

export interface GuardSettings {
  bedtime: string;
  sunset_offset: number;
  random_min: number;
  random_max: number;
  deterrence_delay: number;
  exit_delay: number;
  entry_delay: number;
  escalation_minutes: number;
  zone_matrix: ZoneMatrix;
  kevin_zones: KevinZones;
  perimeter_sensors: string[];
  entry_delay_sensors: string[];
  blink_on: ZoneSeconds;
  blink_off: ZoneSeconds;
  alarm_blink_on: number;
  alarm_blink_off: number;
  /** Per-camera: how many snapshots to take when motion is detected while alarm is active. Default: 10. */
  camera_alarm_count: Record<string, number>;
  /** Per-camera: how many snapshots to take when motion is detected while no alarm. Default: 1. 0 = disabled. */
  camera_motion_count: Record<string, number>;
  /** Global master switch: whether to take motion snapshots when no alarm is active. Default: true. */
  camera_motion_enabled: boolean;
}

export const DEFAULT_BLINK_SECONDS = 15;
export const DEFAULT_ALARM_BLINK_ON = 1;
export const DEFAULT_ALARM_BLINK_OFF = 1;
/** Default number of snapshots per camera when alarm is active and motion is detected. */
export const CAMERA_ALARM_DEFAULT_COUNT = 10;
/** Default number of snapshots per camera when motion is detected without an active alarm. */
export const CAMERA_MOTION_DEFAULT_COUNT = 1;
/** Interval in ms between snapshots in a burst. */
export const SNAPSHOT_BURST_INTERVAL_MS = 1_000;

export const DEFAULT_SETTINGS: GuardSettings = {
  bedtime: '23:30',
  sunset_offset: -30,
  random_min: 10,
  random_max: 45,
  deterrence_delay: 15,
  exit_delay: 60,
  entry_delay: 30,
  escalation_minutes: 5,
  zone_matrix: {},
  kevin_zones: {},
  perimeter_sensors: [],
  entry_delay_sensors: [],
  blink_on: {},
  blink_off: {},
  alarm_blink_on: DEFAULT_ALARM_BLINK_ON,
  alarm_blink_off: DEFAULT_ALARM_BLINK_OFF,
  camera_alarm_count: {},
  camera_motion_count: {},
  camera_motion_enabled: true,
};

export const SETTINGS_KEYS = {
  MODE: 'mode',
  MODE_CHANGED_AT: 'mode_changed_at',
  EVENT_LOG: 'event_log',
  SETTINGS: 'guard_settings',
} as const;

export const EVENT_LOG_MAX = 150;
export const CMD_BUFFER_TTL_MS = 2_000;
export const FALSE_ALARM_WINDOW_MS = 90_000;
export const MAX_PUSH_PER_EVENT = 3;
