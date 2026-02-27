import { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  Euro, 
  ShoppingBag, 
  CheckCircle, 
  Users 
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import { getRepairs, getClients, getBoutiques, Boutique } from "../../services/supabaseService";
import { useUser } from "../../context/UserContext";
import { useTheme } from "../../context/ThemeContext";

const COLORS = ['#3C50E0', '#F0950C', '#10B981', '#80CAEE', '#8FD0EF', '#0FADCF'];

export default function Statistics() {
  const { user } = useUser();
  const { theme } = useTheme();
  const [period, setPeriod] = useState("Mensuel");
  const [shopFilter, setShopFilter] = useState("Toutes");
  const [shops, setShops] = useState<Boutique[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Stats State
  const [kpis, setKpis] = useState({
    revenue: 0,
    avgBasket: 0,
    successRate: 0,
    newClients: 0
  });

  const [charts, setCharts] = useState({
    repairsByStatus: [] as any[],
    repairsByDevice: [] as any[],
    monthlyRevenue: [] as any[],
    averageDelayByShop: [] as any[] // Keeping mocked or simple calc
  });

  useEffect(() => {
    const loadShops = async () => {
      try {
        const data = await getBoutiques();
        if(data) setShops(data);
      } catch (err) {
        console.error("Erreur chargement boutiques:", err);
      }
    };
    loadShops();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [shopFilter, period]);

  const calculateStats = async () => {
    try {
      setIsLoading(true);
      // For Manager (role 2), filter by their shop
      const shopId = user.id_role === 2 ? user.id_boutique : undefined;

      const [allRepairs, clients] = await Promise.all([
        getRepairs(undefined, undefined, shopId),
        getClients()
      ]);

      // Apply Shop Filter (Local filter for Admin, already filtered for Manager)
      const repairs = (shopFilter === "Toutes" || user.id_role === 2)
        ? allRepairs 
        : allRepairs.filter(r => r.shop_name === shopFilter);

      // Helper to parse date
      const getDate = (dateStr?: string) => dateStr ? new Date(dateStr) : new Date();
      const now = new Date();

      // Filter by Period (for KPIs context)
      // Hebdo: This Week (Mon-Sun) or Last 7 Days. Let's do Last 7 Days for simplicity.
      // Mensuel: This Month.
      // Annuel: This Year.
      
      let periodRepairs = repairs;
      let revenueChartData: any[] = [];

      if (period === "Hebdo") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        periodRepairs = repairs.filter(r => getDate(r.date_creation) >= oneWeekAgo);

        // Chart: Last 7 Days
        const daysMap = new Map();
        for(let i=6; i>=0; i--) {
            const d = new Date();
            d.setDate(now.getDate() - i);
            daysMap.set(d.toLocaleDateString('fr-FR', { weekday: 'short' }), 0);
        }
        repairs.forEach(r => {
            if(r.cost && r.date_creation) {
                const d = new Date(r.date_creation);
                if(d >= oneWeekAgo) {
                    const key = d.toLocaleDateString('fr-FR', { weekday: 'short' });
                    if(daysMap.has(key)) daysMap.set(key, daysMap.get(key) + r.cost);
                }
            }
        });
        revenueChartData = Array.from(daysMap).map(([name, ca]) => ({ name, ca }));

      } else if (period === "Mensuel") {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        periodRepairs = repairs.filter(r => getDate(r.date_creation) >= startOfMonth);

        // Chart: Last 12 Months
        const monthsMap = new Map();
        for(let i=11; i>=0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            monthsMap.set(d.toLocaleString('fr-FR', { month: 'short' }), 0);
        }
        repairs.forEach(r => {
            if(r.cost && r.date_creation) {
                const d = new Date(r.date_creation);
                // Check if within last 12 months
                const oneYearAgo = new Date();
                oneYearAgo.setMonth(now.getMonth() - 12);
                if (d > oneYearAgo) {
                    const key = d.toLocaleString('fr-FR', { month: 'short' });
                    if(monthsMap.has(key)) monthsMap.set(key, monthsMap.get(key) + r.cost);
                }
            }
        });
        revenueChartData = Array.from(monthsMap).map(([name, ca]) => ({ name, ca }));

      } else { // Annuel
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        periodRepairs = repairs.filter(r => getDate(r.date_creation) >= startOfYear);

        // Chart: Last 5 Years
        const yearsMap = new Map();
        for(let i=4; i>=0; i--) {
            const y = now.getFullYear() - i;
            yearsMap.set(y.toString(), 0);
        }
        repairs.forEach(r => {
            if(r.cost && r.date_creation) {
                const y = new Date(r.date_creation).getFullYear().toString();
                if(yearsMap.has(y)) yearsMap.set(y, yearsMap.get(y) + r.cost);
            }
        });
        revenueChartData = Array.from(yearsMap).map(([name, ca]) => ({ name, ca }));
      }

      // --- KPI Calculations (Based on filtered period data) ---
      
      // 1. Revenue
      const totalRevenue = periodRepairs.reduce((sum, r) => sum + (r.cost || 0), 0);
      
      // 2. Avg Basket (Global average is often more useful, but let's stick to period for consistency)
      const repairsWithCost = periodRepairs.filter(r => r.cost && r.cost > 0).length;
      const avgBasket = repairsWithCost > 0 ? totalRevenue / repairsWithCost : 0;

      // 3. Success Rate (Global is better for reliability, but let's use filtered repairs to show period performance)
      // Success = "Terminée - Livrée" or "Terminée - En attente retrait"
      const completedRepairs = periodRepairs.filter(r => r.status.startsWith("Terminée")).length;
      const successRate = periodRepairs.length > 0 ? Math.round((completedRepairs / periodRepairs.length) * 100) : 0;

      // 4. Clients (Total)
      // We switch to Total Clients to avoid confusion with "0 New Clients"
      const totalClientsCount = clients.length;

      setKpis({
        revenue: totalRevenue,
        avgBasket: Math.round(avgBasket),
        successRate,
        newClients: totalClientsCount // Reusing the state key but storing total
      });

      // --- Charts Data ---

      // 1. Repairs by Status (Global or Period? Usually Global distribution is interesting, but let's stick to Period context)
      const statusCounts = periodRepairs.reduce((acc: any, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {});
      
      const statusData = Object.keys(statusCounts).map(status => ({
        name: status,
        value: statusCounts[status]
      }));

      // 2. Top Devices (Period context)
      const deviceCounts = periodRepairs.reduce((acc: any, r) => {
        const name = r.device_name || "Inconnu";
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

      const deviceData = Object.entries(deviceCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 5);

      // 3. Monthly Revenue -> Already calculated as revenueChartData

      // 4. Average Delay by Shop (Calculated from REAL data)
      // Logic: (date_modification - date_creation) for status starting with 'Terminée'
      const shopDelays: Record<string, { totalDays: number, count: number }> = {};
      
      // We use 'repairs' (filtered by shop only) to get a better statistical sample than just 'periodRepairs'
      // or we can use 'periodRepairs' to see delay performance in this period. 
      // Let's use 'repairs' (all time for the selected shop filter) for more stable delay stats.
      repairs.forEach(r => {
        // Check if status starts with "Terminée" (covers "Terminée - En attente retrait" and "Terminée - Livrée")
        if (r.status.startsWith("Terminée") && r.date_creation && r.date_modification) {
             const start = new Date(r.date_creation).getTime();
             const end = new Date(r.date_modification).getTime();
             const days = (end - start) / (1000 * 3600 * 24);
             
             // Filter out anomalies (e.g. negative or > 365 days)
             if (days >= 0 && days < 365) {
                 const shop = r.shop_name || "Autre";
                 if (!shopDelays[shop]) shopDelays[shop] = { totalDays: 0, count: 0 };
                 shopDelays[shop].totalDays += days;
                 shopDelays[shop].count += 1;
             }
        }
      });

      const delayData = Object.entries(shopDelays).map(([name, data]) => ({
          name: name.replace("QuickRepair", "").trim(),
          days: parseFloat((data.totalDays / data.count).toFixed(1))
      }));

      // If delayData is empty, we show 0 for available shops to avoid empty chart
      if (delayData.length === 0) {
           shops.forEach(shop => {
               // If filtering by specific shop, only show that one. If "Toutes", show all.
               if(shopFilter === "Toutes" || shopFilter === shop.nom) {
                   delayData.push({ name: shop.nom.replace("QuickRepair", "").trim(), days: 0 });
               }
           });
      }

      setCharts({
        repairsByStatus: statusData,
        repairsByDevice: deviceData,
        monthlyRevenue: revenueChartData,
        averageDelayByShop: delayData
      });

    } catch (error) {
      console.error("Erreur calcul statistiques:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Statistiques | QuickRepair France"
        description="Analyses et graphiques QuickRepair France"
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Tableau de bord statistique
        </h2>
        
        <div className="flex gap-3">
              {user.id_role === 1 && (
                <select
                  value={shopFilter}
                  onChange={(e) => setShopFilter(e.target.value)}
                  className="rounded border border-stroke bg-white py-2 px-4 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                >
                  <option value="Toutes">Toutes les boutiques</option>
                  {shops.map((shop) => (
                    <option key={shop.id_boutique} value={shop.nom}>
                      {shop.nom} ({shop.ville})
                    </option>
                  ))}
                </select>
              )}

              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="rounded border border-stroke bg-white py-2 px-4 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
              >
                <option value="Hebdo">Hebdomadaire</option>
                <option value="Mensuel">Mensuel</option>
                <option value="Annuel">Annuel</option>
              </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        
        {/* KPI 1: Chiffre d'Affaires */}
        <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <Euro className="fill-primary dark:fill-white" size={22} />
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                {kpis.revenue.toLocaleString()} €
              </h4>
              <span className="text-sm font-medium text-meta-3">
                <span className="text-body-sm font-normal text-gray-500 dark:text-gray-400">Total ({period})</span>
              </span>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Chiffre d'Affaires</span>
        </div>

        {/* KPI 2: Panier Moyen */}
        <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <ShoppingBag className="fill-primary dark:fill-white" size={22} />
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                {kpis.avgBasket} €
              </h4>
              <span className="text-sm font-medium text-meta-3">
                 <span className="text-body-sm font-normal text-gray-500">Moyenne</span>
              </span>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-500">Panier Moyen</span>
        </div>

        {/* KPI 3: Taux de Succès */}
        <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <CheckCircle className="fill-primary dark:fill-white" size={22} />
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                {kpis.successRate}%
              </h4>
              <span className="text-sm font-medium text-meta-5">
                 <span className="text-body-sm font-normal text-gray-500">Terminées / Total</span>
              </span>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-500">Taux de Succès</span>
        </div>

        {/* KPI 4: Nouveaux Clients */}
        <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
            <Users className="fill-primary dark:fill-white" size={22} />
          </div>

          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-black dark:text-white">
                {kpis.newClients}
              </h4>
              <span className="text-sm font-medium text-meta-3">
                 <span className="text-body-sm font-normal text-gray-500 dark:text-gray-400">Clients Total</span>
              </span>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Nouveaux Clients</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        
        {/* Chart 1: Réparations par Statut (Pie Chart) */}
        <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-5">
          <div className="mb-3 justify-between gap-4 sm:flex">
            <div>
              <h5 className="text-xl font-semibold text-black dark:text-white">
                Répartition par Statut
              </h5>
            </div>
          </div>
          <div className="mb-2 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.repairsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.repairsByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1A222C' : '#fff', 
                    borderColor: theme === 'dark' ? '#333' : '#E2E8F0',
                    color: theme === 'dark' ? '#fff' : '#000'
                  }} 
                  itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  wrapperStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Top Appareils (Bar Chart) */}
        <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-7">
          <div className="mb-3 justify-between gap-4 sm:flex">
            <div>
              <h5 className="text-xl font-semibold text-black dark:text-white">
                Top Appareils Réparés
              </h5>
            </div>
          </div>
          <div className="mb-2 h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={charts.repairsByDevice}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" width={100}/>
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="count" fill="#3C50E0" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Délai Moyen par Boutique (Bar Chart) - MOCKED */}
        <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-6">
           <div className="mb-3 justify-between gap-4 sm:flex">
            <div>
              <h5 className="text-xl font-semibold text-black dark:text-white">
                Délai Moyen (Jours)
              </h5>
            </div>
          </div>
           <div className="mb-2 h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.averageDelayByShop}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" interval={0} tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="days" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Evolution CA (Line Chart) */}
        <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-6">
           <div className="mb-3 justify-between gap-4 sm:flex">
            <div>
              <h5 className="text-xl font-semibold text-black dark:text-white">
                Evolution Chiffre d'Affaires ({period})
              </h5>
            </div>
          </div>
           <div className="mb-2 h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#333' : '#E2E8F0'} />
                    <XAxis dataKey="name" tick={{ fill: theme === 'dark' ? '#fff' : '#64748B' }} />
                    <YAxis tick={{ fill: theme === 'dark' ? '#fff' : '#64748B' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: theme === 'dark' ? '#1A222C' : '#fff', 
                        borderColor: theme === 'dark' ? '#333' : '#E2E8F0',
                        color: theme === 'dark' ? '#fff' : '#000'
                      }} 
                      itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }}
                    />
                    <Line type="monotone" dataKey="ca" stroke="#F0950C" strokeWidth={3} dot={{r: 4}} activeDot={{r: 8}} />
                </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

      </div>
    </>
  );
}
