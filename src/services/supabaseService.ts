import { supabase } from '../supabaseClient';

// --- Types ---

export interface Client {
  id_client?: number; // Integer
  nom: string; // last_name
  prenom: string; // first_name
  email: string;
  telephone: string; // phone
  ville: string; // city
  code_postal: string; // postal_code
  // address and notes removed as per user schema
  date_creation?: string;
  // date_modification removed as per user schema (only date_creation listed)
  
  // Joined data (optional)
  repairs?: Repair[];
}

export interface Repair {
  id?: number | string; // UUID or Integer
  reference: string;
  client_id: number; // Integer (FK to client.id_client)
  device_name: string;
  brand?: string; // New field
  model?: string; // New field
  serial_number?: string; // New field
  category: string;
  priority: string;
  problem_description: string;
  status: string;
  shop_name: string;
  shop_id?: number; // Added for manager logic
  technician_name: string;
  technician_id?: number; // Added for manager logic
  cost: number;
  date_creation?: string;
  date_modification?: string;
  
  // Joined data
  client?: Client;
  
  // UI helpers
  client_name?: string;
  client_email?: string;
  client_phone?: string;
}

export interface Employe {
  id_employe?: number; // Integer
  nom: string; // last_name
  prenom: string; // first_name
  email: string;
  telephone: string; // phone
  actif: boolean;
  id_role: number;
  id_boutique: number;
  photo_url?: string; // Optional for UI display, if not in DB
  mot_de_passe_hash?: string; // Hashed password
}

export interface Notification {
  id: string;
  created_at: string;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  user_id?: string; // Optional if targeting specific user
}

// --- Notification Services ---

export const getNotifications = async (limit = 10) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    // If table doesn't exist yet, return empty array instead of throwing
    if (error.code === '42P01') { // undefined_table
      console.warn("Table 'notifications' does not exist yet.");
      return [];
    }
    throw error;
  }
  return data as Notification[];
};

export const markNotificationAsRead = async (id: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);
    
  if (error) throw error;
};

export const createNotification = async (notification: Omit<Notification, 'id' | 'created_at' | 'read'>) => {
  const { error } = await supabase
    .from('notifications')
    .insert([{ ...notification, read: false }]);
    
  if (error) throw error;
};

// --- Employe Services ---

// Warning: Fetching hash to client is not secure for production.
// Ideally, use Supabase Auth or an Edge Function.
export const getEmployeByEmailWithHash = async (email: string) => {
  const { data, error } = await supabase
    .from('employe')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    console.warn("Employe not found for email:", email);
    return null;
  }
  return data as Employe;
};

