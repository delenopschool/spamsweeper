export type Language = 'nl' | 'de' | 'en' | 'fr';

export interface Translations {
  common: {
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    loading: string;
    error: string;
    success: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    noResults: string;
  };
  homepage: {
    title: string;
    subtitle: string;
    connectOutlook: string;
    connectGmail: string;
    connectYahoo: string;
    connecting: string;
    features: {
      smartReview: {
        title: string;
        description: string;
      };
      autoUnsubscribe: {
        title: string;
        description: string;
      };
      aiPowered: {
        title: string;
        description: string;
      };
    };
    howItWorks: {
      title: string;
      step1: {
        title: string;
        description: string;
      };
      step2: {
        title: string;
        description: string;
      };
      step3: {
        title: string;
        description: string;
      };
    };
    cta: {
      title: string;
      subtitle: string;
    };
    privacy: string;
    yahooWarning: string;
  };
  auth: {
    signIn: string;
    signOut: string;
    signInWith: string;
    connecting: string;
    connected: string;
    connectionFailed: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    signOut: string;
    quickActions: string;
    quickScan: string;
    fullScan: string;
    refreshResults: string;
    processUnsubscribes: string;
    aiProcessing: string;
    aiProcessingEmails: string;
    analyzingEmails: string;
    greatNews: string;
    noSpamDetected: string;
    welcome: string;
    welcomeMessage: string;
    startFirstScan: string;
    invalidUrl: string;
    userNotFound: string;
    loading: string;
    lastScan: string;
    totalScanned: string;
    detectedSpam: string;
    unsubscribeLinks: string;
    processed: string;
    startNewScan: string;
    noScansYet: string;
    selectFolders: string;
    scanEmails: string;
  };
  scanning: {
    scanningEmails: string;
    analyzingWith: string;
    foundSpam: string;
    foundUnsubscribe: string;
    scanComplete: string;
    scanFailed: string;
    progress: string;
    currentEmail: string;
    analyzing: string;
  };
  emails: {
    sender: string;
    subject: string;
    confidence: string;
    unsubscribe: string;
    preview: string;
    selectAll: string;
    deselectAll: string;
    processSelected: string;
    processing: string;
    markAsSpam: string;
    markAsNotSpam: string;
    showDetails: string;
    hideDetails: string;
  };
  unsubscribe: {
    processing: string;
    success: string;
    failed: string;
    partialSuccess: string;
    noEmailsSelected: string;
    confirmProcess: string;
    processEmails: string;
  };
  errors: {
    connectionFailed: string;
    scanFailed: string;
    loadFailed: string;
    processingFailed: string;
    unauthorized: string;
    notFound: string;
    serverError: string;
  };
}

