import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { ChevronLeft, Save } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import { useToast } from "../../context/ToastContext";
import { createClient, updateClient, getClientById } from "../../services/supabaseService";

export default function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditing = !!id;
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    ville: "",
    code_postal: ""
  });

  useEffect(() => {
    const loadClient = async (id: string) => {
      try {
        setIsLoading(true);
        const data = await getClientById(id);
        if (data) {
          setFormData({
            nom: data.nom,
            prenom: data.prenom,
            email: data.email || "",
            telephone: data.telephone || "",
            ville: data.ville || "",
            code_postal: data.code_postal || ""
          });
        }
      } catch (error) {
        console.error("Erreur chargement client:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isEditing && id) {
      loadClient(id);
    }
  }, [isEditing, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const clientData = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        ville: formData.ville,
        code_postal: formData.code_postal
      };

      if (isEditing && id) {
        await updateClient(id, clientData);
        showToast("Client mis à jour avec succès", "success");
      } else {
        await createClient(clientData);
        showToast("Client créé avec succès", "success");
      }
      
      navigate("/clients");
    } catch (error) {
      console.error("Erreur sauvegarde client:", error);
      showToast("Erreur lors de l'enregistrement du client", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditing && !formData.nom) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <>
      <PageMeta
        title={isEditing ? "Modifier Client | QuickRepair France" : "Nouveau Client | QuickRepair France"}
        description={isEditing ? "Modification d'un client" : "Création d'un nouveau client"}
      />

      <div className="mx-auto max-w-270">
        <div className="mb-6 flex items-center gap-4">
          <Link
            to="/clients"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-1 hover:bg-gray-100 dark:bg-boxdark dark:text-white dark:hover:bg-meta-4"
          >
            <ChevronLeft size={20} />
          </Link>
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            {isEditing ? "Modifier Client" : "Nouveau Client"}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-9 sm:grid-cols-2">
          <div className="flex flex-col gap-9 sm:col-span-2">
            {/* Contact Form */}
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Informations de contact
                </h3>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="p-6.5">
                  <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Prénom <span className="text-meta-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="prenom"
                        placeholder="Entrez le prénom"
                        value={formData.prenom}
                        onChange={handleChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        required
                      />
                    </div>

                    <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Nom <span className="text-meta-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="nom"
                        placeholder="Entrez le nom"
                        value={formData.nom}
                        onChange={handleChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Email <span className="text-meta-1">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="client@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        required
                      />
                    </div>

                    <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Téléphone <span className="text-meta-1">*</span>
                      </label>
                      <input
                        type="tel"
                        name="telephone"
                        placeholder="06 12 34 56 78"
                        value={formData.telephone}
                        onChange={handleChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
                    <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Ville
                      </label>
                      <input
                        type="text"
                        name="ville"
                        placeholder="Ville"
                        value={formData.ville}
                        onChange={handleChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      />
                    </div>

                    <div className="w-full xl:w-1/2">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Code Postal
                      </label>
                      <input
                        type="text"
                        name="code_postal"
                        placeholder="Code Postal"
                        value={formData.code_postal}
                        onChange={handleChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full justify-center rounded-lg bg-brand-500 p-3 font-medium text-white hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed transition"
                  >
                    <Save size={20} className="mr-2" />
                    {isLoading ? "Enregistrement..." : (isEditing ? "Enregistrer les modifications" : "Créer le client")}
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