export const getEmployees = async (shopId?: number) => {
  let query = supabase
    .from('employe')
    .select('*')
    .order('nom');
    
  if (shopId) {
    query = query.eq('id_boutique', shopId);
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data as Employe[];
};

export const getEmployeByEmail = async (email: string) => {
  const { data, error } = await supabase
    .from('employe')
    .select('id_employe, nom, prenom, email, telephone, actif, id_role, id_boutique, photo_url') // Exclude hash
    .eq('email', email)
    .single();
  
  if (error) {
    // If not found, it might be a new user or error
    console.warn("Employe not found for email:", email);
    return null;
  }
  return data as Employe;
};

export const createEmploye = async (employe: Omit<Employe, 'id_employe'>) => {
  const { data, error } = await supabase
    .from('employe')
    .insert([employe])
    .select()
    .single();
  
  if (error) throw error;
  return data as Employe;
};

export const updateEmploye = async (id: number, updates: Partial<Employe>) => {
  const { data, error } = await supabase
    .from('employe')
    .update(updates)
    .eq('id_employe', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Employe;
};

// --- Boutique Services ---

export interface Boutique {
  id_boutique: number;
  nom: string;
  ville: string;
  code_postal: string;
  adresse: string;
  telephone: string;
  email: string;
}

export const getBoutiques = async () => {
  const { data, error } = await supabase
    .from('boutique')
    .select('*')
    .order('nom');
  
  if (error) throw error;
  return data as Boutique[];
};

// --- Client Services ---

export const getClients = async () => {
  const { data, error } = await supabase
    .from('client')
    .select('*')
    .order('date_creation', { ascending: false });
  
  if (error) throw error;
  return data as Client[];
};

export const getClientById = async (id: number | string) => {
  const { data, error } = await supabase
    .from('client')
    .select('*')
    .eq('id_client', id)
    .single();
  
  if (error) throw error;
  return data as Client;
};

export const createClient = async (client: Omit<Client, 'id_client' | 'date_creation'>) => {
  const clientWithDate = {
    ...client,
    date_creation: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('client')
    .insert([clientWithDate])
    .select()
    .single();
  
  if (error) throw error;
  return data as Client;
};

export const updateClient = async (id: number | string, updates: Partial<Client>) => {
  // Removing date_modification update as it's not in the user's schema list
  // If user wants it, they can add it back. For now, strict schema.
  const { data, error } = await supabase
    .from('client')
    .update({ ...updates }) 
    .eq('id_client', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Client;
};

export const deleteClient = async (id: number | string) => {
  const { error } = await supabase
    .from('client')
    .delete()
    .eq('id_client', id);
  
  if (error) throw error;
};

export const getRepairsByClientId = async (clientId: number | string) => {
  // Need to join appareil to filter by client_id
  const { data, error } = await supabase
    .from('reparation')
    .select(`
      *,
      appareil!inner (
        id_client
      )
    `)
    .eq('appareil.id_client', clientId)
    .order('date_depot', { ascending: false });
  
  if (error) throw error;
  
  // Map to Repair interface
  return data.map((r: any) => ({
    id: r.id_reparation,
    reference: r.numero_suivi,
    client_id: r.appareil?.id_client, // From join
    device_name: 'Appareil', // TODO: Get from appareil join details
    category: r.id_type_reparation, // TODO: Get label
    priority: 'Normal', // Default
    problem_description: 'Description non disponible', // Missing in schema
    status: r.statut_actuel,
    cost: r.montant_total,
    date_creation: r.date_depot,
    shop_name: r.id_boutique, // TODO: Get name
  })) as Repair[];
};

export const getStats = async (shopId?: number) => {
  const { count: clientsCount, error: clientsError } = await supabase
    .from('client')
    .select('*', { count: 'exact', head: true });

  let repairsQuery = supabase
    .from('reparation')
    .select('montant_total, statut_actuel, date_depot, id_boutique');

  if (shopId) {
    repairsQuery = repairsQuery.eq('id_boutique', shopId);
  }

  const { data: repairs, error: repairsError } = await repairsQuery;

  if (clientsError) throw clientsError;
  if (repairsError) throw repairsError;

  const repairsData = repairs || [];

  // 1. Active Repairs
  // Active statuses: Créé, Diagnostic, Devis accepté, En attente pièce, En cours
  const activeRepairsCount = repairsData.filter(r => 
    !r.statut_actuel.startsWith("Terminée") && r.statut_actuel !== "Devis refusé"
  ).length;

  // 2. Monthly Revenue (Current Month)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthlyRevenue = repairsData
    .filter(r => {
      if (!r.date_depot || !r.montant_total) return false;
      const d = new Date(r.date_depot);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, r) => sum + (r.montant_total || 0), 0);

  // 3. Success Rate
  // Success = "Terminée - Livrée" or "Terminée - En attente retrait"
  const completedRepairs = repairsData.filter(r => r.statut_actuel.startsWith('Terminée')).length;
  const successRate = repairsData.length > 0 
    ? Math.round((completedRepairs / repairsData.length) * 100) 
    : 0;

  // 4. Stock Alerts (Low Stock)
  let stockAlerts = 0;
  try {
    let stocksQuery = supabase.from('stock').select('quantite_stock, seuil_alerte_local');
    if (shopId) {
      stocksQuery = stocksQuery.eq('id_boutique', shopId);
    }
    
    const { data: stocks, error: stockError } = await stocksQuery;
    
    if (!stockError && stocks) {
      stockAlerts = stocks.filter((s: any) => s.quantite_stock < s.seuil_alerte_local).length;
    }
  } catch (e) {
    console.warn("Stock stats unavailable:", e);
  }

  return {
    clients: clientsCount || 0,
    repairs: repairsData.length || 0,
    activeRepairs: activeRepairsCount,
    monthlyRevenue,
    successRate,
    stockAlerts
  };
};

export const getRepairTypes = async () => {
  const { data, error } = await supabase
    .from('type_reparation')
    .select('*')
    .order('libelle');
  
  if (error) throw error;
  return data;
};

// --- Employee Services ---

// --- Employee Services duplicate removed ---

// --- Stock Services ---

export interface StockItem {
  id_piece: number;
  id_boutique: number;
  quantite_stock: number;
  seuil_alerte_local: number;
  
  // Joined from piece
  piece?: {
    nom_piece: string;
    reference: string;
    categorie?: string;
    seuil_alerte?: number;
  };
  
  // Joined from boutique
  boutique?: {
    nom: string;
  };
}

export const getStocks = async (shopId?: number) => {
  let query = supabase
    .from('stock')
    .select(`
      id_piece,
      id_boutique,
      quantite_stock,
      seuil_alerte_local,
      piece (
        nom_piece,
        reference,
        categorie,
        seuil_alerte
      ),
      boutique (
        nom
      )
    `);

  if (shopId) {
    query = query.eq('id_boutique', shopId);
  }
  
  const { data, error } = await query;
  
  if (error) {
     if (error.code === '42P01') return [];
     throw error;
  }
  return data as unknown as StockItem[];
};

// --- Supplier Order Services ---

export interface SupplierOrder {
  id_commande: number;
  id_fournisseur: number;
  id_boutique: number;
  date_commande: string;
  statut: string;
  date_reception?: string;

  // Joined fields
  boutique?: {
    nom: string;
  };
  fournisseur?: {
    nom: string;
  };
}

export const getSupplierOrders = async (shopId?: number) => {
  let query = supabase
    .from('commande_fournisseur')
    .select(`
      id_commande,
      id_fournisseur,
      id_boutique,
      date_commande,
      statut,
      date_reception,
      boutique (nom),
      fournisseur (nom)
    `)
    .order('date_commande', { ascending: false });

  if (shopId) {
    query = query.eq('id_boutique', shopId);
  }
  
  const { data, error } = await query;
  
  if (error) {
     if (error.code === '42P01') return [];
     throw error;
  }
  
  // Fix potential array return from joins
  return (data || []).map((item: any) => ({
    ...item,
    boutique: Array.isArray(item.boutique) ? item.boutique[0] : item.boutique,
    fournisseur: Array.isArray(item.fournisseur) ? item.fournisseur[0] : item.fournisseur
  })) as SupplierOrder[];
};

export interface Fournisseur {
  id_fournisseur: number;
  nom: string;
  specialite: string;
  delai_livraison_jours: number;
  ville: string;
}

export const getFournisseurs = async () => {
  const { data, error } = await supabase
    .from('fournisseur')
    .select('*')
    .order('nom');
  
  if (error) {
     if (error.code === '42P01') return [];
     throw error;
  }
  return data as Fournisseur[];
};

export const createSupplierOrder = async (order: Omit<SupplierOrder, 'id_commande' | 'boutique' | 'fournisseur'>) => {
  const { data, error } = await supabase
    .from('commande_fournisseur')
    .insert([order])
    .select()
    .single();
    
  if (error) throw error;
  return data as SupplierOrder;
};

// --- Repair Services ---

export const getRepairs = async (limit?: number, employeeId?: number, shopId?: number) => {
  let query = supabase
    .from('reparation')
    .select(`
      *,
      appareil (
        marque,
        modele,
        numero_serie,
        client:client (
          id_client,
          nom,
          prenom,
          email,
          telephone
        )
      ),
      boutique (
        nom
      ),
      type_reparation (
        libelle
      ),
      employe!reparation_id_employe_fkey (
        nom,
        prenom
      )
    `);

  // Apply filters before modifiers
  if (employeeId) {
    query = query.eq('id_employe', employeeId);
  }

  if (shopId) {
    query = query.eq('id_boutique', shopId);
  }

  // Apply modifiers
  query = query.order('date_depot', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Transform to match Repair interface
  return data.map((r: any) => {
    const technician = r.employe 
      ? `${r.employe.prenom} ${r.employe.nom}`
      : 'Non assigné';

    return {
      id: r.id_reparation,
      reference: r.numero_suivi,
      client_id: r.appareil?.client?.id_client,
      device_name: r.appareil 
        ? (r.appareil.marque && r.appareil.marque !== 'Inconnu' 
            ? `${r.appareil.marque} ${r.appareil.modele}` 
            : r.appareil.modele)
        : 'Inconnu',
      brand: r.appareil?.marque,
      model: r.appareil?.modele,
      serial_number: r.appareil?.numero_serie,
      category: r.type_reparation?.libelle || 'Inconnu',
      priority: 'Normal', // Not in schema
      problem_description: 'Voir détails', // Not in schema
      status: r.statut_actuel,
      shop_name: r.boutique?.nom || 'Inconnu',
      technician_name: technician,
      cost: r.montant_total,
      date_creation: r.date_depot,
      date_modification: r.date_modification,
      
      // UI helpers
      client_name: r.appareil?.client ? `${r.appareil.client.prenom} ${r.appareil.client.nom}` : 'Inconnu',
      client_email: r.appareil?.client?.email,
      client_phone: r.appareil?.client?.telephone
    };
  }) as Repair[];
};

export const getRepairById = async (id: string) => {
  const { data, error } = await supabase
    .from('reparation')
    .select(`
      *,
      appareil (
        marque,
        modele,
        numero_serie,
        client:client (*)
      ),
      boutique (
        nom
      ),
      type_reparation (
        libelle
      ),
      employe!reparation_id_employe_fkey (
        nom,
        prenom
      )
    `)
    .eq('id_reparation', id)
    .single();
  
  if (error) throw error;
  
  const r = data as any;
  
  const technician = r.employe 
    ? `${r.employe.prenom} ${r.employe.nom}`
    : 'Non assigné';

  return {
    id: r.id_reparation,
    reference: r.numero_suivi,
    client_id: r.appareil?.client?.id_client,
    device_name: r.appareil 
      ? (r.appareil.marque && r.appareil.marque !== 'Inconnu' 
          ? `${r.appareil.marque} ${r.appareil.modele}` 
          : r.appareil.modele)
      : 'Inconnu',
    brand: r.appareil?.marque,
    model: r.appareil?.modele,
    serial_number: r.appareil?.numero_serie,
    category: r.type_reparation?.libelle || 'Inconnu',
    priority: 'Normal',
    problem_description: 'Voir détails',
    status: r.statut_actuel,
    shop_name: r.boutique?.nom || 'Inconnu',
    shop_id: r.id_boutique,
    technician_name: technician,
    technician_id: r.id_employe,
    cost: r.montant_total,
    date_creation: r.date_depot,
    
    // UI helpers
    client_name: r.appareil?.client ? `${r.appareil.client.prenom} ${r.appareil.client.nom}` : 'Inconnu',
    client_email: r.appareil?.client?.email,
    client_phone: r.appareil?.client?.telephone,
    
    // Raw data access if needed
    client: r.appareil?.client
  } as Repair;
};

export const createRepair = async (repair: any) => {
  // 1. Resolve Boutique
  const { data: boutiqueData } = await supabase
    .from('boutique')
    .select('id_boutique')
    .ilike('nom', `%${repair.shop_name}%`)
    .limit(1)
    .single();

  const id_boutique = boutiqueData?.id_boutique || 1; // Default to 1 if not found

  // 2. Resolve Type Reparation
  const { data: typeData } = await supabase
    .from('type_reparation')
    .select('id_type_reparation')
    .ilike('libelle', `%${repair.category}%`)
    .limit(1)
    .single();

  const id_type_reparation = typeData?.id_type_reparation || 1; // Default to 1 if not found

  // 3. Create Appareil (Device)
  const { data: appareilData, error: appareilError } = await supabase
    .from('appareil')
    .insert([{
      id_client: repair.client_id,
      marque: repair.brand || 'Inconnu', 
      modele: repair.model || repair.device_name,
      numero_serie: repair.serial_number || 'Non renseigné'
    }])
    .select()
    .single();

  if (appareilError) throw appareilError;

  // 4. Resolve Technician if provided
  let id_employe = null;
  if (repair.technician_name) {
    const { data: employeData } = await supabase
      .from('employe')
      .select('id_employe')
      .ilike('nom', `%${repair.technician_name.split(' ').pop()}%`)
      .limit(1)
      .single();
    if (employeData) id_employe = employeData.id_employe;
  }

  // 5. Create Reparation
  const { data, error } = await supabase
    .from('reparation')
    .insert([{
      numero_suivi: repair.reference,
      id_appareil: appareilData.id_appareil,
      id_boutique: id_boutique,
      id_type_reparation: id_type_reparation,
      id_employe: id_employe, // Assigned directly
      statut_actuel: repair.status || 'En cours',
      montant_total: repair.cost,
      date_depot: new Date().toISOString(),
      // date_livraison: null,
      // date_fin_garantie: null
    }])
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    ...repair,
    id: data.id_reparation,
    date_creation: data.date_depot
  } as Repair;
};

export const updateRepair = async (id: string, updates: Partial<Repair>) => {
  // Map updates to schema columns
  const dbUpdates: any = {};
  if (updates.status) dbUpdates.statut_actuel = updates.status;
  if (updates.cost) dbUpdates.montant_total = updates.cost;
  
  // If updating device details, we need to update the appareil table
  const deviceUpdates: any = {};
  if (updates.device_name) deviceUpdates.modele = updates.device_name;
  if (updates.model) deviceUpdates.modele = updates.model;
  if (updates.brand) deviceUpdates.marque = updates.brand;
  if (updates.serial_number) deviceUpdates.numero_serie = updates.serial_number;

  if (Object.keys(deviceUpdates).length > 0) {
    // First get the repair to find the appareil id
    const { data: repairData, error: repairError } = await supabase
      .from('reparation')
      .select('id_appareil')
      .eq('id_reparation', id)
      .single();

    if (!repairError && repairData?.id_appareil) {
      await supabase
        .from('appareil')
        .update(deviceUpdates)
        .eq('id_appareil', repairData.id_appareil);
    }
  }

  // If updating technician, we resolve the ID and update the reparation table directly
  if (updates.technician_id) {
    dbUpdates.id_employe = updates.technician_id;
  } else if (updates.technician_name) {
     const { data: employeData } = await supabase
      .from('employe')
      .select('id_employe')
      .ilike('nom', `%${updates.technician_name.split(' ').pop()}%`)
      .limit(1)
      .single();

    if (employeData) {
      dbUpdates.id_employe = employeData.id_employe;
    }
  }

  // If updating shop or category, we need to resolve IDs again
  if (updates.shop_name) {
     const { data: boutiqueData } = await supabase
      .from('boutique')
      .select('id_boutique')
      .ilike('nom', `%${updates.shop_name}%`)
      .limit(1)
      .single();
      if (boutiqueData) dbUpdates.id_boutique = boutiqueData.id_boutique;
  }

  if (updates.category) {
    const { data: typeData } = await supabase
      .from('type_reparation')
      .select('id_type_reparation')
      .ilike('libelle', `%${updates.category}%`)
      .limit(1)
      .single();
      if (typeData) dbUpdates.id_type_reparation = typeData.id_type_reparation;
  }

  // Perform update on reparation table
  if (Object.keys(dbUpdates).length > 0) {
    const { data, error } = await supabase
      .from('reparation')
      .update(dbUpdates)
      .eq('id_reparation', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as any;
  }
  
  return null;
};

export const deleteRepair = async (id: string) => {
  const { error } = await supabase
    .from('reparation')
    .delete()
    .eq('id_reparation', id);
  
  if (error) throw error;
};

// --- Stock & Parts Services (New) ---

export const getUsedParts = async (repairId: string) => {
  const { data, error } = await supabase
    .from('utilise')
    .select(`
      *,
      piece (nom_piece, reference)
    `)
    .eq('id_reparation', repairId);

  if (error) {
    if (error.code === '42P01') return [];
    throw error;
  }
  return data;
};

export const addUsedPart = async (repairId: string, partId: string, quantity: number) => {
  const { data, error } = await supabase
    .from('utilise')
    .insert([{
      id_reparation: repairId,
      id_piece: partId,
      quantite: quantity
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// --- Quotes (Devis) Services (New) ---

export interface Quote {
  id: string;
  id_devis?: string; // Alias for UI compatibility
  id_reparation: string;
  montant_total: number;
  statut: string;
  date_creation: string;
  contenu: any;
}

export const getQuoteByRepairId = async (repairId: string) => {
  const { data, error } = await supabase
    .from('devis')
    .select('*')
    .eq('id_reparation', repairId)
    .single();

  if (error) {
    // Return null if not found (no quote yet)
    return null;
  }
  // Add alias
  return { ...data, id_devis: data.id } as Quote;
};

export const createQuote = async (quote: Omit<Quote, 'id' | 'date_creation'>) => {
  const { data, error } = await supabase
    .from('devis')
    .insert([quote])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateQuote = async (id: string, updates: Partial<Quote>) => {
  const { data, error } = await supabase
    .from('devis')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateQuoteStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('devis')
    .update({ statut: status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
