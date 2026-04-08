export interface SignalGroup {
  name: string;
  winRate: number;
  monthlySignals: string;
  avgRR: string;
  trackRecord: string;
  members: string;
  verified: boolean;
}

export const signalGroups: SignalGroup[] = [
  {
    name: "Gold Pulse Signals",
    winRate: 81,
    monthlySignals: "35",
    avgRR: "1:2.4",
    trackRecord: "14 months",
    members: "4,200",
    verified: true,
  },
  {
    name: "Asia FX Scalpers",
    winRate: 84,
    monthlySignals: "48",
    avgRR: "1:1.8",
    trackRecord: "22 months",
    members: "12,400",
    verified: true,
  },
  {
    name: "Prop Killer Trades",
    winRate: 78,
    monthlySignals: "60+",
    avgRR: "1:3.1",
    trackRecord: "9 months",
    members: "8,900",
    verified: true,
  },
];
