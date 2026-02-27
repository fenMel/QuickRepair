import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, Plus, Phone, Mail, Eye, Edit, Trash2 } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import { ConfirmModal } from "../../components/ui/modal/ConfirmModal";
import { useToast } from "../../context/ToastContext";
import { getClients, deleteClient, Client } from "../../services/supabaseService";

import { useUser } from "../../context/UserContext";

export default function ClientList() {
  const { user } = useUser();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (id: number) => {
    setClientToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setClientToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (clientToDelete) {
      try {
        await deleteClient(clientToDelete);
        showToast("Client supprimé avec succès", "success");
        loadClients(); // Recharger la liste
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        showToast("Erreur lors de la suppression du client", "error");
      }
    }
  };

  // Filter clients based on search term (name, email, or phone)
  const filteredClients = clients.filter(client =>
    (client.prenom + " " + client.nom).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.telephone || "").includes(searchTerm)
  );

  return (
    <>
      <PageMeta
        title="Liste des Clients | QuickRepair France"
        description="Gestion des clients QuickRepair France"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Clients
        </h2>
        {user.id_role !== 3 && (
          <Link
            to="/clients/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3.5 text-center font-medium text-white shadow-theme-xs hover:bg-brand-600 lg:px-8 xl:px-10 transition"
          >
            <Plus size={20} />
            Nouveau Client
          </Link>
        )}
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="px-4 py-6 md:px-6 xl:px-7.5">
          {/* Search Bar */}
          <div className="relative mb-4 max-w-md">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-stroke bg-gray-50 py-3 pl-12 pr-4 text-black focus:border-primary focus:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
            />
          </div>

          <div className="max-w-full overflow-x-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Chargement des clients...</div>
            ) : (
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                      Nom complet
                    </th>
                    <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                      Contact
                    </th>
                    <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                      Ville
                    </th>
                    <th className="px-4 py-4 font-medium text-black dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id_client}>
                      <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                        <h5 className="font-medium text-black dark:text-white">
                          {client.prenom} {client.nom}
                        </h5>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white flex items-center gap-2 mb-1">
                          <Mail size={16} className="text-gray-500" />
                          <span className="text-sm">{client.email || "-"}</span>
                        </p>
                        <p className="text-black dark:text-white flex items-center gap-2">
                          <Phone size={16} className="text-gray-500" />
                          <span className="text-sm">{client.telephone || "-"}</span>
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {client.ville || "-"}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                        <div className="flex items-center space-x-3.5">
                          <Link to={`/clients/${client.id_client}`} className="hover:text-primary">
                            <Eye size={18} />
                          </Link>
                          <Link to={`/clients/edit/${client.id_client}`} className="hover:text-primary">
                            <Edit size={18} />
                          </Link>
                          <button onClick={() => client.id_client && openDeleteModal(client.id_client)} className="hover:text-red-500">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredClients.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-gray-500">
                        Aucun client trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Supprimer le client"
        message="Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </>
  );
}
