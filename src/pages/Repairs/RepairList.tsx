import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, Plus, Filter, Eye, Edit, Trash2, Calendar, User, Smartphone, PenTool } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import { getRepairs, deleteRepair, Repair } from "../../services/supabaseService";
import { useUser } from "../../context/UserContext";

export default function RepairList() {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tous");
  const [filterPeriod, setFilterPeriod] = useState("Tous");
  const [filterShop, setFilterShop] = useState("Tous");
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRepairs();
  }, [user]); // Reload if user context changes

  const loadRepairs = async () => {
    try {
      setIsLoading(true);
      // Filter by technician ID if role is 3 (Technician)
      const employeeId = user.id_role === 3 ? user.id_employe : undefined;
      // Filter by shop ID if role is 2 (Manager)
      const shopId = user.id_role === 2 ? user.id_boutique : undefined;
      
      const data = await getRepairs(undefined, employeeId, shopId);
      setRepairs(data);
    } catch (error) {
      console.error("Erreur chargement réparations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette réparation ?")) {
      try {
        await deleteRepair(id);
        loadRepairs();
      } catch (error) {
        console.error("Erreur suppression réparation:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "En cours":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "En attente pièce":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      case "Terminée":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "Devis à valider":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Filter Logic
  const filteredRepairs = repairs.filter(repair => {
    const clientName = repair.client_name || "";
    const reference = repair.reference || "";
    const deviceName = repair.device_name || "";

    const matchesSearch = 
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deviceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "Tous" || repair.status === filterStatus;
    const matchesShop = filterShop === "Tous" || repair.shop_name === filterShop;

    // Date filtering logic
    let matchesPeriod = true;
    if (filterPeriod !== "Tous" && repair.date_creation) {
      const repairDate = new Date(repair.date_creation);
      const today = new Date();
      
      // Reset time for accurate date comparison
      repairDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      if (filterPeriod === "Aujourd'hui") {
        matchesPeriod = repairDate.getTime() === today.getTime();
      } else if (filterPeriod === "Ce mois") {
        matchesPeriod = repairDate.getMonth() === today.getMonth() && repairDate.getFullYear() === today.getFullYear();
      }
    }

    return matchesSearch && matchesStatus && matchesShop && matchesPeriod;
  });

  return (
    <>
      <PageMeta
        title="Liste des Réparations | QuickRepair France"
        description="Gestion des réparations QuickRepair France"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Réparations
        </h2>
        {user.id_role !== 3 && (
          <Link
            to="/reparations/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3.5 text-center font-medium text-white shadow-theme-xs hover:bg-brand-600 lg:px-8 xl:px-10 transition"
          >
            <Plus size={20} />
            Nouvelle Réparation
          </Link>
        )}
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="px-4 py-6 md:px-6 xl:px-7.5">
          {/* Filters & Search */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="relative w-full lg:w-1/3">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Rechercher par N°, client ou appareil..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-stroke bg-gray-50 py-3 pl-12 pr-4 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={20} className="text-gray-500 shrink-0" />
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="w-full sm:w-auto rounded border border-stroke bg-transparent py-3 px-4 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                >
                  <option value="Tous">Toutes dates</option>
                  <option value="Aujourd'hui">Aujourd'hui</option>
                  <option value="Ce mois">Ce mois</option>
                </select>
              </div>

              {user.id_role === 1 && (
                <select
                  value={filterShop}
                  onChange={(e) => setFilterShop(e.target.value)}
                  className="w-full sm:w-auto rounded border border-stroke bg-transparent py-3 px-4 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                >
                  <option value="Tous">Toutes boutiques</option>
                  <option value="Paris Centre">Paris Centre</option>
                  <option value="Lyon Part-Dieu">Lyon Part-Dieu</option>
                  <option value="Marseille Vieux-Port">Marseille Vieux-Port</option>
                </select>
              )}

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-auto rounded border border-stroke bg-transparent py-3 px-4 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
              >
                <option value="Tous">Tous statuts</option>
                <option value="En cours">En cours</option>
                <option value="En attente pièce">En attente pièce</option>
                <option value="Terminée">Terminée</option>
                <option value="Devis à valider">Devis à valider</option>
              </select>
            </div>
          </div>

          <div className="max-w-full overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">Chargement des réparations...</div>
            ) : repairs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Aucune réparation trouvée.</div>
            ) : (
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[180px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                      Réparation
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      Appareil / Panne
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      Technicien / Boutique
                    </th>
                    <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                      Statut
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRepairs.map((repair) => (
                    <tr key={repair.id} className="hover:bg-gray-1 dark:hover:bg-meta-4/50">
                      <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                        <div className="flex flex-col gap-1">
                          <Link to={`/reparations/${repair.id}`} className="font-medium text-primary hover:underline">
                            {repair.reference}
                          </Link>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User size={14} />
                            {repair.client_name}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar size={12} />
                            {repair.date_creation ? new Date(repair.date_creation).toLocaleDateString() : "-"}
                          </div>
                        </div>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-black dark:text-white font-medium">
                            <Smartphone size={16} className="text-gray-500" />
                            {repair.device_name}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <PenTool size={14} />
                            {repair.category || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <div className="flex flex-col gap-1">
                          <p className="text-black dark:text-white">{repair.technician_name || "Non assigné"}</p>
                          <p className="text-xs text-gray-500">{repair.shop_name}</p>
                        </div>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(repair.status)}`}>
                            {repair.status}
                          </span>
                        </div>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <div className="flex items-center space-x-3.5">
                          <Link to={`/reparations/${repair.id}`} className="hover:text-primary">
                            <Eye size={18} />
                          </Link>
                          <Link to={`/reparations/edit/${repair.id}`} className="hover:text-primary">
                            <Edit size={18} />
                          </Link>
                          <button 
                            onClick={() => repair.id && handleDelete(repair.id.toString())}
                            className="hover:text-red-500"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}