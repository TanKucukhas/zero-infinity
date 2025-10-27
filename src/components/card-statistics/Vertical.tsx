import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import type { CardStatsVerticalProps } from '@/types/pages/widgetTypes';

export default function CardStatVertical(props: CardStatsVerticalProps) {
  const { title, stats, avatarIcon, avatarColor, trendNumber, trend, subtitle, avatarSkin, avatarSize, moreOptions } = props;

  const getAvatarColor = (color: string) => {
    const colors: Record<string, string> = {
      primary: 'bg-brand-600',
      secondary: 'bg-zinc-600',
      success: 'bg-green-600',
      error: 'bg-red-600',
      warning: 'bg-yellow-600',
      info: 'bg-blue-600',
    };
    return colors[color] || 'bg-brand-600';
  };

  const getAvatarSize = (size: string | number) => {
    const sizes: Record<string | number, string> = {
      small: 'h-8 w-8',
      medium: 'h-10 w-10',
      large: 'h-12 w-12',
      32: 'h-8 w-8',
      40: 'h-10 w-10',
      48: 'h-12 w-12',
    };
    return sizes[size] || 'h-10 w-10';
  };

  return (
    <Card className="h-full">
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className={`${getAvatarColor(avatarColor)} ${getAvatarSize(avatarSize)} rounded-lg flex items-center justify-center text-white shadow-sm`}>
            <i className={avatarIcon} />
          </div>
          <button className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-1">
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats}</span>
            <Badge 
              variant={trend === 'negative' ? 'error' : 'success'}
              className={trend === 'negative' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}
            >
              {`${trend === 'negative' ? '-' : '+'}${trendNumber}`}
            </Badge>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}