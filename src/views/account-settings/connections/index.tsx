import Link from 'next/link';
import { Trash2, Link as LinkIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type ConnectedAccountsType = {
  title: string;
  logo: string;
  checked: boolean;
  subtitle: string;
};

type SocialAccountsType = {
  title: string;
  logo: string;
  username?: string;
  isConnected: boolean;
  href?: string;
};

const connectedAccountsArr: ConnectedAccountsType[] = [
  {
    checked: true,
    title: 'Google',
    logo: '/images/logos/google.png',
    subtitle: 'Calendar and Contacts'
  },
  {
    checked: false,
    title: 'Slack',
    logo: '/images/logos/slack.png',
    subtitle: 'Communications'
  },
  {
    checked: true,
    title: 'Github',
    logo: '/images/logos/github.png',
    subtitle: 'Manage your Git repositories'
  },
  {
    checked: true,
    title: 'Mailchimp',
    subtitle: 'Email marketing service',
    logo: '/images/logos/mailchimp.png'
  },
  {
    title: 'Asana',
    checked: false,
    subtitle: 'Task Communication',
    logo: '/images/logos/asana.png'
  }
];

const socialAccountsArr: SocialAccountsType[] = [
  {
    title: 'Facebook',
    isConnected: false,
    logo: '/images/logos/facebook.png'
  },
  {
    title: 'Twitter',
    isConnected: true,
    username: '@Theme_Selection',
    logo: '/images/logos/twitter.png',
    href: 'https://twitter.com/Theme_Selection'
  },
  {
    title: 'Linkedin',
    isConnected: true,
    username: '@ThemeSelection',
    logo: '/images/logos/linkedin.png',
    href: 'https://in.linkedin.com/company/themeselection'
  },
  {
    title: 'Dribbble',
    isConnected: false,
    logo: '/images/logos/dribbble.png'
  },
  {
    title: 'Behance',
    isConnected: false,
    logo: '/images/logos/behance.png'
  }
];

export default function Connections() {
  return (
    <Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <CardHeader>
            <CardTitle>Connected Accounts</CardTitle>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Display content from your connected accounts on your site
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectedAccountsArr.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex flex-grow items-center gap-4">
                  <img height={32} width={32} src={item.logo} alt={item.title} className="rounded" />
                  <div className="flex-grow">
                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                      {item.title}
                    </h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.subtitle}</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-brand-600"></div>
                </label>
              </div>
            ))}
          </CardContent>
        </div>
        
        <div>
          <CardHeader>
            <CardTitle>Social Accounts</CardTitle>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Display content from social accounts on your site
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {socialAccountsArr.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex flex-grow items-center gap-4">
                  <img height={32} width={32} src={item.logo} alt={item.title} className="rounded" />
                  <div className="flex-grow">
                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                      {item.title}
                    </h4>
                    {item.isConnected ? (
                      <Link 
                        href={item.href || '/'} 
                        target="_blank"
                        className="text-brand-600 hover:underline text-sm"
                      >
                        {item.username}
                      </Link>
                    ) : (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Not Connected</p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={item.isConnected ? "text-red-600 hover:text-red-700" : "text-zinc-600"}
                >
                  {item.isConnected ? <Trash2 className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}