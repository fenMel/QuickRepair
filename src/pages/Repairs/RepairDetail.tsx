import { useState, useEffect } from "react";
import { Link, useParams } from "react-router";
import { useUser } from "../../context/UserContext"; // Added import
import { 
  ChevronLeft, 
  User, 
  Smartphone, 
  PenTool, 
  CheckCircle, 
  Clock, 
  FileText,
  Printer,
  Mail,
  Phone,
  Package,
  FileText as FileIcon,
  Plus
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import { 
  getRepairById, 
  Repair, 
  getStocks, 
  getUsedParts, 
  addUsedPart, 
  getQuoteByRepairId, 
  createQuote,
  updateQuote, // Added import
  updateRepair, // Added import
  getEmployees, // Added import
  Employe, // Added import
  StockItem, 
  Quote 
} from "../../services/supabaseService";

export default function RepairDetail() {
  const { id } = useParams();
  const { user } = useUser(); // Added hook
  const [repair, setRepair] = useState<Repair | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Features State
  const [stock, setStock] = useState<StockItem[]>([]);
  const [usedParts, setUsedParts] = useState<any[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  
  // Technician Assignment State
  const [technicians, setTechnicians] = useState<Employe[]>([]);
  const [selectedTech, setSelectedTech] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Form State for adding part
  const [selectedPartId, setSelectedPartId] = useState("");
  const [partQuantity, setPartQuantity] = useState(1);

  useEffect(() => {
    const fetchRepair = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await getRepairById(id);
        
        // Security check for Manager
        if (user.id_role === 2 && data.shop_id && data.shop_id !== user.id_boutique) {
           setError("Accès non autorisé à cette réparation.");
           setRepair(null);
           setIsLoading(false);
           return;
        }

        setRepair(data);

        // Fetch technicians if user is Manager or Admin
        if (user.id_role === 1 || user.id_role === 2) {
          const shopId = data.shop_id || (user.id_role === 2 ? user.id_boutique : undefined);
          if (shopId) {
            const allEmployees = await getEmployees(shopId);
            const techs = allEmployees.filter(e => e.id_role === 3);
            setTechnicians(techs);
            if (data.technician_id) setSelectedTech(String(data.technician_id));
          }
        }

        // Load related data
        const [stockData, partsData, quoteData] = await Promise.all([
          getStocks(data.shop_id),
          getUsedParts(id),
          getQuoteByRepairId(id)
        ]);
        
        setStock(stockData);
        setUsedParts(partsData);
        setQuote(quoteData);

      } catch (err) {
        console.error("Erreur chargement réparation:", err);
        setError("Impossible de charger les détails de la réparation.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepair();
  }, [id]);

  const handleAddPart = async () => {
    if (!id || !selectedPartId) return;
    try {
      await addUsedPart(id, selectedPartId, partQuantity);
      // Refresh parts
      const parts = await getUsedParts(id);
      setUsedParts(parts);
      setSelectedPartId("");
      setPartQuantity(1);
      alert("Pièce ajoutée avec succès !");
    } catch (err) {
      console.error("Erreur ajout pièce:", err);
      alert("Erreur lors de l'ajout de la pièce");
    }
  };

  const handleCreateQuote = async () => {
    if (!id) return;
    try {
      const newQuote = {
        id_reparation: id,
        montant_total: repair?.cost || 0,
        statut: 'Brouillon',
        contenu: { parts: usedParts } // Snapshot of current parts
      };
      const created = await createQuote(newQuote);
      setQuote(created);
      alert("Devis créé !");
    } catch (err) {
      console.error("Erreur création devis:", err);
    }
  };

  const handleAssignTechnician = async () => {
    if (!id || !selectedTech) return;
    try {
      setIsAssigning(true);
      await updateRepair(id, { technician_id: parseInt(selectedTech) });
      // Refresh repair
      const updatedRepair = await getRepairById(id);
      setRepair(updatedRepair);
      alert("Technicien assigné avec succès !");
    } catch (err) {
      console.error("Erreur assignation technicien:", err);
      alert("Erreur lors de l'assignation");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleValidateQuote = async () => {
    if (!quote || !quote.id_devis) return;
    try {
      await updateQuote(quote.id_devis, { statut: 'Validé' });
      // Refresh quote
      const updatedQuote = await getQuoteByRepairId(id!);
      setQuote(updatedQuote);
      alert("Devis validé avec succès !");
    } catch (err) {
      console.error("Erreur validation devis:", err);
      alert("Erreur lors de la validation");
    }
  };

  // Helper for timeline icons
  const getTimelineIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case "Terminée": 
      case "Restituée":
        return <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 dark:bg-green-900/30 dark:text-green-400"><CheckCircle size={16} /></div>;
      case "En cours": 
        return <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"><Clock size={16} /></div>;
      case "Diagnostiquée":
        return <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"><FileText size={16} /></div>;
      case "Créée":
      default: 
        return <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 dark:bg-gray-700 dark:text-gray-400"><CheckCircle size={16} /></div>;
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
        case "En cours": return "text-blue-500 bg-blue-50 border-blue-200";
        case "Terminée": return "text-green-500 bg-green-50 border-green-200";
        case "En attente": return "text-orange-500 bg-orange-50 border-orange-200";
        case "Devis à valider": return "text-purple-500 bg-purple-50 border-purple-200";
        default: return "text-gray-500 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !repair) {
    return (
      <div className="mx-auto max-w-full p-4">
        <div className="rounded-sm border border-red-200 bg-red-50 p-4 text-red-700">
          <p>{error || "Réparation introuvable."}</p>
          <Link to="/reparations" className="mt-4 inline-block text-sm font-medium underline hover:no-underline">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Dossier ${repair.reference} | QuickRepair France`}
        description="Détail d'une réparation"
      />

      <div className="mx-auto max-w-full">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/reparations"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-1 hover:bg-gray-100 dark:bg-boxdark dark:text-white dark:hover:bg-meta-4"
            >
              <ChevronLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-title-md2 font-bold text-black dark:text-white">
                    {repair.reference}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(repair.status)}`}>
                    {repair.status}
                </span>
                {repair.priority && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    repair.priority === "Urgente" ? "text-red-500 bg-red-50 border-red-200" : 
                    repair.priority === "Haute" ? "text-orange-500 bg-orange-50 border-orange-200" :
                    "text-blue-500 bg-blue-50 border-blue-200"
                  }`}>
                    {repair.priority}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">Créé le {formatDate(repair.date_creation)}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="hidden sm:inline-flex items-center justify-center gap-2 rounded-lg border border-stroke bg-white px-4 py-2 text-center font-medium text-black hover:bg-gray-50 dark:border-strokedark dark:bg-meta-4 dark:text-white dark:hover:bg-opacity-90 transition">
              <Printer size={18} />
              Imprimer
            </button>
            <Link
              to={`/reparations/edit/${id}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 transition"
            >
              <PenTool size={18} />
              Modifier
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left Column: Repair Details */}
          <div className="flex flex-col gap-6 xl:col-span-2">
            {/* Device Info */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-semibold text-black dark:text-white">
                  Informations sur l'appareil
                </h3>
              </div>
              <div className="p-6.5">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-primary dark:bg-meta-4">
                      <Smartphone size={28} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-black dark:text-white">
                        {repair.device_name}
                      </h4>
                      <p className="text-sm text-gray-500">Panne: {repair.category || "Autre"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm text-gray-500">Montant estimé</span>
                    <span className="text-xl font-bold text-success">
                      {repair.cost ? `${repair.cost} €` : "Sur devis"}
                    </span>
                  </div>
                </div>

                <div className="mb-5.5">
                  <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Description du problème
                  </label>
                  <div className="rounded border border-stroke bg-gray-50 py-3 px-4.5 text-black dark:border-strokedark dark:bg-meta-4 dark:text-white">
                    {repair.problem_description}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                      Technicien assigné
                    </label>
                    {(user.id_role === 1 || user.id_role === 2) && technicians.length > 0 ? (
                       <div className="flex gap-2">
                         <select 
                           value={selectedTech}
                           onChange={(e) => setSelectedTech(e.target.value)}
                           className="w-full rounded border border-stroke bg-transparent py-3 px-4 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                         >
                           <option value="">Sélectionner un technicien</option>
                           {technicians.map(tech => (
                             <option key={tech.id_employe} value={tech.id_employe}>
                               {tech.prenom} {tech.nom}
                             </option>
                           ))}
                         </select>
                         <button 
                           onClick={handleAssignTechnician}
                           disabled={isAssigning || !selectedTech}
                           className="flex items-center justify-center rounded bg-primary py-2 px-4 font-medium text-white hover:bg-opacity-90 disabled:bg-opacity-50"
                         >
                           {isAssigning ? '...' : <CheckCircle size={18} />}
                         </button>
                       </div>
                    ) : (
                    <div className="flex items-center gap-3 rounded border border-stroke bg-white py-3 px-4.5 dark:border-strokedark dark:bg-boxdark">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {repair.technician_name ? repair.technician_name.charAt(0) : "?"}
                      </div>
                      <span className="text-black dark:text-white">{repair.technician_name || "Non assigné"}</span>
                    </div>
                    )}
                  </div>
                  <div>
                    <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                      Boutique
                    </label>
                    <div className="flex items-center gap-3 rounded border border-stroke bg-white py-3 px-4.5 dark:border-strokedark dark:bg-boxdark">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        B
                      </div>
                      <span className="text-black dark:text-white">{repair.shop_name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Parts & Stock Section */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex justify-between items-center">
                <h3 className="font-semibold text-black dark:text-white">
                  Pièces utilisées & Stock
                </h3>
                <span className="text-sm text-gray-500">{usedParts.length} pièce(s)</span>
              </div>
              <div className="p-6.5">
                {/* List Used Parts */}
                {usedParts.length > 0 ? (
                  <div className="flex flex-col gap-3 mb-6">
                    {usedParts.map((part: any) => (
                      <div key={part.id} className="flex items-center justify-between p-3 bg-gray-50 rounded dark:bg-meta-4">
                        <div className="flex items-center gap-3">
                          <Package size={18} className="text-primary" />
                          <div>
                            <p className="font-medium text-black dark:text-white">{part.piece?.nom_piece || "Pièce inconnue"}</p>
                            <p className="text-xs text-gray-500">Ref: {part.piece?.reference}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold">x{part.quantite}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mb-6 italic">Aucune pièce utilisée pour le moment.</p>
                )}

                {/* Add Part Form */}
                <div className="border-t border-stroke pt-4 dark:border-strokedark">
                  <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Ajouter une pièce du stock
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                      value={selectedPartId}
                      onChange={(e) => setSelectedPartId(e.target.value)}
                    >
                      <option value="">Sélectionner une pièce...</option>
                      {stock.map(item => (
                        <option key={item.id_piece} value={item.id_piece}>
                          {item.piece?.nom_piece} (Stock: {item.quantite_stock})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      className="w-20 rounded border border-stroke bg-transparent py-2 px-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                      value={partQuantity}
                      onChange={(e) => setPartQuantity(parseInt(e.target.value))}
                    />
                    <button
                      onClick={handleAddPart}
                      disabled={!selectedPartId}
                      className="inline-flex items-center justify-center gap-2 rounded bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                    >
                      <Plus size={16} /> Ajouter
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote (Devis) Section */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-semibold text-black dark:text-white">
                  Gestion Devis
                </h3>
              </div>
              <div className="p-6.5">
                {quote ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded dark:bg-meta-4">
                      <div>
                        <p className="text-sm text-gray-500">Statut du devis</p>
                        <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-bold ${
                          quote.statut === 'Accepté' ? 'bg-green-100 text-green-700' :
                          quote.statut === 'Refusé' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {quote.statut}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Montant Total</p>
                        <p className="text-lg font-bold text-black dark:text-white">{quote.montant_total} €</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 rounded border border-stroke p-2 text-sm hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4">
                        Voir PDF
                      </button>
                      <button className="flex-1 rounded border border-stroke p-2 text-sm hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4">
                        Envoyer par email
                      </button>
                      {/* Validate Button for Manager/Admin if > 200 and status is not validated */}
                      {(user.id_role === 1 || user.id_role === 2) && quote.montant_total > 200 && quote.statut !== 'Validé' && (
                         <button 
                           onClick={handleValidateQuote}
                           className="flex-1 rounded bg-green-500 p-2 text-sm text-white hover:bg-green-600"
                         >
                           Valider
                         </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-4">Aucun devis créé pour cette réparation.</p>
                    <button
                      onClick={handleCreateQuote}
                      className="inline-flex items-center justify-center gap-2 rounded bg-primary px-6 py-2 text-center font-medium text-white hover:bg-opacity-90"
                    >
                      <FileIcon size={18} /> Créer un devis
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline (Mocked for now as we don't have history table yet) */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-semibold text-black dark:text-white">
                  Historique d'intervention
                </h3>
              </div>
              <div className="p-6.5">
                <div className="flex flex-col gap-6">
                  {/* Just showing creation event for now */}
                  <div className="relative flex gap-6 pb-6 last:pb-0">
                    <div className="flex flex-col items-center">
                      {getTimelineIcon("Créée")}
                      <div className="h-full w-0.5 bg-stroke dark:bg-strokedark mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                        <h5 className="font-bold text-black dark:text-white">Réparation créée</h5>
                        <span className="text-xs text-gray-500">{formatDate(repair.date_creation)}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Dossier ouvert dans {repair.shop_name}
                      </p>
                      <span className="mt-1 text-xs text-gray-400">Par Système</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Client Info */}
          <div className="flex flex-col gap-6 xl:col-span-1">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark flex justify-between items-center">
                <h3 className="font-semibold text-black dark:text-white">
                  Client
                </h3>
                <Link to={`/clients/${repair.client_id}`} className="text-sm text-primary hover:underline">
                  Voir profil
                </Link>
              </div>
              <div className="p-6.5">
                {repair.client ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-primary dark:bg-meta-4">
                        <User size={24} />
                      </div>
                      <div>
                        <h4 className="font-bold text-black dark:text-white">
                          {repair.client.prenom} {repair.client.nom}
                        </h4>
                        <p className="text-sm text-gray-500">Client</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-gray-400" />
                      <span className="text-sm text-black dark:text-white">{repair.client.email}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-gray-400" />
                      <span className="text-sm text-black dark:text-white">{repair.client.telephone}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">Client inconnu</div>
                )}
                
                <div className="mt-6 pt-6 border-t border-stroke dark:border-strokedark">
                  <button className="flex w-full items-center justify-center gap-2 rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
                    <Mail size={18} />
                    Envoyer un message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
