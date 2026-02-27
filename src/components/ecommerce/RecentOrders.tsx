import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { getRepairs } from "../../services/supabaseService";
import { Link } from "react-router";
import { useUser } from "../../context/UserContext";

export default function RecentOrders() {
  const { user } = useUser();
  const [repairs, setRepairs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRepairs = async () => {
      try {
        // If user is technician (role 3), filter by their ID
        const employeeId = user.id_role === 3 ? user.id_employe : undefined;
        const data = await getRepairs(5, employeeId);
        setRepairs(data);
      } catch (error) {
        console.error("Erreur chargement réparations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Refresh when user changes (e.g. login)
    if (user.id_employe) {
      fetchRepairs();
    }
  }, [user.id_employe, user.id_role]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Terminée":
        return "success";
      case "En cours":
        return "warning";
      case "Canceled":
      case "Annulée":
        return "error";
      default:
        return "light";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Dernières Réparations
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/reparations"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Voir tout
          </Link>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Appareil
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Problème
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Client
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Statut
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Coût
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <TableRow>
                <TableCell className="py-4 text-center text-gray-500" colSpan={5}>
                  Chargement...
                </TableCell>
              </TableRow>
            ) : repairs.length === 0 ? (
              <TableRow>
                <TableCell className="py-4 text-center text-gray-500" colSpan={5}>
                  Aucune réparation récente.
                </TableCell>
              </TableRow>
            ) : (
              repairs.map((repair) => (
                <TableRow key={repair.id} className="">
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <span className="font-semibold text-gray-800 dark:text-white/90 block">
                      {repair.device_name}
                    </span>
                    <span className="text-xs text-gray-400 block">
                      {repair.reference}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {repair.problem_description.split(' - ')[0]}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {repair.client_name}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <Badge color={getStatusColor(repair.status)}>{repair.status}</Badge>
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {repair.cost ? `${repair.cost} €` : "Sur devis"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
