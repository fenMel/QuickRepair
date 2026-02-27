import React, { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { getSupplierOrders, SupplierOrder, getFournisseurs, createSupplierOrder, Fournisseur } from '../../services/supabaseService';
import PageMeta from '../../components/common/PageMeta';
import { Truck, Search, Calendar, CheckCircle, Clock, AlertCircle, Plus, X } from 'lucide-react';
import Label from '../../components/form/Label';
import { Modal } from '../../components/ui/modal';

const SupplierOrders: React.FC = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [selectedFournisseur, setSelectedFournisseur] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadOrders();
    loadFournisseurs();
  }, []);

  const loadFournisseurs = async () => {
    try {
      const data = await getFournisseurs();
      setFournisseurs(data || []);
    } catch (err) {
      console.error('Erreur chargement fournisseurs:', err);
    }
  };

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const shopId = user.id_role === 2 ? user.id_boutique : undefined;
      const data = await getSupplierOrders(shopId);
      setOrders(data || []);
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
      if ((err as any)?.code !== '42P01') {
        setError("Impossible de charger les commandes fournisseurs.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFournisseur) return;

    setIsSubmitting(true);
    try {
      const newOrder: any = {
        id_fournisseur: parseInt(selectedFournisseur),
        id_boutique: user.id_boutique || 1, // Default to 1 if not set
        date_commande: new Date().toISOString(),
        statut: 'En cours'
      };

      await createSupplierOrder(newOrder);
      await loadOrders();
      setIsModalOpen(false);
      setSelectedFournisseur('');
    } catch (err) {
      console.error('Erreur création commande:', err);
      setError("Erreur lors de la création de la commande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'reçu':
      case 'livré':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Reçu
          </span>
        );
      case 'en cours':
      case 'expédié':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <Truck className="w-3 h-3 mr-1" />
            En cours
          </span>
        );
      case 'annulé':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <AlertCircle className="w-3 h-3 mr-1" />
            Annulé
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            <Clock className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
    }
  };

  const filteredOrders = orders.filter(order => 
    (order.fournisseur?.nom || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageMeta
        title="Commandes Fournisseurs | QuickRepair France"
        description="Gérez vos commandes d'approvisionnement."
      />
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Commandes Fournisseurs
        </h2>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Historique des commandes
          </h3>
          <div className="flex gap-4">
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un fournisseur..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Placeholder for "New Order" button - only for Manager/Admin */}
            {(user.id_role === 1 || user.id_role === 2) && (
                 <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-medium"
                 >
                    <Plus size={16} />
                    Nouvelle Commande
                 </button>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Fournisseur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Date Réception</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Statut</th>
                 {user.id_role === 1 && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Boutique</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Chargement...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Aucune commande trouvée.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id_commande}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {new Date(order.date_commande).toLocaleDateString()}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.fournisseur?.nom || 'Inconnu'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                         <div className="flex items-center">
                            {order.date_reception ? (
                              <>
                                <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                {new Date(order.date_reception).toLocaleDateString()}
                              </>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.statut)}
                    </td>
                     {user.id_role === 1 && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.boutique?.nom || 'N/A'}
                        </td>
                      )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nouvelle Commande */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="max-w-[500px] p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Nouvelle Commande Fournisseur
          </h3>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleCreateOrder} className="space-y-6">
          <div>
            <Label>Fournisseur</Label>
            <select
              value={selectedFournisseur}
              onChange={(e) => setSelectedFournisseur(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
            >
              <option value="">Sélectionner un fournisseur</option>
              {fournisseurs.map((f) => (
                <option key={f.id_fournisseur} value={f.id_fournisseur}>
                  {f.nom} {f.specialite ? `(${f.specialite})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedFournisseur}
              className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Création...' : 'Créer la commande'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default SupplierOrders;