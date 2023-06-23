export const API_VERSION = 'v1.0';
export const RATE_LIMITER_WINDOWMS = 15 * 60 * 1000; // 15 minutes
export const RATE_LIMITER_MAX_REQUEST = 1000;
export const RATE_LIMITER_MESSAGE = 'You have exceeded the 1000 requests in 15 mins limit!';
export const RESET_EXPIRY_DEFAULT = 180;
export const SETTINGS_CACHE_PREFIX = 'wmo_setting!';
export const ROLES = {
	ADMIN: '00000000-0000-0000-0000-000000000001',
	PACKER: 'ff000000-0000-0000-0000-000000000030'
};
export const BWIP_OPTIONS = {
	bcid: 'code128',
	scale: 3,
	height: 10,
	includetext: true,
	textxalign: 'center'
};
export const TEST_STATUS = {
	PASSED: 'passed',
	FAILED: 'failed',
	SKIPPED: 'skipped'
};
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_RUN_NAME = {
	FIRST_RUN_NAME: 'run#1',
	PREFIX: 'run#'
};
export const DEFAULT_MLAUNCH_NAME = {
	FIRST_MLAUNCH_NAME: 'mlaunch#1',
	PREFIX: 'mlaunch#'
};
export const DEFAULT_ALAUNCH_NAME = {
	FIRST_MLAUNCH_NAME: 'alaunch#1',
	PREFIX: 'alaunch#'
};
export const DEFAULT_SPRINT_NAME = 'Sprint1';

export const DEFAULT_SPRINT_DURATION = 13;

export const DEFAULT_DASHBOARD_PAGE_SIZE = 15;

export const PROD_ORIGIN_REGEX = /.*\.(testviz\.io)$/;

export const DEV_ORIGIN_REGEX = /.+/;

export const DEFAULT_ACTIVITY_NAME_PREFIX = 'ac#';
