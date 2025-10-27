// Components Imports
import Award from '@views/dashboard/Award'
import Transactions from '@views/dashboard/Transactions'
import WeeklyOverview from '@views/dashboard/WeeklyOverview'
import TotalEarning from '@views/dashboard/TotalEarning'
import LineChart from '@views/dashboard/LineChart'
import DistributedColumnChart from '@views/dashboard/DistributedColumnChart'
import DepositWithdraw from '@views/dashboard/DepositWithdraw'
import SalesByCountries from '@views/dashboard/SalesByCountries'
import Table from '@views/dashboard/Table'

const DashboardAnalytics = () => {
  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 md:col-span-4">
        <Award />
      </div>
      <div className="col-span-12 md:col-span-8 lg:col-span-8">
        <Transactions />
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4">
        <WeeklyOverview />
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4">
        <TotalEarning />
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 sm:col-span-6">
            <LineChart />
          </div>
          <div className="col-span-12 sm:col-span-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Total Profit</h3>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">$25.6k</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Weekly Profit</p>
              <div className="mt-2 flex items-center gap-1">
                <span className="text-sm text-green-600 dark:text-green-400">+42%</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">from last week</span>
              </div>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">New Project</h3>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">862</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Yearly Project</p>
              <div className="mt-2 flex items-center gap-1">
                <span className="text-sm text-red-600 dark:text-red-400">-18%</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">from last year</span>
              </div>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6">
            <DistributedColumnChart />
          </div>
        </div>
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-4">
        <SalesByCountries />
      </div>
      <div className="col-span-12 lg:col-span-8">
        <DepositWithdraw />
      </div>
      <div className="col-span-12">
        <Table />
      </div>
    </div>
  )
}

export default DashboardAnalytics