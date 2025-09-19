import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft, Shield, Eye, Database, Cookie, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const privacyContent = {
  nl: {
    title: "Privacybeleid",
    lastUpdated: "Laatst bijgewerkt: 19 september 2025",
    intro: "Bij Spam Sweeper nemen we uw privacy serieus. Dit privacybeleid legt uit hoe we uw gegevens verzamelen, gebruiken en beschermen.",
    sections: [
      {
        title: "Welke gegevens verzamelen we",
        icon: Database,
        content: [
          "E-mailadres en basisprofielgegevens van uw e-mailprovider (Microsoft, Google, Yahoo)",
          "E-mailmetadata uit uw spam/junk map (afzender, onderwerp, ontvangstdatum)",
          "AI-analysresultaten en vertrouwensscores",
          "Uw feedback op AI-classificaties (duim omhoog/omlaag)",
          "Uitschrijflinks die in uw e-mails worden gevonden"
        ]
      },
      {
        title: "Hoe we uw gegevens gebruiken",
        icon: Eye,
        content: [
          "Identificeren van spam e-mails met lokale AI-technologie (Hugging Face BERT)",
          "Vinden van uitschrijflinks in ongewenste e-mails",
          "Verbeteren van onze lokale AI-modellen op basis van uw feedback",
          "Tonen van uw scangeschiedenis en statistieken",
          "Technische ondersteuning en probleemoplossing"
        ]
      },
      {
        title: "Gegevensbeveiliging",
        icon: Lock,
        content: [
          "Alle gegevens worden versleuteld opgeslagen in een beveiligde Neon PostgreSQL database",
          "AI-verwerking gebeurt volledig lokaal op onze servers zonder externe API calls",
          "We gebruiken OAuth 2.0 voor veilige authenticatie",
          "Toegangstokens worden veilig opgeslagen en regelmatig vernieuwd",
          "We delen uw gegevens nooit met derden voor marketing doeleinden",
          "Uw e-mailinhoud verlaat nooit onze beveiligde servers tijdens AI-analyse"
        ]
      },
      {
        title: "Cookies en tracking",
        icon: Cookie,
        content: [
          "We gebruiken alleen technisch noodzakelijke cookies voor authenticatie",
          "Uw taalvoorkeur wordt lokaal opgeslagen in uw browser",
          "We gebruiken geen tracking cookies of analytics van derden",
          "Alle sessiegegevens worden veilig beheerd"
        ]
      },
      {
        title: "Uw rechten",
        icon: Shield,
        content: [
          "U kunt op elk moment uw account verwijderen",
          "Bij accountverwijdering worden al uw gegevens permanent gewist",
          "U kunt uw scangeschiedenis bekijken en beheren",
          "U heeft volledige controle over welke e-mails worden geanalyseerd",
          "U kunt contact met ons opnemen voor vragen over uw gegevens"
        ]
      },
      {
        title: "E-mail toegang",
        icon: Mail,
        content: [
          "We hebben alleen toegang tot uw spam/junk map, niet uw hoofdinbox",
          "E-mailinhoud wordt lokaal verwerkt met BERT AI-model voor spam detectie",
          "Alle e-mail toegang gebeurt via officiële API's van providers",
          "Geen e-mailinhoud wordt verstuurd naar externe AI-services",
          "U kunt de toegang op elk moment intrekken via uw account instellingen",
          "We slaan geen volledige e-mails op, alleen metadata en analysresultaten"
        ]
      }
    ],
    contact: {
      title: "Contact",
      content: "Heeft u vragen over dit privacybeleid? Neem contact met ons op via de instellingen in uw dashboard of via onze ondersteuningskanalen."
    },
    backToHome: "Terug naar homepage"
  },
  de: {
    title: "Datenschutzrichtlinie",
    lastUpdated: "Zuletzt aktualisiert: 19. September 2025",
    intro: "Bei Spam Sweeper nehmen wir Ihre Privatsphäre ernst. Diese Datenschutzrichtlinie erklärt, wie wir Ihre Daten sammeln, verwenden und schützen.",
    sections: [
      {
        title: "Welche Daten sammeln wir",
        icon: Database,
        content: [
          "E-Mail-Adresse und grundlegende Profildaten von Ihrem E-Mail-Anbieter (Microsoft, Google, Yahoo)",
          "E-Mail-Metadaten aus Ihrem Spam/Junk-Ordner (Absender, Betreff, Empfangsdatum)",
          "KI-Analyseergebnisse und Vertrauenswerte",
          "Ihr Feedback zu KI-Klassifikationen (Daumen hoch/runter)",
          "Abmelde-Links, die in Ihren E-Mails gefunden werden"
        ]
      },
      {
        title: "Wie wir Ihre Daten verwenden",
        icon: Eye,
        content: [
          "Identifizierung von Spam-E-Mails mit lokaler KI-Technologie (Hugging Face BERT)",
          "Finden von Abmelde-Links in unerwünschten E-Mails",
          "Verbesserung unserer lokalen KI-Modelle basierend auf Ihrem Feedback",
          "Anzeige Ihrer Scan-Historie und Statistiken",
          "Technischer Support und Fehlerbehebung"
        ]
      },
      {
        title: "Datensicherheit",
        icon: Lock,
        content: [
          "Alle Daten werden verschlüsselt in einer sicheren Neon PostgreSQL-Datenbank gespeichert",
          "KI-Verarbeitung erfolgt vollständig lokal auf unseren Servern ohne externe API-Aufrufe",
          "Wir verwenden OAuth 2.0 für sichere Authentifizierung",
          "Zugangstoken werden sicher gespeichert und regelmäßig erneuert",
          "Wir teilen Ihre Daten niemals mit Dritten für Marketingzwecke",
          "Ihre E-Mail-Inhalte verlassen niemals unsere sicheren Server während der KI-Analyse"
        ]
      },
      {
        title: "Cookies und Tracking",
        icon: Cookie,
        content: [
          "Wir verwenden nur technisch notwendige Cookies für die Authentifizierung",
          "Ihre Spracheinstellung wird lokal in Ihrem Browser gespeichert",
          "Wir verwenden keine Tracking-Cookies oder Drittanbieter-Analytics",
          "Alle Sitzungsdaten werden sicher verwaltet"
        ]
      },
      {
        title: "Ihre Rechte",
        icon: Shield,
        content: [
          "Sie können jederzeit Ihr Konto löschen",
          "Bei Kontolöschung werden alle Ihre Daten dauerhaft gelöscht",
          "Sie können Ihre Scan-Historie einsehen und verwalten",
          "Sie haben vollständige Kontrolle darüber, welche E-Mails analysiert werden",
          "Sie können uns bei Fragen zu Ihren Daten kontaktieren"
        ]
      },
      {
        title: "E-Mail-Zugriff",
        icon: Mail,
        content: [
          "Wir haben nur Zugriff auf Ihren Spam/Junk-Ordner, nicht auf Ihr Hauptpostfach",
          "E-Mail-Inhalte werden lokal mit BERT KI-Modell für Spam-Erkennung verarbeitet",
          "Aller E-Mail-Zugriff erfolgt über offizielle APIs der Anbieter",
          "Keine E-Mail-Inhalte werden an externe KI-Services gesendet",
          "Sie können den Zugriff jederzeit über Ihre Kontoeinstellungen widerrufen",
          "Wir speichern keine vollständigen E-Mails, nur Metadaten und Analyseergebnisse"
        ]
      }
    ],
    contact: {
      title: "Kontakt",
      content: "Haben Sie Fragen zu dieser Datenschutzrichtlinie? Kontaktieren Sie uns über die Einstellungen in Ihrem Dashboard oder über unsere Support-Kanäle."
    },
    backToHome: "Zurück zur Startseite"
  },
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: September 19, 2025",
    intro: "At Spam Sweeper, we take your privacy seriously. This privacy policy explains how we collect, use, and protect your data.",
    sections: [
      {
        title: "What data we collect",
        icon: Database,
        content: [
          "Email address and basic profile data from your email provider (Microsoft, Google, Yahoo)",
          "Email metadata from your spam/junk folder (sender, subject, received date)",
          "AI analysis results and confidence scores",
          "Your feedback on AI classifications (thumbs up/down)",
          "Unsubscribe links found in your emails"
        ]
      },
      {
        title: "How we use your data",
        icon: Eye,
        content: [
          "Identify spam emails using local AI technology (Hugging Face BERT)",
          "Find unsubscribe links in unwanted emails",
          "Improve our local AI models based on your feedback",
          "Display your scan history and statistics",
          "Technical support and troubleshooting"
        ]
      },
      {
        title: "Data security",
        icon: Lock,
        content: [
          "All data is encrypted and stored in a secure Neon PostgreSQL database",
          "AI processing happens entirely locally on our servers without external API calls",
          "We use OAuth 2.0 for secure authentication",
          "Access tokens are securely stored and regularly refreshed",
          "We never share your data with third parties for marketing purposes",
          "Your email content never leaves our secure servers during AI analysis"
        ]
      },
      {
        title: "Cookies and tracking",
        icon: Cookie,
        content: [
          "We only use technically necessary cookies for authentication",
          "Your language preference is stored locally in your browser",
          "We don't use tracking cookies or third-party analytics",
          "All session data is securely managed"
        ]
      },
      {
        title: "Your rights",
        icon: Shield,
        content: [
          "You can delete your account at any time",
          "When you delete your account, all your data is permanently erased",
          "You can view and manage your scan history",
          "You have full control over which emails are analyzed",
          "You can contact us with questions about your data"
        ]
      },
      {
        title: "Email access",
        icon: Mail,
        content: [
          "We only access your spam/junk folder, not your main inbox",
          "Email content is processed locally with BERT AI model for spam detection",
          "All email access is through official provider APIs",
          "No email content is sent to external AI services",
          "You can revoke access at any time through your account settings",
          "We don't store full emails, only metadata and analysis results"
        ]
      }
    ],
    contact: {
      title: "Contact",
      content: "Have questions about this privacy policy? Contact us through the settings in your dashboard or via our support channels."
    },
    backToHome: "Back to homepage"
  },
  fr: {
    title: "Politique de confidentialité",
    lastUpdated: "Dernière mise à jour : 19 septembre 2025",
    intro: "Chez Spam Sweeper, nous prenons votre confidentialité au sérieux. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données.",
    sections: [
      {
        title: "Quelles données collectons-nous",
        icon: Database,
        content: [
          "Adresse e-mail et données de profil de base de votre fournisseur d'e-mail (Microsoft, Google, Yahoo)",
          "Métadonnées d'e-mail de votre dossier spam/indésirable (expéditeur, sujet, date de réception)",
          "Résultats d'analyse IA et scores de confiance",
          "Vos commentaires sur les classifications IA (pouce vers le haut/bas)",
          "Liens de désabonnement trouvés dans vos e-mails"
        ]
      },
      {
        title: "Comment nous utilisons vos données",
        icon: Eye,
        content: [
          "Identifier les e-mails spam avec la technologie IA locale (Hugging Face BERT)",
          "Trouver des liens de désabonnement dans les e-mails indésirables",
          "Améliorer nos modèles IA locaux basés sur vos commentaires",
          "Afficher votre historique de scan et statistiques",
          "Support technique et dépannage"
        ]
      },
      {
        title: "Sécurité des données",
        icon: Lock,
        content: [
          "Toutes les données sont cryptées et stockées dans une base de données Neon PostgreSQL sécurisée",
          "Le traitement IA se fait entièrement localement sur nos serveurs sans appels d'API externes",
          "Nous utilisons OAuth 2.0 pour l'authentification sécurisée",
          "Les jetons d'accès sont stockés en sécurité et régulièrement actualisés",
          "Nous ne partageons jamais vos données avec des tiers à des fins marketing",
          "Le contenu de vos e-mails ne quitte jamais nos serveurs sécurisés pendant l'analyse IA"
        ]
      },
      {
        title: "Cookies et suivi",
        icon: Cookie,
        content: [
          "Nous utilisons uniquement des cookies techniquement nécessaires pour l'authentification",
          "Votre préférence de langue est stockée localement dans votre navigateur",
          "Nous n'utilisons pas de cookies de suivi ou d'analytics tiers",
          "Toutes les données de session sont gérées en sécurité"
        ]
      },
      {
        title: "Vos droits",
        icon: Shield,
        content: [
          "Vous pouvez supprimer votre compte à tout moment",
          "Lorsque vous supprimez votre compte, toutes vos données sont effacées définitivement",
          "Vous pouvez consulter et gérer votre historique de scan",
          "Vous avez un contrôle total sur quels e-mails sont analysés",
          "Vous pouvez nous contacter pour des questions sur vos données"
        ]
      },
      {
        title: "Accès aux e-mails",
        icon: Mail,
        content: [
          "Nous n'accédons qu'à votre dossier spam/indésirable, pas à votre boîte de réception principale",
          "Le contenu des e-mails est traité localement avec le modèle IA BERT pour la détection de spam",
          "Tout accès aux e-mails se fait via les APIs officielles des fournisseurs",
          "Aucun contenu d'e-mail n'est envoyé vers des services IA externes",
          "Vous pouvez révoquer l'accès à tout moment via les paramètres de votre compte",
          "Nous ne stockons pas les e-mails complets, seulement les métadonnées et résultats d'analyse"
        ]
      }
    ],
    contact: {
      title: "Contact",
      content: "Avez-vous des questions sur cette politique de confidentialité ? Contactez-nous via les paramètres de votre tableau de bord ou via nos canaux de support."
    },
    backToHome: "Retour à l'accueil"
  }
};

export default function Privacy() {
  const { language } = useLanguage();
  const content = privacyContent[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {content.backToHome}
            </Button>
          </Link>
          
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
            {content.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-2">{content.lastUpdated}</p>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            {content.intro}
          </p>
        </div>

        <div className="space-y-6">
          {content.sections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <Card key={index} className="border-2 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}

          {/* Contact section */}
          <Card className="border-2 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                {content.contact.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300">{content.contact.content}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}