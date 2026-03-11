import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { getAdminDashboardService } from '@/services/adminAuthService';

interface DashboardCard {
  title: string;
  count: string;
  icon: React.ReactNode;
  description: string;
  trend?: string;
}

const DashboardDetails = () => {
  const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>([]);
  const [donutChartData, setDonutChartData] = useState<{
    series: number[];
    options: ApexOptions;
  }>({
    series: [],
    options: {
      labels: [],
      chart: { type: 'donut', background: 'transparent', toolbar: { show: false } },
      legend: {
        position: 'bottom',
        fontSize: '13px',
        fontFamily: 'inherit',
        labels: { colors: '#6b7280' },
      },
      colors: ['#0f0f0f', '#e5e7eb'],
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                fontSize: '12px',
                color: '#9ca3af',
                fontFamily: 'inherit',
                formatter: (w) =>
                  w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toString(),
              },
              value: {
                fontSize: '26px',
                fontWeight: 700,
                fontFamily: 'inherit',
                color: '#111827',
              },
            },
          },
        },
      },
      dataLabels: { enabled: false },
      stroke: { width: 0 },
      tooltip: { style: { fontFamily: 'inherit' } },
    },
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const admindata = await getAdminDashboardService();
const stats = admindata.data
        const cardData: DashboardCard[] = [
          {
            title: 'Total Vendors',
            count: stats.totalVendors.count.toString(),
            icon: <StorefrontIcon sx={{ fontSize: 22 }} />,
            description: 'Active vendors',
          },
          {
            title: 'Total Users',
            count: stats.totalUsers.count.toString(),
            icon: <PeopleIcon sx={{ fontSize: 22 }} />,
            description: 'Registered users',
          },
        ];

        const donutSeries = [stats.totalVendors.count, stats.totalUsers.count];
        const donutLabels = ['Vendors', 'Users'];

        setDashboardCards(cardData);
        setDonutChartData((prev) => ({
          ...prev,
          series: donutSeries,
          options: { ...prev.options, labels: donutLabels },
        }));
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-gray-400 mt-0.5">Welcome back, Admin</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {dashboardCards.map((card, i) => (
          <div
            key={i}
            className={`rounded-2xl p-6 border flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow duration-200 ${
              i === 0
                ? 'bg-gray-900 border-gray-800 text-white'
                : 'bg-white border-gray-100 text-gray-900'
            }`}
          >
            {/* Icon box */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              i === 0 ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {card.icon}
            </div>

            {/* Info */}
            <div>
              <p className={`text-xs font-semibold uppercase tracking-widest ${
                i === 0 ? 'text-white/40' : 'text-gray-400'
              }`}>
                {card.title}
              </p>
              <p className={`text-4xl font-bold mt-1 leading-none ${
                i === 0 ? 'text-white' : 'text-gray-900'
              }`}>
                {card.count}
              </p>
              <p className={`text-xs mt-2 ${i === 0 ? 'text-white/30' : 'text-gray-400'}`}>
                {card.description}
              </p>
              {card.trend && (
                <p className="text-xs text-emerald-400 mt-1 font-medium">{card.trend}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Donut Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="mb-2">
          <h2 className="text-sm font-semibold text-gray-900">Distribution Overview</h2>
          <p className="text-xs text-gray-400 mt-0.5">Vendors vs Users breakdown</p>
        </div>
        <ReactApexChart
          options={donutChartData.options}
          series={donutChartData.series}
          type="donut"
          height={320}
        />
      </div>

    </div>
  );
};

export default DashboardDetails;