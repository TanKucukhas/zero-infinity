import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';

type TableDataType = {
  type: string;
  app: boolean;
  email: boolean;
  browser: boolean;
};

const tableData: TableDataType[] = [
  {
    app: true,
    email: true,
    browser: true,
    type: 'New for you'
  },
  {
    app: true,
    email: true,
    browser: true,
    type: 'Account activity'
  },
  {
    app: false,
    email: true,
    browser: true,
    type: 'A new browser used to sign in'
  },
  {
    app: false,
    email: true,
    browser: false,
    type: 'A new device is linked'
  }
];

export default function Notifications() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Devices</CardTitle>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          We need permission from your browser to show notifications.
          <Link href="#" className="text-brand-600 hover:underline ml-1">Request Permission</Link>
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-300">Type</th>
                <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-300">Email</th>
                <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-300">Browser</th>
                <th className="px-4 py-3 font-semibold text-zinc-600 dark:text-zinc-300">App</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {tableData.map((data, index) => (
                <tr key={index} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition">
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                    {data.type}
                  </td>
                  <td className="px-4 py-3">
                    <Checkbox defaultChecked={data.email} />
                  </td>
                  <td className="px-4 py-3">
                    <Checkbox defaultChecked={data.browser} />
                  </td>
                  <td className="px-4 py-3">
                    <Checkbox defaultChecked={data.app} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6">
          <h4 className="mb-4 font-medium text-zinc-900 dark:text-zinc-100">
            When should we send you notifications?
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <Select 
                defaultValue="online"
                options={[
                  { value: "online", label: "Only when I'm online" },
                  { value: "anytime", label: "Anytime" }
                ]}
              />
            </div>
          </div>
          <div className="flex gap-4 flex-wrap mt-6">
            <Button type="submit">
              Save Changes
            </Button>
            <Button variant="outline" type="reset">
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}