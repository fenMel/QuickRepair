import React from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadCrumb from '../../components/common/PageBreadCrumb';

const TermsConditions: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Termes et Conditions | QuickRepair France"
        description="Conditions générales d'utilisation de QuickRepair France"
      />
      <PageBreadCrumb pageTitle="Termes et Conditions" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">1. Introduction</h2>
            <p>
              Bienvenue sur QuickRepair France. En utilisant notre plateforme et nos services, vous acceptez d'être lié par les présentes conditions générales d'utilisation. 
              Veuillez les lire attentivement avant d'utiliser nos services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">2. Services</h2>
            <p>
              QuickRepair France fournit des services de réparation d'appareils électroniques (smartphones, tablettes, ordinateurs, etc.). 
              Nous nous engageons à fournir des prestations de qualité dans les meilleurs délais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">3. Comptes Utilisateurs</h2>
            <p>
              Pour accéder à certaines fonctionnalités de notre plateforme, vous devez créer un compte. 
              Vous êtes responsable de maintenir la confidentialité de vos informations de connexion et de toutes les activités qui se produisent sous votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">4. Devis et Réparations</h2>
            <p>
              Tous les devis fournis sont estimatifs et peuvent être révisés après inspection physique de l'appareil. 
              Aucune réparation ne sera effectuée sans votre accord préalable sur le devis final.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">5. Garantie</h2>
            <p>
              Nos réparations sont garanties pour une période déterminée (généralement 6 mois ou 1 an, selon le type de réparation) couvrant les pièces et la main-d'œuvre, 
              hors casse et oxydation ultérieures.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">6. Responsabilité</h2>
            <p>
              QuickRepair France ne saurait être tenu responsable des pertes de données. 
              Il est de la responsabilité du client d'effectuer une sauvegarde de ses données avant de déposer son appareil en réparation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">7. Modification des Conditions</h2>
            <p>
              Nous nous réservons le droit de modifier ces conditions à tout moment. 
              Les modifications prendront effet dès leur publication sur cette page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">8. Contact</h2>
            <p>
              Pour toute question concernant ces conditions, veuillez nous contacter à l'adresse suivante : contact@quickrepair.fr
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default TermsConditions;
