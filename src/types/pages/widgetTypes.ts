export interface CardStatsVerticalProps {
  title: string;
  stats: string | number;
  avatarIcon: string;
  avatarColor?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  trendNumber: string | number;
  trend: 'positive' | 'negative';
  subtitle: string;
  avatarSkin?: 'filled' | 'light' | 'light-static';
  avatarSize?: number;
  moreOptions?: {
    options: string[];
    iconButtonProps?: any;
  };
}
