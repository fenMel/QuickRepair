import React from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadCrumb from '../../components/common/PageBreadCrumb';

const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Politique de Confidentialité | QuickRepair France"
        description="Politique de confidentialité et protection des données de QuickRepair France"
      />
      <PageBreadCrumb pageTitle="Politique de Confidentialité" />

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">1. Collecte des Données</h2>
            <p>
              Nous collectons les informations que vous nous fournissez directement lorsque vous créez un compte, demandez un devis ou nous contactez. 
              Ces informations peuvent inclure votre nom, adresse email, numéro de téléphone et adresse postale.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">2. Utilisation des Données</h2>
            <p>
              Nous utilisons vos données pour :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Fournir, maintenir et améliorer nos services.</li>
              <li>Traiter vos demandes de réparation et communiquer avec vous à ce sujet.</li>
              <li>Vous envoyer des notifications techniques, des mises à jour et des alertes de sécurité.</li>
              <li>Répondre à vos commentaires et questions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">3. Partage des Données</h2>
            <p>
              Nous ne vendons ni ne louons vos données personnelles à des tiers. 
              Nous pouvons partager vos informations avec des prestataires de services tiers qui nous aident à exploiter notre activité (ex: hébergement, paiement), 
              sous réserve d'obligations de confidentialité strictes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">4. Sécurité</h2>
            <p>
              Nous prenons des mesures raisonnables pour protéger vos données contre la perte, le vol, l'utilisation abusive et l'accès non autorisé. 
              Cependant, aucune méthode de transmission sur Internet ou de stockage électronique n'est totalement sécurisée.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">5. Vos Droits</h2>
            <p>
              Conformément à la réglementation (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données. 
              Vous pouvez exercer ces droits en nous contactant.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">6. Cookies</h2>
            <p>
              Nous utilisons des cookies pour améliorer votre expérience sur notre site. 
              Vous pouvez configurer votre navigateur pour refuser tous les cookies ou pour vous avertir lorsqu'un cookie est envoyé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">7. Contact</h2>
            <p>
              Pour toute question concernant notre politique de confidentialité, veuillez nous contacter à : privacy@quickrepair.fr
            </p>
          </section>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
