import React, { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { getStocks, StockItem } from '../../services/supabaseService';
import PageMeta from '../../components/common/PageMeta';
import { Package, AlertTriangle, Search } from 'lucide-react';

const StockList: React.FC = () => {
  const { user } = useUser();
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    try {
      setIsLoading(true);
      const shopId = user.id_role === 2 ? user.id_boutique : undefined;
      const data = await getStocks(shopId);
      setStocks(data || []);
    } catch (err) {
      console.error('Erreur chargement stock:', err);
      if ((err as any)?.code !== '42P01') {
        setError("Impossible de charger le stock.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStocks = stocks.filter(item => 
    (item.piece?.nom_piece || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.piece?.reference || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageMeta
        title="Gestion du Stock | QuickRepair France"
        description="Suivez l'état de votre stock et les alertes de réapprovisionnement."
      />
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Stock
        </h2>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Inventaire des pièces
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une pièce..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Pièce</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Référence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Quantité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Seuil Alerte</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Catégorie</th>
                {user.id_role === 1 && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Boutique</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={user.id_role === 1 ? 7 : 6} className="px-6 py-4 text-center text-gray-500">Chargement...</td>
                </tr>
              ) : filteredStocks.length === 0 ? (
                <tr>
                  <td colSpan={user.id_role === 1 ? 7 : 6} className="px-6 py-4 text-center text-gray-500">Aucune pièce trouvée</td>
                </tr>
              ) : (
                filteredStocks.map((item) => (
                  <tr key={`${item.id_piece}-${item.id_boutique}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          <Package size={16} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{item.piece?.nom_piece || 'Inconnu'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.piece?.reference || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                      {item.quantite_stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.seuil_alerte_local}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.piece?.categorie || '-'}
                    </td>
                    {user.id_role === 1 && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {item.boutique?.nom || 'Inconnu'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.quantite_stock <= item.seuil_alerte_local ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Stock faible
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          En stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default StockList;