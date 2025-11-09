export interface DashboardTotals {
  customers: number;
  activeLicenses: number;
  scripts: number;
}

export interface DashboardLatestLicense {
  _id: string;
  token: string;
  scriptName: string;
  userDiscord: string;
  expiresAt?: string;
  ipPort?: string;
  isPermanent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardTopScript {
  scriptName: string;
  licenseCount: number;
}

export interface DashboardTopUser {
  userDiscord: string;
  licenseCount: number;
}

export interface DashboardInfosResponse {
  totals: DashboardTotals;
  latestLicense: DashboardLatestLicense | null;
  topScript: DashboardTopScript | null;
  topUser: DashboardTopUser | null;
}
