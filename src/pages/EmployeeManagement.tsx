import React, { useEffect, useState } from 'react';
import { useUser } from '../context/UserContext';
import { getEmployees, updateEmploye, Employe } from '../services/supabaseService';
import PageMeta from '../components/common/PageMeta';
import { User, Shield, Search } from 'lucide-react';

const EmployeeManagement: React.FC = () => {
  const { user } = useUser();
  const [employees, setEmployees] = useState<Employe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      // Admin sees all, Manager sees only their shop
      const shopId = user.id_role === 2 ? user.id_boutique : undefined;
      const data = await getEmployees(shopId);
      setEmployees(data);
    } catch (err) {
      console.error('Erreur chargement employés:', err);
      setError("Impossible de charger la liste des employés.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (id: number, newRole: number) => {
    try {
      await updateEmploye(id, { id_role: newRole });
      setEmployees(prev => prev.map(emp => 
        emp.id_employe === id ? { ...emp, id_role: newRole } : emp
      ));
    } catch (err) {
      console.error('Erreur modification rôle:', err);
      alert("Erreur lors de la mise à jour du rôle.");
    }
  };

  const handleStatusChange = async (id: number, currentStatus: boolean) => {
    try {
      await updateEmploye(id, { actif: !currentStatus });
      setEmployees(prev => prev.map(emp => 
        emp.id_employe === id ? { ...emp, actif: !currentStatus } : emp
      ));
    } catch (err) {
      console.error('Erreur modification statut:', err);
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleBoutiqueChange = async (id: number, newBoutique: number) => {
    try {
        await updateEmploye(id, { id_boutique: newBoutique });
        setEmployees(prev => prev.map(emp => 
            emp.id_employe === id ? { ...emp, id_boutique: newBoutique } : emp
        ));
    } catch (err) {
        console.error('Erreur modification boutique:', err);
        alert("Erreur lors de la mise à jour de la boutique.");
    }
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.nom} ${emp.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Allow Admin (1) and Manager (2)
  if (user.id_role !== 1 && user.id_role !== 2) {
    return (
      <div className="p-6 text-center text-red-500">
        <Shield className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Accès Refusé</h2>
        <p>Vous n'avez pas les droits d'administrateur pour accéder à cette page.</p>
      </div>
    );
  }

  const isReadOnly = user.id_role === 2;

  return (
    <>
      <PageMeta
        title="Gestion des Employés | QuickRepair France"
        description="Gérez les rôles et les accès de votre équipe."
      />
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Gestion des Employés
        </h2>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Liste des membres de l'équipe
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un employé..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Employé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Boutique</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Chargement...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Aucun employé trouvé.</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id_employe}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                          {emp.photo_url ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={emp.photo_url} alt="" />
                          ) : (
                            <User className="w-6 h-6" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {emp.prenom} {emp.nom}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {emp.id_employe}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">{emp.email}</div>
                      <div className="text-sm text-gray-500">{emp.telephone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={emp.id_role}
                        onChange={(e) => handleRoleChange(emp.id_employe!, parseInt(e.target.value))}
                        disabled={isReadOnly}
                        className={`text-sm border-gray-300 rounded-md shadow-sm focus:border-brand-500 focus:ring focus:ring-brand-500 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value={1}>Admin (1)</option>
                        <option value={2}>Manager (2)</option>
                        <option value={3}>Technicien (3)</option>
                        <option value={4}>Vendeur (4)</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                         <input
                            type="number"
                            min="1"
                            value={emp.id_boutique}
                            onChange={(e) => handleBoutiqueChange(emp.id_employe!, parseInt(e.target.value))}
                            disabled={isReadOnly}
                            className={`w-20 text-sm border-gray-300 rounded-md shadow-sm focus:border-brand-500 focus:ring focus:ring-brand-500 focus:ring-opacity-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => !isReadOnly && handleStatusChange(emp.id_employe!, emp.actif)}
                        disabled={isReadOnly}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          emp.actif
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        } ${isReadOnly ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {emp.actif ? 'Actif' : 'Inactif'}
                      </button>
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

export default EmployeeManagement;
