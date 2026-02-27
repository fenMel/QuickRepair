# QuickRepair

Application web de gestion de réparations rapides, construite avec **React**, **TypeScript**, **Vite** et **Supabase**.

---

## 🚀 Démarrage rapide (développement local)

### Prérequis

- [Node.js](https://nodejs.org/) v18 ou supérieur
- [npm](https://www.npmjs.com/) v9 ou supérieur

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/fenMel/QuickRepair.git
cd QuickRepair

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
# Créer un fichier .env à la racine avec VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

# 4. Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur [http://localhost:5173](http://localhost:5173).

 Comptes de test — jojo1@gmail.com (Administrateur), tutu2@gmail.com (Technicien),
titi3@gmail.com (Responsable boutique) — mot de passe commun : Azerty123
---

## 🌐 Déploiement

### Option 1 — GitHub Pages (recommandé, automatique)

Le dépôt inclut un workflow GitHub Actions qui déploie automatiquement l'application sur **GitHub Pages** à chaque push sur la branche `main`.

#### Étapes à suivre une seule fois :

1. **Activer GitHub Pages** dans les paramètres du dépôt :
   - Aller dans **Settings → Pages**
   - Choisir **Source : GitHub Actions**

2. **Ajouter les variables** dans **Settings → Secrets and variables → Actions → onglet Variables → New repository variable** :

   | Nom de la variable       | Valeur                          |
   |--------------------------|---------------------------------|
   | `VITE_SUPABASE_URL`      | L'URL de votre projet Supabase  |
   | `VITE_SUPABASE_ANON_KEY` | La clé anon de votre projet     |

3. **Pousser sur `main`** — le déploiement se lance automatiquement.

L'application sera disponible à l'adresse :
```
https://<votre-username>.github.io/QuickRepair/
```

> ⚠️ Pensez à ajouter cette URL dans la liste des **Redirect URLs** autorisées dans votre projet Supabase (Authentication → URL Configuration).

#### Déclenchement manuel

Vous pouvez aussi lancer le déploiement manuellement depuis **Actions → Deploy to GitHub Pages → Run workflow**.

---

### Option 2 — Vercel

1. Importer le dépôt sur [vercel.com](https://vercel.com).
2. Dans les paramètres du projet, ajouter les variables d'environnement :
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Cliquer sur **Deploy** — Vercel détecte automatiquement Vite.

---

### Option 3 — Netlify

1. Importer le dépôt sur [netlify.com](https://netlify.com).
2. Configurer la commande de build :
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`
3. Ajouter les variables d'environnement `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
4. Cliquer sur **Deploy site**.

---

### Option 4 — Build manuel

```bash
# Générer les fichiers de production dans le dossier dist/
npm run build

# Prévisualiser le build localement
npm run preview
```

Déployez ensuite le contenu du dossier `dist/` sur n'importe quel hébergeur de fichiers statiques (Nginx, Apache, etc.).

---

## 🔑 Variables d'environnement

| Variable                  | Description                          |
|---------------------------|--------------------------------------|
| `VITE_SUPABASE_URL`       | URL de votre instance Supabase       |
| `VITE_SUPABASE_ANON_KEY`  | Clé publique (anon) de Supabase      |

Créer un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=https://<project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

---

## 🛠️ Scripts disponibles

| Commande           | Description                            |
|--------------------|----------------------------------------|
| `npm run dev`      | Serveur de développement (hot reload)  |
| `npm run build`    | Build de production                    |
| `npm run preview`  | Prévisualisation du build              |
| `npm run lint`     | Analyse statique du code               |
