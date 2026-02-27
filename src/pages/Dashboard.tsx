import { useEffect, useState } from "react";
import { Link } from "react-router";
import { 
  Euro, 
  Plus, 
  Users,
  Wrench,
  Clock,
  PieChart,
  Wifi,
  WifiOff
} from "lucide-react";
import PageMeta from "../components/common/PageMeta";
import { supabase } from "../supabaseClient";
import { getStats } from "../services/supabaseService";
import RecentOrders from "../components/ecommerce/RecentOrders";
import { useUser } from "../context/UserContext";

export default function Dashboard() {
  const { user } = useUser();
  const [supabaseStatus, setSupabaseStatus] = useState<"checking" | "connected" | "error">("checking");
  const [stats, setStats] = useState({ 
    clients: 0, 
    repairs: 0, 
    activeRepairs: 0, 
    monthlyRevenue: 0, 
    successRate: 0 
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) throw error;
        setSupabaseStatus("connected");
      } catch (err) {
        console.error("Supabase connection error:", err);
        setSupabaseStatus("error");
      }
    };

    const fetchStats = async () => {
      try {
        const data = await getStats();
        setStats(data);
      } catch (error) {
        console.error("Erreur chargement statistiques:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    checkConnection();
    fetchStats();
  }, []);

  return (
    <>
      <PageMeta
        title="Dashboard | QuickRepair France"
        description="Tableau de bord de gestion des réparations QuickRepair France"
      />
      
      {/* Supabase Connection Status Alert */}
      {supabaseStatus !== "checking" && (
        <div className={`mb-6 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-sm ${
          supabaseStatus === "connected" 
            ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400"
            : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400"
        }`}>
          {supabaseStatus === "connected" ? <Wifi size={20} /> : <WifiOff size={20} />}
          <div>
            <h4 className="font-semibold text-sm">
              {supabaseStatus === "connected" ? "Connexion Supabase active" : "Erreur de connexion Supabase"}
            </h4>
            {supabaseStatus === "error" && (
              <p className="text-xs mt-1 opacity-90">Vérifiez vos clés API dans le fichier .env</p>
            )}
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {/* 1. SECTION RESUME (KPIs) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          
          {/* Card 1: Clients */}
          <div className="rounded-xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clients</p>
                <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
                  {loadingStats ? "..." : stats.clients}
                </h4>
                {/* <span className="text-xs font-medium text-green-500 flex items-center gap-1 mt-1">
                  <TrendingUp size={12} /> +12 ce mois
                </span> */}
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400">
                <Users size={22} />
              </div>
            </div>
          </div>

          {/* Card 2: Réparations en cours */}
          <div className="rounded-xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Réparations en cours</p>
                <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
                  {loadingStats ? "..." : stats.activeRepairs}
                </h4>
                <span className="text-xs font-medium text-orange-500 flex items-center gap-1 mt-1">
                  <Clock size={12} /> {stats.activeRepairs} actives
                </span>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400">
                <Wrench size={22} />
              </div>
            </div>
          </div>

          {/* Card 3: CA Mensuel (Placeholder) */}
          <div className="rounded-xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">CA Mensuel</p>
                <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
                  {loadingStats ? "..." : `${stats.monthlyRevenue} €`}
                </h4>
                <span className="text-xs font-medium text-gray-400 mt-1 block">
                  Ce mois-ci
                </span>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400">
                <Euro size={22} />
              </div>
            </div>
          </div>

           {/* Card 4: Taux de réussite (Placeholder) */}
           <div className="rounded-xl border border-stroke bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Taux de réussite</p>
                <h4 className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">
                  {loadingStats ? "..." : `${stats.successRate} %`}
                </h4>
                <span className="text-xs font-medium text-gray-400 mt-1 block">
                  Réparations terminées
                </span>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-50 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400">
                <PieChart size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* 2. ACTIONS RAPIDES */}
        {user && user.id_role !== 3 && (
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/reparations/new" 
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3.5 text-center font-medium text-white shadow-theme-xs hover:bg-brand-600 transition"
            >
              <Plus size={20} />
              Nouvelle Réparation
            </Link>
            <Link 
              to="/clients/new" 
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300 px-5 py-3.5 transition"
            >
              <Users size={20} />
              Nouveau Client
            </Link>
          </div>
        )}

        {/* 3. RECENT REPAIRS */}
        <div className="mt-6">
          <RecentOrders />
        </div>
      </div>
    </>
  );
}