export const translations: Record<Language, Translations> = {
  nl: {
    common: {
      cancel: 'Annuleren',
      confirm: 'Bevestigen',
      save: 'Opslaan',
      delete: 'Verwijderen',
      edit: 'Bewerken',
      loading: 'Laden...',
      error: 'Fout',
      success: 'Gelukt',
      close: 'Sluiten',
      back: 'Terug',
      next: 'Volgende',
      previous: 'Vorige',
      search: 'Zoeken',
      noResults: 'Geen resultaten gevonden',
    },
    homepage: {
      title: 'AI-Powered E-mail Spam Beheer',
      subtitle: 'Verbind je e-mailaccount en laat AI automatisch spam e-mails identificeren, uitschrijflinks vinden en je inbox opruimen met intelligente automatisering.',
      connectOutlook: 'Verbind Outlook',
      connectGmail: 'Verbind Gmail',
      connectYahoo: 'Verbind Yahoo',
      connecting: 'Verbinden...',
      features: {
        smartReview: {
          title: 'Slimme Beoordeling',
          description: 'AI scant automatisch je spam map en identificeert e-mails met hoge betrouwbaarheidsscores, waardoor het makkelijk wordt om je inbox te controleren en op te ruimen.'
        },
        autoUnsubscribe: {
          title: 'Automatisch Uitschrijven',
          description: 'Vindt en verwerkt automatisch uitschrijflinks van legitieme e-mails, waardoor je toekomstige spam vermindert zonder je e-mailbeveiliging in gevaar te brengen.'
        },
        aiPowered: {
          title: 'AI-Powered',
          description: 'Gebruikt geavanceerde taalmodellen om e-mailinhoud en context te begrijpen, en biedt intelligente spam detectie met gedetailleerde redenering voor elke beslissing.'
        }
      },
      howItWorks: {
        title: 'Hoe het werkt',
        step1: {
          title: 'Verbind Account',
          description: 'Log in met je e-mailprovider om veilige toegang tot je spam map te verlenen.'
        },
        step2: {
          title: 'AI Analyse',
          description: 'Onze AI scant je spam e-mails en vindt automatisch uitschrijflinks.'
        },
        step3: {
          title: 'Schone Inbox',
          description: 'Bekijk resultaten en verwerk uitschrijvingen om toekomstige spam te verminderen.'
        }
      },
      cta: {
        title: 'Klaar om je inbox op te ruimen?',
        subtitle: 'Begin in seconden met je bestaande e-mailaccount.'
      },
      privacy: 'Privacy',
      yahooWarning: 'Yahoo Mail API toegang vereist speciale goedkeuring van Yahoo.\n\nVoor volledige email toegang moet je een aanvraag indienen bij:\nhttps://senders.yahooinc.com/developer/developer-access/\n\nWil je toch doorgaan met basis profiel authenticatie?'
    },
    auth: {
      signIn: 'Inloggen',
      signOut: 'Uitloggen',
      signInWith: 'Inloggen met',
      connecting: 'Verbinden...',
      connected: 'Verbonden',
      connectionFailed: 'Verbinding mislukt',
    },
    dashboard: {
      title: 'E-mail Spam Beheer',
      subtitle: 'Bekijk AI-geclassificeerde spam e-mails en beheer je abonnementen automatisch',
      signOut: 'Uitloggen',
      quickActions: 'Snelle Acties',
      quickScan: 'Snelle Scan',
      fullScan: 'Volledige Scan',
      refreshResults: 'Resultaten Vernieuwen',
      processUnsubscribes: 'Afmeldingen Verwerken',
      aiProcessing: 'AI Verwerking...',
      aiProcessingEmails: 'AI Verwerkt E-mails...',
      analyzingEmails: 'Analyseert {count} e-mails voor spam patronen',
      greatNews: 'Geweldig Nieuws!',
      noSpamDetected: 'Geen spam e-mails gedetecteerd in je {count} gescande berichten. Je inbox is schoon!',
      welcome: 'Welkom bij Spam Sweeper!',
      welcomeMessage: 'Begin met het scannen van je spam map om ongewenste e-mails te detecteren en afmeldlinks te vinden.',
      startFirstScan: 'Start Je Eerste Scan',
      invalidUrl: 'Ongeldige URL',
      userNotFound: 'Gebruiker niet gevonden',
      loading: 'Laden...',
      lastScan: 'Laatste scan',
      totalScanned: 'Totaal gescand',
      detectedSpam: 'Spam gedetecteerd',
      unsubscribeLinks: 'Uitschrijflinks',
      processed: 'Verwerkt',
      startNewScan: 'Nieuwe scan starten',
      noScansYet: 'Nog geen scans uitgevoerd',
      selectFolders: 'Mappen selecteren',
      scanEmails: 'E-mails scannen',
    },
    scanning: {
      scanningEmails: 'E-mails scannen',
      analyzingWith: 'Analyseren met AI',
      foundSpam: 'Spam gevonden',
      foundUnsubscribe: 'Uitschrijflinks gevonden',
      scanComplete: 'Scan voltooid',
      scanFailed: 'Scan mislukt',
      progress: 'Voortgang',
      currentEmail: 'Huidige e-mail',
      analyzing: 'Analyseren',
    },
    emails: {
      sender: 'Afzender',
      subject: 'Onderwerp',
      confidence: 'Betrouwbaarheid',
      unsubscribe: 'Uitschrijven',
      preview: 'Voorbeeld',
      selectAll: 'Alles selecteren',
      deselectAll: 'Alles deselecteren',
      processSelected: 'Geselecteerde verwerken',
      processing: 'Verwerken...',
      markAsSpam: 'Markeren als spam',
      markAsNotSpam: 'Markeren als geen spam',
      showDetails: 'Details tonen',
      hideDetails: 'Details verbergen',
    },
    unsubscribe: {
      processing: 'Uitschrijven...',
      success: 'Succesvol uitgeschreven',
      failed: 'Uitschrijven mislukt',
      partialSuccess: 'Gedeeltelijk gelukt',
      noEmailsSelected: 'Geen e-mails geselecteerd',
      confirmProcess: 'Weet je zeker dat je wilt uitschrijven?',
      processEmails: 'E-mails verwerken',
    },
    errors: {
      connectionFailed: 'Verbinding mislukt',
      scanFailed: 'Scan mislukt',
      loadFailed: 'Laden mislukt',
      processingFailed: 'Verwerking mislukt',
      unauthorized: 'Niet geautoriseerd',
      notFound: 'Niet gevonden',
      serverError: 'Server fout',
    },
  },
  de: {
    common: {
      cancel: 'Abbrechen',
      confirm: 'Bestätigen',
      save: 'Speichern',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      loading: 'Laden...',
      error: 'Fehler',
      success: 'Erfolgreich',
      close: 'Schließen',
      back: 'Zurück',
      next: 'Weiter',
      previous: 'Vorherige',
      search: 'Suchen',
      noResults: 'Keine Ergebnisse gefunden',
    },
    homepage: {
      title: 'KI-gestütztes E-Mail-Spam-Management',
      subtitle: 'Verbinden Sie Ihr E-Mail-Konto und lassen Sie KI automatisch Spam-E-Mails identifizieren, Abmelde-Links finden und Ihren Posteingang mit intelligenter Automatisierung aufräumen.',
      connectOutlook: 'Outlook verbinden',
      connectGmail: 'Gmail verbinden',
      connectYahoo: 'Yahoo verbinden',
      connecting: 'Verbinden...',
      features: {
        smartReview: {
          title: 'Intelligente Überprüfung',
          description: 'KI scannt automatisch Ihren Spam-Ordner und identifiziert E-Mails mit hohen Vertrauenswerten, wodurch es einfach wird, Ihren Posteingang zu überprüfen und aufzuräumen.'
        },
        autoUnsubscribe: {
          title: 'Automatische Abmeldung',
          description: 'Findet und verarbeitet automatisch Abmelde-Links von legitimen E-Mails und hilft Ihnen, zukünftigen Spam zu reduzieren, ohne Ihre E-Mail-Sicherheit zu gefährden.'
        },
        aiPowered: {
          title: 'KI-gestützt',
          description: 'Verwendet fortschrittliche Sprachmodelle, um E-Mail-Inhalte und Kontext zu verstehen, und bietet intelligente Spam-Erkennung mit detaillierter Begründung für jede Entscheidung.'
        }
      },
      howItWorks: {
        title: 'Wie es funktioniert',
        step1: {
          title: 'Konto verbinden',
          description: 'Melden Sie sich bei Ihrem E-Mail-Anbieter an, um sicheren Zugriff auf Ihren Spam-Ordner zu gewähren.'
        },
        step2: {
          title: 'KI-Analyse',
          description: 'Unsere KI scannt Ihre Spam-E-Mails und findet automatisch Abmelde-Links.'
        },
        step3: {
          title: 'Sauberer Posteingang',
          description: 'Überprüfen Sie Ergebnisse und verarbeiten Sie Abmeldungen, um zukünftigen Spam zu reduzieren.'
        }
      },
      cta: {
        title: 'Bereit, Ihren Posteingang aufzuräumen?',
        subtitle: 'Beginnen Sie in Sekunden mit Ihrem bestehenden E-Mail-Konto.'
      },
      privacy: 'Datenschutz',
      yahooWarning: 'Yahoo Mail API-Zugriff erfordert eine spezielle Genehmigung von Yahoo.\n\nFür vollständigen E-Mail-Zugriff müssen Sie einen Antrag stellen bei:\nhttps://senders.yahooinc.com/developer/developer-access/\n\nMöchten Sie trotzdem mit der grundlegenden Profil-Authentifizierung fortfahren?'
    },
    auth: {
      signIn: 'Anmelden',
      signOut: 'Abmelden',
      signInWith: 'Anmelden mit',
      connecting: 'Verbinden...',
      connected: 'Verbunden',
      connectionFailed: 'Verbindung fehlgeschlagen',
    },
    dashboard: {
      title: 'E-Mail Spam-Verwaltung',
      subtitle: 'Überprüfen Sie KI-klassifizierte Spam-E-Mails und verwalten Sie Ihre Abonnements automatisch',
      signOut: 'Abmelden',
      quickActions: 'Schnelle Aktionen',
      quickScan: 'Schneller Scan',
      fullScan: 'Vollständiger Scan',
      refreshResults: 'Ergebnisse aktualisieren',
      processUnsubscribes: 'Abmeldungen verarbeiten',
      aiProcessing: 'KI-Verarbeitung...',
      aiProcessingEmails: 'KI verarbeitet E-Mails...',
      analyzingEmails: 'Analysiert {count} E-Mails auf Spam-Muster',
      greatNews: 'Großartige Neuigkeiten!',
      noSpamDetected: 'Keine Spam-E-Mails in Ihren {count} gescannten Nachrichten erkannt. Ihr Posteingang ist sauber!',
      welcome: 'Willkommen bei Spam Sweeper!',
      welcomeMessage: 'Beginnen Sie mit dem Scannen Ihres Spam-Ordners, um unerwünschte E-Mails zu erkennen und Abmelde-Links zu finden.',
      startFirstScan: 'Ihren ersten Scan starten',
      invalidUrl: 'Ungültige URL',
      userNotFound: 'Benutzer nicht gefunden',
      loading: 'Laden...',
      lastScan: 'Letzter Scan',
      totalScanned: 'Gesamt gescannt',
      detectedSpam: 'Spam erkannt',
      unsubscribeLinks: 'Abmelde-Links',
      processed: 'Verarbeitet',
      startNewScan: 'Neuen Scan starten',
      noScansYet: 'Noch keine Scans durchgeführt',
      selectFolders: 'Ordner auswählen',
      scanEmails: 'E-Mails scannen',
    },
    scanning: {
      scanningEmails: 'E-Mails scannen',
      analyzingWith: 'Analysieren mit KI',
      foundSpam: 'Spam gefunden',
      foundUnsubscribe: 'Abmelde-Links gefunden',
      scanComplete: 'Scan abgeschlossen',
      scanFailed: 'Scan fehlgeschlagen',
      progress: 'Fortschritt',
      currentEmail: 'Aktuelle E-Mail',
      analyzing: 'Analysieren',
    },
    emails: {
      sender: 'Absender',
      subject: 'Betreff',
      confidence: 'Vertrauen',
      unsubscribe: 'Abmelden',
      preview: 'Vorschau',
      selectAll: 'Alle auswählen',
      deselectAll: 'Alle abwählen',
      processSelected: 'Ausgewählte verarbeiten',
      processing: 'Verarbeiten...',
      markAsSpam: 'Als Spam markieren',
      markAsNotSpam: 'Als kein Spam markieren',
      showDetails: 'Details anzeigen',
      hideDetails: 'Details ausblenden',
    },
    unsubscribe: {
      processing: 'Abmelden...',
      success: 'Erfolgreich abgemeldet',
      failed: 'Abmeldung fehlgeschlagen',
      partialSuccess: 'Teilweise erfolgreich',
      noEmailsSelected: 'Keine E-Mails ausgewählt',
      confirmProcess: 'Sind Sie sicher, dass Sie sich abmelden möchten?',
      processEmails: 'E-Mails verarbeiten',
    },
    errors: {
      connectionFailed: 'Verbindung fehlgeschlagen',
      scanFailed: 'Scan fehlgeschlagen',
      loadFailed: 'Laden fehlgeschlagen',
      processingFailed: 'Verarbeitung fehlgeschlagen',
      unauthorized: 'Nicht autorisiert',
      notFound: 'Nicht gefunden',
      serverError: 'Server-Fehler',
    },
  },
  en: {
    common: {
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      search: 'Search',
      noResults: 'No results found',
    },
    homepage: {
      title: 'AI-Powered Email Spam Management',
      subtitle: 'Connect your email account and let AI automatically identify spam emails, find unsubscribe links, and clean up your inbox with intelligent automation.',
      connectOutlook: 'Connect Outlook',
      connectGmail: 'Connect Gmail',
      connectYahoo: 'Connect Yahoo',
      connecting: 'Connecting...',
      features: {
        smartReview: {
          title: 'Smart Review',
          description: 'AI automatically scans your spam folder and identifies emails with high confidence scores, making it easy to review and clean up your inbox.'
        },
        autoUnsubscribe: {
          title: 'Automatic Unsubscribe',
          description: 'Automatically finds and processes unsubscribe links from legitimate emails, helping you reduce future spam without compromising your email security.'
        },
        aiPowered: {
          title: 'AI Powered',
          description: 'Uses advanced language models to understand email content and context, providing intelligent spam detection with detailed reasoning for each decision.'
        }
      },
      howItWorks: {
        title: 'How it works',
        step1: {
          title: 'Connect Account',
          description: 'Sign in with your email provider to grant secure access to your spam folder.'
        },
        step2: {
          title: 'AI Analysis',
          description: 'Our AI scans your spam emails and finds unsubscribe links automatically.'
        },
        step3: {
          title: 'Clean Inbox',
          description: 'Review results and process unsubscribes to reduce future spam.'
        }
      },
      cta: {
        title: 'Ready to clean up your inbox?',
        subtitle: 'Get started in seconds with your existing email account.'
      },
      privacy: 'Privacy',
      yahooWarning: 'Yahoo Mail API access requires special approval from Yahoo.\n\nFor full email access, you need to submit a request at:\nhttps://senders.yahooinc.com/developer/developer-access/\n\nDo you want to continue with basic profile authentication?'
    },
    auth: {
      signIn: 'Sign In',
      signOut: 'Sign Out',
      signInWith: 'Sign in with',
      connecting: 'Connecting...',
      connected: 'Connected',
      connectionFailed: 'Connection failed',
    },
    dashboard: {
      title: 'Email Spam Management',
      subtitle: 'Review AI-classified spam emails and manage your subscriptions automatically',
      signOut: 'Sign Out',
      quickActions: 'Quick Actions',
      quickScan: 'Quick Scan',
      fullScan: 'Full Scan',
      refreshResults: 'Refresh Results',
      processUnsubscribes: 'Process Unsubscribes',
      aiProcessing: 'AI Processing...',
      aiProcessingEmails: 'AI Processing Emails...',
      analyzingEmails: 'Analyzing {count} emails for spam patterns',
      greatNews: 'Great News!',
      noSpamDetected: 'No spam emails detected in your {count} scanned messages. Your inbox is clean!',
      welcome: 'Welcome to Spam Sweeper!',
      welcomeMessage: 'Start by scanning your spam folder to detect unwanted emails and find unsubscribe links.',
      startFirstScan: 'Start Your First Scan',
      invalidUrl: 'Invalid URL',
      userNotFound: 'User not found',
      loading: 'Loading...',
      lastScan: 'Last scan',
      totalScanned: 'Total scanned',
      detectedSpam: 'Detected spam',
      unsubscribeLinks: 'Unsubscribe links',
      processed: 'Processed',
      startNewScan: 'Start new scan',
      noScansYet: 'No scans yet',
      selectFolders: 'Select folders',
      scanEmails: 'Scan emails',
    },
    scanning: {
      scanningEmails: 'Scanning emails',
      analyzingWith: 'Analyzing with AI',
      foundSpam: 'Found spam',
      foundUnsubscribe: 'Found unsubscribe links',
      scanComplete: 'Scan complete',
      scanFailed: 'Scan failed',
      progress: 'Progress',
      currentEmail: 'Current email',
      analyzing: 'Analyzing',
    },
    emails: {
      sender: 'Sender',
      subject: 'Subject',
      confidence: 'Confidence',
      unsubscribe: 'Unsubscribe',
      preview: 'Preview',
      selectAll: 'Select all',
      deselectAll: 'Deselect all',
      processSelected: 'Process selected',
      processing: 'Processing...',
      markAsSpam: 'Mark as spam',
      markAsNotSpam: 'Mark as not spam',
      showDetails: 'Show details',
      hideDetails: 'Hide details',
    },
    unsubscribe: {
      processing: 'Unsubscribing...',
      success: 'Successfully unsubscribed',
      failed: 'Unsubscribe failed',
      partialSuccess: 'Partially successful',
      noEmailsSelected: 'No emails selected',
      confirmProcess: 'Are you sure you want to unsubscribe?',
      processEmails: 'Process emails',
    },
    errors: {
      connectionFailed: 'Connection failed',
      scanFailed: 'Scan failed',
      loadFailed: 'Load failed',
      processingFailed: 'Processing failed',
      unauthorized: 'Unauthorized',
      notFound: 'Not found',
      serverError: 'Server error',
    },
  },
  fr: {
    common: {
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      close: 'Fermer',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      search: 'Rechercher',
      noResults: 'Aucun résultat trouvé',
    },
    homepage: {
      title: 'Gestion de Spam Email Alimentée par IA',
      subtitle: 'Connectez votre compte email et laissez l\'IA identifier automatiquement les emails spam, trouver les liens de désabonnement et nettoyer votre boîte de réception avec une automatisation intelligente.',
      connectOutlook: 'Connecter Outlook',
      connectGmail: 'Connecter Gmail',
      connectYahoo: 'Connecter Yahoo',
      connecting: 'Connexion...',
      features: {
        smartReview: {
          title: 'Révision Intelligente',
          description: 'L\'IA scanne automatiquement votre dossier spam et identifie les emails avec des scores de confiance élevés, facilitant la révision et le nettoyage de votre boîte de réception.'
        },
        autoUnsubscribe: {
          title: 'Désabonnement Automatique',
          description: 'Trouve et traite automatiquement les liens de désabonnement des emails légitimes, vous aidant à réduire le spam futur sans compromettre la sécurité de votre email.'
        },
        aiPowered: {
          title: 'Alimenté par IA',
          description: 'Utilise des modèles de langage avancés pour comprendre le contenu et le contexte des emails, fournissant une détection de spam intelligente avec un raisonnement détaillé pour chaque décision.'
        }
      },
      howItWorks: {
        title: 'Comment ça marche',
        step1: {
          title: 'Connecter le Compte',
          description: 'Connectez-vous avec votre fournisseur d\'email pour accorder un accès sécurisé à votre dossier spam.'
        },
        step2: {
          title: 'Analyse IA',
          description: 'Notre IA scanne vos emails spam et trouve automatiquement les liens de désabonnement.'
        },
        step3: {
          title: 'Boîte de Réception Propre',
          description: 'Examinez les résultats et traitez les désabonnements pour réduire le spam futur.'
        }
      },
      cta: {
        title: 'Prêt à nettoyer votre boîte de réception?',
        subtitle: 'Commencez en quelques secondes avec votre compte email existant.'
      },
      privacy: 'Confidentialité',
      yahooWarning: 'L\'accès à l\'API Yahoo Mail nécessite une approbation spéciale de Yahoo.\n\nPour un accès complet aux emails, vous devez soumettre une demande à:\nhttps://senders.yahooinc.com/developer/developer-access/\n\nVoulez-vous continuer avec l\'authentification de profil de base?'
    },
    auth: {
      signIn: 'Se connecter',
      signOut: 'Se déconnecter',
      signInWith: 'Se connecter avec',
      connecting: 'Connexion...',
      connected: 'Connecté',
      connectionFailed: 'Connexion échouée',
    },
    dashboard: {
      title: 'Gestion du Spam Email',
      subtitle: 'Examinez les emails spam classifiés par IA et gérez vos abonnements automatiquement',
      signOut: 'Se déconnecter',
      quickActions: 'Actions Rapides',
      quickScan: 'Scan Rapide',
      fullScan: 'Scan Complet',
      refreshResults: 'Actualiser les Résultats',
      processUnsubscribes: 'Traiter les Désabonnements',
      aiProcessing: 'Traitement IA...',
      aiProcessingEmails: 'IA Traite les Emails...',
      analyzingEmails: 'Analyse de {count} emails pour les modèles de spam',
      greatNews: 'Excellentes Nouvelles!',
      noSpamDetected: 'Aucun email spam détecté dans vos {count} messages scannés. Votre boîte de réception est propre!',
      welcome: 'Bienvenue sur Spam Sweeper!',
      welcomeMessage: 'Commencez par scanner votre dossier spam pour détecter les emails indésirables et trouver les liens de désabonnement.',
      startFirstScan: 'Démarrer Votre Premier Scan',
      invalidUrl: 'URL invalide',
      userNotFound: 'Utilisateur introuvable',
      loading: 'Chargement...',
      lastScan: 'Dernier scan',
      totalScanned: 'Total scanné',
      detectedSpam: 'Spam détecté',
      unsubscribeLinks: 'Liens de désabonnement',
      processed: 'Traité',
      startNewScan: 'Démarrer un nouveau scan',
      noScansYet: 'Aucun scan encore',
      selectFolders: 'Sélectionner les dossiers',
      scanEmails: 'Scanner les e-mails',
    },
    scanning: {
      scanningEmails: 'Scan des e-mails',
      analyzingWith: 'Analyse avec IA',
      foundSpam: 'Spam trouvé',
      foundUnsubscribe: 'Liens de désabonnement trouvés',
      scanComplete: 'Scan terminé',
      scanFailed: 'Scan échoué',
      progress: 'Progrès',
      currentEmail: 'E-mail actuel',
      analyzing: 'Analyse',
    },
    emails: {
      sender: 'Expéditeur',
      subject: 'Sujet',
      confidence: 'Confiance',
      unsubscribe: 'Se désabonner',
      preview: 'Aperçu',
      selectAll: 'Tout sélectionner',
      deselectAll: 'Tout désélectionner',
      processSelected: 'Traiter la sélection',
      processing: 'Traitement...',
      markAsSpam: 'Marquer comme spam',
      markAsNotSpam: 'Marquer comme non-spam',
      showDetails: 'Afficher les détails',
      hideDetails: 'Masquer les détails',
    },
    unsubscribe: {
      processing: 'Désabonnement...',
      success: 'Désabonnement réussi',
      failed: 'Désabonnement échoué',
      partialSuccess: 'Partiellement réussi',
      noEmailsSelected: 'Aucun e-mail sélectionné',
      confirmProcess: 'Êtes-vous sûr de vouloir vous désabonner?',
      processEmails: 'Traiter les e-mails',
    },
    errors: {
      connectionFailed: 'Connexion échouée',
      scanFailed: 'Scan échoué',
      loadFailed: 'Chargement échoué',
      processingFailed: 'Traitement échoué',
      unauthorized: 'Non autorisé',
      notFound: 'Introuvable',
      serverError: 'Erreur serveur',
    },
  },
};

export function getTranslation(language: Language): Translations {
  return translations[language] || translations.en;
}