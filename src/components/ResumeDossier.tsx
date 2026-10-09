import React from "react";
import { Briefcase, GraduationCap, Globe2, Sparkles, MapPin, Mail, Linkedin, Phone, ArrowUpRight } from "lucide-react";
import { ProfileData } from "../types";

interface ResumeDossierProps {
  onAskTopic: (prompt: string) => void;
  language: "en" | "fr";
}

export const ResumeDossier: React.FC<ResumeDossierProps> = ({ onAskTopic, language }) => {
  const isFr = language === "fr";

  return (
    <div className="bg-[#FAF7F2] border border-[#E8E2D6] rounded-xl p-6 lg:p-8 space-y-8 text-[#26231F]">
      {/* Header Profile */}
      <div className="border-b border-[#E8E2D6] pb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h2 className="text-3xl lg:text-4xl font-serif-display font-medium tracking-tight text-[#1C1A18]">
              Satine Liotaud
            </h2>
            <p className="text-base font-serif-body italic text-[#6B6357] mt-1">
              {isFr
                ? "Commerce International & Relation Client Logistique de Luxe"
                : "International Commerce & Luxury Logistics Assistant"}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#7B7264] font-sans-ui mt-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Jouy-en-Josas, 78350, France
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> satine.liotaud@yahoo.com
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> 06 85 63 84 63
              </span>
            </div>
          </div>

          <a
            href="https://www.linkedin.com/in/satine-liotaud-195528253"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans-ui font-medium border border-[#DCD5C7] rounded-md hover:bg-[#F2ECE1] transition-colors text-[#2C2925] self-start"
          >
            <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
            <span>LinkedIn Profile</span>
            <ArrowUpRight className="w-3 h-3 text-[#7B7264]" />
          </a>
        </div>

        {/* Short Executive Summary */}
        <p className="text-sm font-serif-body text-[#4A443B] leading-relaxed mt-4">
          {isFr
            ? "Actuellement en troisième année à l'ESCE International Business School (Programme Grandes Écoles, BAC+5) à Paris La Défense. Forte expérience dans la maison de luxe Lanvin en logistique internationale et service client VIP."
            : "Currently in 3rd year at ESCE International Business School (Grandes Écoles Program, Master's Level) in Paris La Défense. Proven experience at luxury fashion house Lanvin managing international logistics and VIP client service."}
        </p>
      </div>

      {/* Professional Experiences */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#8C7654]" />
            <h3 className="text-xs uppercase tracking-widest font-sans-ui font-semibold text-[#665D4F]">
              {isFr ? "Expériences Professionnelles" : "Professional Experiences"}
            </h3>
          </div>
          <span className="text-[11px] font-sans-ui text-[#8A8172]">
            {isFr ? "Cliquez sur une expérience pour interroger Sat" : "Click to ask Sat about any role"}
          </span>
        </div>

        <div className="space-y-5">
          {/* LANVIN */}
          <div
            onClick={() =>
              onAskTopic(
                isFr
                  ? "Peux-tu me détailler les missions et réussites de Satine chez Lanvin dans le luxe ?"
                  : "Can you detail Satine's responsibilities and achievements at Maison Lanvin in luxury logistics?"
              )
            }
            className="group cursor-pointer p-4 rounded-lg bg-[#F5F0E6] hover:bg-[#EFE9DC] border border-[#E2DBD0] transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <h4 className="font-serif-display text-lg font-medium text-[#1A1816] group-hover:text-[#8C7654] transition-colors">
                LANVIN <span className="font-serif-body text-sm font-normal text-[#665F53]">· Paris</span>
              </h4>
              <span className="text-xs font-sans-ui text-[#7A7163]">
                {isFr ? "Juil. – Déc. 2025 (6 mois)" : "July – Dec 2025"}
              </span>
            </div>
            <p className="text-xs font-sans-ui font-medium text-[#524B40] mt-0.5">
              {isFr
                ? "Customer Service & Logistics Assistant dans le LUXE"
                : "Customer Service & Logistics Assistant in LUXURY"}
            </p>
            <ul className="text-xs font-serif-body text-[#474136] mt-2.5 space-y-1 list-disc list-inside leading-relaxed">
              <li>
                {isFr
                  ? "Gestion relation client internationale (retail, wholesale, SAV, transporteurs)"
                  : "International customer relations (retail, wholesale, after-sales, carriers)"}
              </li>
              <li>
                {isFr
                  ? "Gestion des stocks et flux logistiques via SAP & résolution des réclamations via Zendesk"
                  : "Inventory & supply chain management in SAP; Zendesk claims and returns resolution"}
              </li>
              <li>
                {isFr
                  ? "Sourcing pièces détachées internationales, reportings Excel/Cognos et douanes"
                  : "International spare parts sourcing, weekly Excel/Cognos reporting & customs"}
              </li>
              <li>
                {isFr
                  ? "Contribution à l'installation des showrooms VIP lors de la Paris Fashion Week 2025"
                  : "Setup of VIP Showrooms during Paris Fashion Week 2025"}
              </li>
            </ul>
            <div className="flex items-center gap-1 text-[11px] font-sans-ui text-[#8C7654] mt-2 opacity-80 group-hover:opacity-100">
              <Sparkles className="w-3 h-3" />
              <span>{isFr ? "Demander à Sat d'en parler de vive voix" : "Ask Sat to speak about Lanvin"}</span>
            </div>
          </div>

          {/* INTERSPORT */}
          <div
            onClick={() =>
              onAskTopic(
                isFr
                  ? "Que peux-tu me dire sur son rôle d'hôtesse de caisse polyvalente chez Intersport ?"
                  : "Tell me about her customer engagement and cashier experience at Intersport."
              )
            }
            className="group cursor-pointer p-4 rounded-lg bg-[#F8F5EE] hover:bg-[#F2ECE1] border border-[#E8E2D8] transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <h4 className="font-serif-display text-lg font-medium text-[#1A1816] group-hover:text-[#8C7654] transition-colors">
                INTERSPORT
              </h4>
              <span className="text-xs font-sans-ui text-[#7A7163]">
                {isFr ? "Sept. 2024 – Mai 2025" : "Sept 2024 – May 2025"}
              </span>
            </div>
            <p className="text-xs font-sans-ui font-medium text-[#524B40] mt-0.5">
              {isFr ? "Hôtesse de Caisse polyvalente" : "Multipurpose Sales Hostess & Cashier"}
            </p>
            <p className="text-xs font-serif-body text-[#474136] mt-1.5 leading-relaxed">
              {isFr
                ? "Fidélisation client, analyse des données de ventes pour ajuster les stratégies commerciales et valorisation des produits en rayon."
                : "Customer loyalty program execution, point-of-sale data analysis to optimize sales strategy, and in-store merchandising."}
            </p>
          </div>

          {/* LES BIJOUX DE MARILOU */}
          <div
            onClick={() =>
              onAskTopic(
                isFr
                  ? "Raconte-moi son expérience e-commerce chez Les Bijoux de Marilou."
                  : "Tell me about her e-commerce and customer service role at Les Bijoux de Marilou."
              )
            }
            className="group cursor-pointer p-4 rounded-lg bg-[#F8F5EE] hover:bg-[#F2ECE1] border border-[#E8E2D8] transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <h4 className="font-serif-display text-lg font-medium text-[#1A1816] group-hover:text-[#8C7654] transition-colors">
                LES BIJOUX DE MARILOU
              </h4>
              <span className="text-xs font-sans-ui text-[#7A7163]">
                {isFr ? "Mai – Juil. 2024" : "May – July 2024"}
              </span>
            </div>
            <p className="text-xs font-sans-ui font-medium text-[#524B40] mt-0.5">
              {isFr ? "Assistante Commerciale E-commerce" : "E-commerce Commercial Assistant"}
            </p>
            <p className="text-xs font-serif-body text-[#474136] mt-1.5 leading-relaxed">
              {isFr
                ? "Standard téléphonique, restructuration complète du guide SAV interne, gestion des commandes sur Shopify et packaging soigné."
                : "Customer hotline management, overhaul of after-sales procedures, Shopify order management, and packaging."}
            </p>
          </div>
        </div>
      </div>

      {/* Formations / Education */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="w-4 h-4 text-[#8C7654]" />
          <h3 className="text-xs uppercase tracking-widest font-sans-ui font-semibold text-[#665D4F]">
            {isFr ? "Formations & Diplômes" : "Education & Academic Path"}
          </h3>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 rounded-lg border border-[#E4DDD0] bg-[#FAF7F2]">
            <div className="flex justify-between items-baseline">
              <p className="font-serif-display text-base font-medium text-[#1A1816]">
                ESCE International Business School
              </p>
              <span className="text-xs font-sans-ui text-[#7A7163]">2023 – 2028</span>
            </div>
            <p className="text-xs font-serif-body text-[#4A443B] mt-0.5">
              {isFr
                ? "Programme Grandes Écoles (BAC+5) · 3ème année · Campus Paris La Défense"
                : "Grandes Écoles Program (Master's BAC+5) · 3rd Year · Paris La Défense"}
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-[#E4DDD0] bg-[#FAF7F2]">
            <div className="flex justify-between items-baseline">
              <p className="font-serif-display text-base font-medium text-[#1A1816]">
                Lycée La Bruyère · Versailles
              </p>
              <span className="text-xs font-sans-ui text-[#7A7163]">2023</span>
            </div>
            <p className="text-xs font-serif-body text-[#4A443B] mt-0.5">
              {isFr
                ? "Baccalauréat Général · Spécialités SES et HGGSP"
                : "National Baccalaureate with Economics & Social Sciences, Geopolitics"}
            </p>
          </div>
        </div>
      </div>

      {/* Languages & Technical Skills & Passions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#E8E2D6] pt-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Globe2 className="w-4 h-4 text-[#8C7654]" />
            <h3 className="text-xs uppercase tracking-widest font-sans-ui font-semibold text-[#665D4F]">
              {isFr ? "Langues & Outils" : "Languages & Tools"}
            </h3>
          </div>
          <div className="text-xs font-serif-body text-[#423C33] space-y-1">
            <p>
              <strong className="font-sans-ui font-semibold">{isFr ? "Français :" : "French :"}</strong>{" "}
              {isFr ? "Langue maternelle (Native)" : "Native speaker"}
            </p>
            <p>
              <strong className="font-sans-ui font-semibold">{isFr ? "Anglais :" : "English :"}</strong>{" "}
              B1 (Professionnel / Commerce)
            </p>
            <p>
              <strong className="font-sans-ui font-semibold">{isFr ? "Espagnol :" : "Spanish :"}</strong> A2
            </p>
            <p className="pt-1.5 text-[11px] font-sans-ui text-[#6B6355]">
              <strong className="font-medium text-[#2E2A24]">{isFr ? "Logiciels :" : "Software :"}</strong> SAP ·
              Zendesk · IBM Cognos · Shopify · Excel · Office
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-widest font-sans-ui font-semibold text-[#665D4F] mb-2">
            {isFr ? "Centres d'intérêt" : "Interests & Culture"}
          </h3>
          <div className="text-xs font-serif-body text-[#423C33] space-y-1 leading-relaxed">
            <p>
              • {isFr ? "Voyages : Londres, NYC, Lisbonne, Dubaï, Barcelone, Rome" : "Travel: London, NYC, Lisbon, Dubai, Barcelona, Rome"}
            </p>
            <p>
              • {isFr ? "Sorties culturelles : Musée Yves St Laurent, Expo Dior, Musée d'Orsay" : "Cultural outings: Yves Saint Laurent Museum, Dior Haute Couture, Orsay"}
            </p>
            <p>
              • {isFr ? "Figuration Cinéma : Productions Disney+" : "Cinema: Background acting for Disney+ productions"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
