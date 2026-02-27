import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { 
  ChevronLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import { getClientById, getRepairsByClientId, Client, Repair } from "../../services/supabaseService";

const getStatusColor = (status: string) => {
  switch (status) {
    case "Terminée":
      return "text-green-500 bg-green-50 border-green-200";
    case "En cours":
      return "text-blue-500 bg-blue-50 border-blue-200";
    case "En attente":
      return "text-yellow-500 bg-yellow-50 border-yellow-200";
    case "Diagnostiquée":
      return "text-purple-500 bg-purple-50 border-purple-200";
    case "Devis à valider":
      return "text-orange-500 bg-orange-50 border-orange-200";
    case "Annulée":
      return "text-red-500 bg-red-50 border-red-200";
    default:
      return "text-gray-500 bg-gray-50 border-gray-200";
  }
};

export default function ClientDetail() {
  const { id_client } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchClient = async () => {
      if (!id_client) return;
      try {
        // Parallel fetch
        const [clientData, repairsData] = await Promise.all([
          getClientById(id_client),
          getRepairsByClientId(id_client)     
        ]);
        
        if (clientData) {
          setClient(clientData);
        }
        if (repairsData) {
          setRepairs(repairsData);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du client:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id_client]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800">Client introuvable</h2>
        <Link to="/clients" className="text-indigo-600 hover:text-indigo-800 mt-4 inline-block">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${client.prenom} ${client.nom} | QuickRepair France`}
        description="Détails client"
      />
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          {client.prenom} {client.nom}
        </h1>
        <div className="space-x-4">
          <Link
            to={`/clients/edit/${client.id_client}`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Modifier
          </Link>
          <Link
            to={`/reparations/new?clientId=${client.id_client}`}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Nouvelle Réparation
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations personnelles</h2>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <Mail className="h-5 w-5 mr-3" />
              <span>{client.email}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Phone className="h-5 w-5 mr-3" />
              <span>{client.telephone || "Non renseigné"}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-3" />
              <span>{client.ville ? `${client.ville} ${client.code_postal || ''}` : "Non renseignée"}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-3" />
              <span>Client depuis le {new Date(client.date_creation || new Date()).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Historique des réparations</h2>
          {repairs && repairs.length > 0 ? (
            <div className="space-y-4">
              {repairs.map((repair) => (
                <div
                  key={repair.id}
                  className="border-l-4 border-indigo-500 pl-4 py-2 hover:bg-gray-50 transition-colors"
                >
                  <Link to={`/reparations/${repair.id}`} className="block">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">{repair.device_name}</p>
                        <p className="text-sm text-gray-500">{repair.problem_description}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium border ${getStatusColor(repair.status)}`}>
                          {repair.status}
                        </span>
                        {repair.priority && (
                          <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-medium border ${
                            repair.priority === "Urgente" ? "text-red-500 bg-red-50 border-red-200" : 
                            repair.priority === "Haute" ? "text-orange-500 bg-orange-50 border-orange-200" :
                            "text-blue-500 bg-blue-50 border-blue-200"
                          }`}>
                            {repair.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2">
                    <span className="font-bold text-black">
                      {repair.cost ? `${repair.cost} €` : "Sur devis"}
                    </span>
                    <Link 
                      to={`/reparations/${repair.id}`}
                      className="flex items-center justify-center rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <ChevronLeft className="rotate-180" size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">Aucune réparation enregistrée.</p>
          )}
        </div>
      </div>
      </div>
    </>
  );
}
