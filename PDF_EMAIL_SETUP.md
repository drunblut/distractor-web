# PDF & E-Mail Export Setup für Distractor App

## Überblick

Die Distractor App unterstützt jetzt das Exportieren von Testergebnissen als PDF und das Versenden per E-Mail. Dieses Feature verwendet:

- **jsPDF** für PDF-Generierung
- **html2canvas** für HTML-zu-Canvas-Konvertierung
- **EmailJS** für E-Mail-Versendung (ohne Backend)

## EmailJS Konfiguration

### 1. EmailJS Account erstellen

1. Gehen Sie zu [emailjs.com](https://www.emailjs.com/)
2. Registrieren Sie sich für einen kostenlosen Account
3. Nach der Anmeldung erhalten Sie Zugang zum Dashboard

### 2. E-Mail-Service einrichten

1. Im EmailJS Dashboard: **Email Services** → **Add New Service**
2. Wählen Sie Ihren E-Mail-Provider (Gmail, Outlook, etc.)
3. Folgen Sie den Anweisungen zur Verbindung Ihres E-Mail-Accounts
4. Notieren Sie sich die **Service ID**

### 3. E-Mail-Template erstellen

1. Gehen Sie zu **Email Templates** → **Create New Template**
2. Verwenden Sie folgendes Template:

```
Subject: {{subject}}

Hallo {{to_name}},

{{message}}

{{#participant_name}}
Teilnehmer: {{participant_name}}
{{/participant_name}}

{{#participant_id}}
Teilnehmer-ID: {{participant_id}}
{{/participant_id}}

Testdatum: {{test_date}}

Mit freundlichen Grüßen,
{{from_name}}
```

3. Fügen Sie PDF-Anhang hinzu:
   - Aktivieren Sie **Attachments**
   - Name: `Testergebnisse.pdf`
   - Variable: `{{pdf_attachment}}`

4. Speichern Sie das Template und notieren Sie die **Template ID**

### 4. Public Key erhalten

1. Gehen Sie zu **Account** → **General**
2. Kopieren Sie den **Public Key**

### 5. Konfiguration in der App

Öffnen Sie `src/utils/emailUtils.ts` und ersetzen Sie die Platzhalter:

```typescript
export const EMAILJS_CONFIG = {
  serviceId: 'IHR_SERVICE_ID',     // Ihre Service ID
  templateId: 'IHR_TEMPLATE_ID',   // Ihre Template ID
  publicKey: 'IHR_PUBLIC_KEY',     // Ihr Public Key
};
```

## Features

### PDF-Export
- Automatische PDF-Generierung aus den Testergebnissen
- Hochauflösende Darstellung (Scale 2x)
- Professionelles Layout mit Header/Footer
- Teilnehmerinformationen und Datum
- Direkter Download

### E-Mail-Versendung
- PDF als Anhang
- Anpassbare E-Mail-Nachricht
- Teilnehmerinformationen
- Automatische Template-Verarbeitung
- Fehlerverwaltung

### Sicherheit
- Keine sensiblen Daten im Frontend-Code
- EmailJS Public Key ist sicher für Browser-Nutzung
- Alle E-Mail-Verarbeitung läuft über EmailJS-Server

## Nutzung

### PDF Download
1. Auf der Ergebnisseite auf **"📄 PDF Download"** klicken
2. PDF wird automatisch erstellt und heruntergeladen
3. Dateiname: `distractor-ergebnisse-DATUM.pdf`

### E-Mail versenden
1. Auf **"📧 E-Mail senden"** klicken
2. E-Mail-Adresse eingeben (erforderlich)
3. Optional: Name, Teilnehmer-ID, zusätzliche Nachricht
4. **"E-Mail senden"** klicken
5. PDF wird erstellt und als Anhang versendet

## Troubleshooting

### E-Mail wird nicht versendet
- Überprüfen Sie die EmailJS-Konfiguration
- Testen Sie die Service-Verbindung im EmailJS Dashboard
- Prüfen Sie die Browser-Konsole auf Fehlermeldungen

### PDF-Erstellung fehlgeschlagen
- Browser-Berechtigungen für Downloads prüfen
- Bei großen Ergebnisseiten: längere Wartezeit
- Konsole auf JavaScript-Fehler überprüfen

### Template-Probleme
- Variablen-Namen exakt wie in der Konfiguration verwenden
- PDF-Anhang korrekt als base64 konfigurieren
- Template-Syntax von EmailJS beachten

## Kosten

EmailJS bietet:
- **Free Plan**: 200 E-Mails/Monat kostenlos
- **Personal Plan**: $15/Monat für 1000 E-Mails
- Weitere Pläne verfügbar

Für Produktionsumgebungen empfiehlt sich ein kostenpflichtiger Plan für höhere Zuverlässigkeit.

## Erweiterte Konfiguration

### Custom Branding
Die PDF-Generierung kann mit Logos und benutzerdefinierten Styles erweitert werden:

```typescript
const pdfOptions: PDFExportOptions = {
  includeCharts: true,
  includeDetailedStats: true,
  logoUrl: '/path/to/logo.png',    // Optional: Logo hinzufügen
  participantName: 'Max Mustermann',
  participantId: 'TN001',
  testDate: '05.02.2026'
};
```

### Error Handling
Beide Funktionen verfügen über umfassendes Error Handling mit benutzerfreundlichen Fehlermeldungen und Logging für Debugging.

### Performance
- PDF-Generierung optimiert für große Datenmengen
- Canvas-Rendering mit hoher Auflösung
- Asynchrone Verarbeitung ohne UI-Blockierung