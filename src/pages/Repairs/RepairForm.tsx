import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router";
import { ChevronLeft, Save } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import { useToast } from "../../context/ToastContext";
import { 
  getClients, 
  createRepair, 
  updateRepair, 
  getRepairById,
  createNotification,
  getRepairTypes,
  getBoutiques,
  getEmployees,
  Client,
  Boutique,
  Employe
} from "../../services/supabaseService";

export default function RepairForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const clientIdParam = searchParams.get("clientId");
  const isEditing = !!id;
  
  const [clients, setClients] = useState<Client[]>([]);
  const [shops, setShops] = useState<Boutique[]>([]);
  const [technicians, setTechnicians] = useState<Employe[]>([]);
  const [repairTypes, setRepairTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialStatus, setInitialStatus] = useState("En cours");

  const [formData, setFormData] = useState({
    clientId: "",
    brand: "",
    model: "",
    serialNumber: "",
    issue: "",
    technician: "",
    shop: "",
    priority: "Normale",
    description: "",
    estimatedCost: "",
    status: "En cours"
  });

  useEffect(() => {
    loadClients();
    loadRepairTypes();
    loadShops();
    loadTechnicians();
    if (isEditing && id) {
      loadRepair(id);
    } else if (clientIdParam) {
      setFormData(prev => ({ ...prev, clientId: clientIdParam }));
    }
  }, [isEditing, id, clientIdParam]);

  const loadShops = async () => {
    try {
      const data = await getBoutiques();
      setShops(data);
    } catch (error) {
      console.error("Erreur chargement boutiques:", error);
    }
  };

  const loadTechnicians = async () => {
    try {
      const data = await getEmployees();
      // Filter active employees who are technicians (role 3) or managers (role 2) or admins (role 1)
      // Usually technicians are role 3, but let's allow all for now to be safe or filter if needed
      // User asked for "all technicians", assuming role 3 + maybe 2
      const techs = data.filter(e => e.actif && (e.id_role === 2 || e.id_role === 3));
      setTechnicians(techs);
    } catch (error) {
      console.error("Erreur chargement techniciens:", error);
    }
  };

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error("Erreur chargement clients:", error);
    }
  };

  const loadRepairTypes = async () => {
    try {
      const data = await getRepairTypes();
      // Remove duplicates based on libelle for cleaner dropdown
      // Or keep them if we want to show category (e.g. Smartphone vs PC)
      // For now, let's just use unique libelles to avoid confusion in the simple form
      const uniqueTypes = Array.from(new Set(data.map((t: any) => t.libelle)))
        .map(libelle => data.find((t: any) => t.libelle === libelle));
      setRepairTypes(uniqueTypes);
    } catch (error) {
      console.error("Erreur chargement types réparations:", error);
    }
  };

  const loadRepair = async (id: string) => {
    try {
      setIsLoading(true);
      const data = await getRepairById(id);
      if (data) {
        setInitialStatus(data.status || "En cours");
        setFormData({
          clientId: data.client_id?.toString() || "",
          brand: data.brand || "",
          model: data.model || data.device_name || "",
          serialNumber: data.serial_number || "",
          issue: data.category || "Autre",
          technician: data.technician_name || "",
          shop: data.shop_name || "",
          priority: data.priority || "Normale", 
          description: data.problem_description || "",
          estimatedCost: data.cost ? data.cost.toString() : "",
          status: data.status || "En cours"
        });
      }
    } catch (error) {
      console.error("Erreur chargement réparation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Generate reference for new repairs
      const reference = isEditing && id 
        ? undefined // Don't update reference
        : `QR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

      const repairData: any = {
        client_id: parseInt(formData.clientId),
        brand: formData.brand,
        model: formData.model,
        serial_number: formData.serialNumber,
        device_name: formData.model, // Backward compatibility
        category: formData.issue,
        priority: formData.priority,
        problem_description: formData.description,
        technician_name: formData.technician,
        shop_name: formData.shop,
        cost: formData.estimatedCost ? parseFloat(formData.estimatedCost.replace(',', '.')) : 0,
        status: isEditing ? formData.status : "En cours", // Allow status update
      };

      if (reference) {
        repairData.reference = reference;
      }

      if (isEditing && id) {
        await updateRepair(id, repairData);
        showToast("Réparation mise à jour avec succès", "success");
        
        // Notify if status changed
        if (initialStatus !== formData.status) {
          try {
             await createNotification({
               title: `Mise à jour Réparation`,
               message: `Le statut de la réparation ${reference || ''} est passé de "${initialStatus}" à "${formData.status}"`,
               link: `/reparations/${id}`,
               // user_id: undefined // System wide
             });
          } catch (notifError) {
             console.error("Erreur création notification:", notifError);
             // Don't block the main flow
          }
        }
      } else {
        await createRepair(repairData);
        showToast("Réparation créée avec succès", "success");
      }
      
      navigate("/reparations");
    } catch (error) {
      console.error("Erreur sauvegarde réparation:", error);
      showToast("Erreur lors de l'enregistrement de la réparation", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditing && !formData.clientId) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <>
      <PageMeta
        title={isEditing ? "Modifier Réparation | QuickRepair France" : "Nouvelle Réparation | QuickRepair France"}
        description={isEditing ? "Modification d'une réparation" : "Création d'une nouvelle réparation"}
      />

      <div className="mx-auto max-w-270">
        <div className="mb-6 flex items-center gap-4">
          <Link
            to="/reparations"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-1 hover:bg-gray-100 dark:bg-boxdark dark:text-white dark:hover:bg-meta-4"
          >
            <ChevronLeft size={20} />
          </Link>
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            {isEditing ? "Modifier Réparation" : "Nouvelle Réparation"}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
          <div className="flex flex-col gap-9 sm:col-span-2">
            {/* Repair Form */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Détails de la réparation
                </h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="p-6.5">
                  <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Client <span className="text-meta-1">*</span>
                      </label>
                      <select
                        name="clientId"
                        value={formData.clientId}
                        onChange={handleChange}
                        className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        required
                      >
                        <option value="">Sélectionner un client</option>
                        {clients.map(client => (
                          <option key={client.id_client} value={client.id_client}>
                            {client.prenom} {client.nom}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full xl:w-1/3">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Marque <span className="text-meta-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="brand"
                        placeholder="Ex: Apple"
                        value={formData.brand}
                        onChange={handleChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        required
                      />
                    </div>

                    <div className="w-full xl:w-1/3">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Modèle <span className="text-meta-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="model"
                        placeholder="Ex: iPhone 14 Pro"
                        value={formData.model}
                        onChange={handleChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        required
                      />
                    </div>

                    <div className="w-full xl:w-1/3">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Numéro de série
                      </label>
                      <input
                        type="text"
                        name="serialNumber"
                        placeholder="Ex: SN12345678"
                        value={formData.serialNumber}
                        onChange={handleChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Type de panne <span className="text-meta-1">*</span>
                      </label>
                      <select
                        name="issue"
                        value={formData.issue}
                        onChange={handleChange}
                        className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        required
                      >
                        <option value="">Sélectionner le type de panne</option>
                        {repairTypes.map((type: any) => (
                          <option key={type.id_type_reparation} value={type.libelle}>
                            {type.libelle}
                          </option>
                        ))}
                        {/* Fallback for old data or manual entry */}
                        {!repairTypes.some(t => t.libelle === formData.issue) && formData.issue && formData.issue !== "Autre" && (
                          <option value={formData.issue}>{formData.issue}</option>
                        )}
                        <option value="Autre">Autre</option>
                      </select>
                    </div>

                    <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Priorité
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      >
                        <option value="Basse">Basse</option>
                        <option value="Normale">Normale</option>
                        <option value="Haute">Haute</option>
                        <option value="Urgente">Urgente</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Description du problème
                    </label>
                    <textarea
                      rows={4}
                      name="description"
                      placeholder="Détails sur la panne..."
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    ></textarea>
                  </div>

                  <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Technicien assigné
                      </label>
                      <select
                        name="technician"
                        value={formData.technician}
                        onChange={handleChange}
                        className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      >
                        <option value="">Sélectionner un technicien</option>
                        {technicians.map((tech) => (
                          <option key={tech.id_employe} value={`${tech.prenom} ${tech.nom}`}>
                            {tech.prenom} {tech.nom}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Boutique
                      </label>
                      <select
                        name="shop"
                        value={formData.shop}
                        onChange={handleChange}
                        className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        required
                      >
                        <option value="">Sélectionner une boutique</option>
                        {shops.map((shop) => (
                          <option key={shop.id_boutique} value={shop.nom}>
                            {shop.nom}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-6 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Estimation coût (€)
                      </label>
                      <input
                        type="number"
                        name="estimatedCost"
                        placeholder="0.00"
                        value={formData.estimatedCost}
                        onChange={handleChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      />
                    </div>

                    {isEditing && (
                      <div className="w-full xl:w-1/2">
                        <label className="mb-2.5 block text-black dark:text-white">
                          Statut actuel
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        >
                          <option value="En cours">En cours</option>
                          <option value="En attente pièce">En attente pièce</option>
                          <option value="En attente client">En attente client</option>
                          <option value="Terminée">Terminée</option>
                          <option value="Terminée - Livrée">Terminée - Livrée</option>
                          <option value="Terminée - En attente retrait">Terminée - En attente retrait</option>
                          <option value="Devis refusé">Devis refusé</option>
                          <option value="Annulée">Annulée</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
                  >
                    <Save size={20} className="mr-2" />
                    {isLoading ? "Enregistrement..." : (isEditing ? "Enregistrer les modifications" : "Créer la réparation")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
