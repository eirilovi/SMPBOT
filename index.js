import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import openai from './config/open-ai.js';
import cors from 'cors';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = 3000;

app.use(bodyParser.json()); // for parsing application/json
app.use(cors()); // Enable CORS for all origins
app.use(express.static("public")); // Serve static files

let chatHistory = [
  { 
    role: 'system', 
    content: `You are a friendly chatbot helper that answers questions with a smile😊. Write very short messages. Only communicate in "bokmål" Norwegian.`
  }
]; // Store the chat history

 async function checkSubscriptionFAQs(userInput) {
  const subscribeRegex = /abonnent|abonement|abonner/i;
  const schibstedRegex = /Schibsted|schibsteds?/i;
  const myPageRegex = /min\s+side|minside/i;
  const acceptTermsRegex = /vilkår|vilkårene/i;
  const passwordEmailErrorRegex = /passord|e\-post|passordfeil|e-postadresse/i;
  const findSubscriptionRegex = /finne.*abonnementet|abonnement\s+finnes/i;
  const changeEmailRegex = /e\-postadresse|endre.*e-post|e-post.*endring/i;
  const readingIssueRegex = /eAvis|plussartikler|elektronisk\s+avis|e-avis/i;
  const findCustomerNumberRegex = /kundenummer|kundenr|kunde\s+nummer/i;
  const needSchibstedAccountRegex = /Schibsted\-konto|eAvis|schibsted\s+konto/i;
  const readEpaperRegex = /eAvisen|elektroniske\s+avisen/i;
  const downloadIssueRegex = /nedlasting|laste\s+ned|nedlastingsproblemer/i;
  const epaperAvailabilityRegex = /eAvis\s+tilgjengelig|når\s+er\s+eAvisen\s+klar/i;
  const findOldArticleRegex = /tidligere\s+artikkel|gamle\s+utgaver|historiske\s+artikler/i;
  const stopPaperSubscriptionRegex = /stoppe\s+papiravis|papiravis\s+stopp/i;
  const refundWhenStoppedRegex = /refunder.*papiravis|papiravis.*tilbakebetaling/i;
  const deliveryProviderRegex = /leverer\s+avis|avislevering|avis\s+leveranse|avis levert/i;
  const deliveryTimeRegex = /leveres\s+avis|avis\s+leveringstid|når\s+mottas\s+avis/i;
  const notReceivedPaperRegex = /fått\s+papiravis|papiravisen\s+mangler|mottok\s+ikke\s+papiravis/i;
  const paperMissedRegex = /uteblitt\s+avis|avis\s+ikke\s+kommet|avis\s+manglet/i;
  const subscriptionTypesRegex = /abonnementstyper|typer\s+abonnement|abonnementsformer/i;
  const whatsIncludedRegex = /inkludert\s+i\s+abonnement|abonnementet\s+inkluderer/i;
  const shareSubscriptionRegex = /dele\s+abonnement|abonnement\s+deling/i;
  const manageSubscriptionRegex = /administrere\s+abonnement|styre\s+abonnement/i;
  const paperOnlySubscriptionRegex = /papiravisen\s+uten|bare\s *papiravis|papiravis\s+alene/i;
  const digitalAccessPaperRegex = /digital\s+tilgang|tilgang\s+digitalt|e-tilgang/i;
  const singleArticlePurchaseRegex = /enkelt\s+artikkel|pluss\s+artikler|kjøpe\s+artikler/i;
  const receiptQuestionRegex = /kvittering|bekreftelse\s+på\s+kjøp/i;
  const incorrectChargeRegex = /feil\s+beløp|feilaktig\s+belastning|feil\s+belastet/i;
  const avoidInvoiceFeeRegex = /fakturagebyr|unngå\s+gebyr|gebyrfri\s+faktura/i;
  const setUpEInvoiceRegex = /eFaktura|elektronisk\s+faktura|oppsett\s+av\s+eFaktura/i;
  const paymentReminderRegex = /betalingspåminnelse|påminnelse\s+betaling|betaling\s+ikke\s+mottatt/i;
  const digitalPurchaseReturnRegex = /angrerett.*digital|digitale\s+retur|digital\s+angrefrist/i;
  const cancellationInvoiceRegex = /sagt\s+opp.*restgiro|oppsigelse\s+faktura/i;
  const changeBillingPeriodRegex = /fakturaperiode|endre\s+betalingstid|betalingstidsperiode/i;
  const newPaymentCardRegex = /betalingskort|nytt\s+kort|kort\s+oppdatering/i;
  const promotionalPriceEndRegex = /reduksjon.*pris|pris\s+endring\s+etter\s+tilbud|tilbudsperiode\s+slutt/i;
  const polarisMediaPaymentRegex = /Polaris\s+Media|betaling\s+Polaris|Polaris\s+innbetaling/i;

  if (subscribeRegex.test(userInput)) {
    return 'Om du ønsker å bli abonnent, følg denne lenken: <a href="https://www.smp.no/dakapo/productpage/SPO/?source=topheader_A" target="_blank">Trykk her</a>';
  } else if (schibstedRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Hva er en Schibsted-konto (tidligere SPiD)?</strong> <br><br> Vi benytter Schibsted-konto for å identifisere deg som kunde, mer informasjon om Schibsted finner du <a href="https://info.privacy.schibsted.com/no/hva-er-en-schibsted-konto/" target="_blank">her</a>';
  } else if (myPageRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Hva er Min Side?</strong> <br><br> På Min side kan du administrere ditt abonnement. Her kan du administrere alt fra omadressering til familedeling. For å kunne benytte deg av min side, må du være innlogget med din Schibsted-bruker.';
  } else if (acceptTermsRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Hvorfor må jeg godkjenne vilkår for å bruke Min Side?</strong> <br><br> Når du logger på for første gang, må du godkjenne våre og Schibsted sine brukervilkår og personvernerklæringer.';
  } else if (passwordEmailErrorRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Ved innlogging får jeg feil på e-postadresse eller passord, hva skal jeg gjøre?</strong> <br><br> Dette betyr at passordet ditt er feil. Trykk "Glemt passord?" der du logger inn, og følg instruksene for å lage et nytt passord.';
  } else if (findSubscriptionRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Hvorfor finner dere ikke abonnementet mitt?</strong> <br><br> Det kan være at du er logget inn med en annen e-postadresse enn den vi har registrert på abonnementet. Logg ut, og logg deretter inn med riktig e-postadresse.';
  }   else if (changeEmailRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Jeg har byttet epostadresse, hva gjør jeg for å få digital tilgang med denne?</strong> <br><br> For å bytte e-postadresse på Schibsted-kontoen din må du endre selve <a href="https://payment.schibsted.no/account/summary?redirect_uri=https://www.smp.no">Schibsted-brukeren.</a>';
  } else if (readingIssueRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Jeg er innlogget, men får likevel ikke lest eAvis eller plussartikler på nettavisen. Hva kan jeg gjøre?</strong> <br><br> Det kan være at du er logget inn med en annen e-postadresse enn den vi har registrert på abonnementet. Logg ut, og logg deretter inn med riktig e-postadresse.';
  } else if (findCustomerNumberRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Jeg husker ikke kundenummeret mitt. Hvor finner jeg det?</strong> <br><br> Kundennummeret ditt står på fakturaen du får tilsendt fra oss, denne finner du bl.a. på Min Side.';
  } else if (needSchibstedAccountRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Trenger jeg Schibsted-konto for å lese eAvis?</strong> <br><br> Ja, for å lese eAvisa og plussartiklene på nettavisen må du ha en Schibsted-konto, samt et abonnement.';
  } else if (readEpaperRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Hvor kan jeg lese eAvisen?</strong> <br><br> eAvisen kan leses på PC og Mac, samt alle smarttelefoner og nettbrett som har iOS (iPhone og iPad) og Android. For smarttelefoner og nettbrett: Last ned vår eAvis-app kostnadsfritt fra App Store eller Google Play, eAvisen fungerer på alle enheter som kjører iOS (iPhone og iPad) eller Android.';
  } else if (downloadIssueRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Nedlastingen av eAvisen stopper opp, hva gjør jeg?</strong> <br><br> Dersom du opplever at nedlastingen av en utgave stanser opp, kan det skyldes flere årsaker: <br> 1. Du har ikke mer tilgjengelig lagringsplass for aviser på din enhet. Appen har en viss mengde tilegnet plass til lagring av aviser, og kan ikke bruke mer enn dette. Nederst i applikasjonen er det en knapp som heter "Lagrede aviser ". Når du klikker på denne ser du de avisene som ligger lagret på din enhet, og de som det er påbegynt nedlasting av. Dersom du holder fingeren over en av disse utgavene får du valg om å slette utgaven. Prøv å slette et par gamle utgaver og start nedlastingen av dagens utgave på nytt. <br> 2. Du kan også se status på nedlasting av dagens utgave på denne siden. Har den stoppet opp, klikk raskt på utgaven, så får du valget pause nedlasting. Velg dette, og trykk deretter på utgaven og start nedlasting igjen. <br> 3. Din internettforbindelse er dårlig der hvor du befinner deg, og det tar lang tid å laste ned utgaven, eller du mister tilkoblingen til serveren midt i nedlastingen. Prøv å pause nedlastingen og starte den på nytt.';
  } else if (epaperAvailabilityRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Når blir eAvisen tilgjengelig?</strong> <br><br> eAvisen er tilgjengelig senest kl 22:00 på alle plattformer.';
  } else if (findOldArticleRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Jeg leter etter en tidligere artikkel, hvor finner jeg denne?</strong> <br><br> Avisene tilbake til 2003 er tilgjengelig via digitalt abonnement. Gamle enkeltutgaver kan også kjøpes <a href="https://www.buyandread.com/">her.</a>. I tillegg kan eldre aviser leses digitalt på de fleste bibliotek. Man kan også lese tidligere aviser på Nasjonalbiblioteket sin <a href="https://www.nb.no/search?mediatype=aviser">nettside.</a>.';
  } else if (stopPaperSubscriptionRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Jeg reiser bort og ønsker å stoppe papiravisen min. Hvordan gjør jeg dette?</strong> <br><br> Papiravisen stoppes enkelt på <a href="https://minside.smp.no/endre-avislevering">MinSide.</a> Du vil fortsatt ha tilgang til å lese eAvisen og plussartiklene på nettavisen.';
  } else if (refundWhenStoppedRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Får jeg refundert penger hvis jeg stopper papiravisen for en periode?</strong> <br><br> Nei. Selv om du stanser levering av papiravisen, har du fortsatt tilgang til eAvisen og nettavis. Du har derfor fortsatt tilgang til innholdet du har betalt for.';
  } else if (deliveryProviderRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Hvem leverer avisen?</strong> <br><br> Vår avis får du på hverdager levert med Polaris Distribusjon eller Posten... (include the rest of the delivery details as provided in the response)';
  } else if (deliveryTimeRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Når skal avisen min bli levert?</strong> <br><br> Det varierer med leveringsmåte. Posten har leveransefrist kl. 17.00 på hverdager... (include the full details regarding delivery times as provided in the response)';
  } else if (notReceivedPaperRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Jeg er abonnent og har ikke fått papiravisen min. Kan jeg få den etterlevert eller godskrevet?</strong> <br><br> Vi har dessverre ikke mulighet til å etterlevere avisen. Som abonnent har du alltid tilgang til <a href="https://minside.smp.no/publication.epaperpage">Eavisen.</a> Eventuell godskriving skjer i henhold til <a href="https://minside.smp.no/vilkaar">gjeldende abonnementsvilkår</a>.';
  } else if (paperMissedRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Avisen har uteblitt. Hva gjør jeg?</strong> <br><br> Tilbakemelding på dagens avislevering kan gjøres <a href="https://minside.smp.no/tilbakemelding">her.</a>';
  } else if (subscriptionTypesRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Hvilke abonnementstyper har dere?</strong> <br><br> Oversikt over alle abonnementstyper og priser finner du <a href="https://www.smp.no/dakapo/productpage/SPO">her.</a>';
  } else if (whatsIncludedRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Hva er inkludert i abonnementet?</strong> <br><br> Alle abonnenter får følgende inkludert i sitt abonnement: [list included items]';
  } else if (shareSubscriptionRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Hvordan deler jeg abonnementet med flere i familien?</strong> <br><br> Du kan dele abonnementet med inntil tre personer i familien (gjelder ikke bedriftsabonnement eller UNG-abonnement). Du kan velge hvem du gir tilgang til på <a href="https://minside.smp.no/familiedeling">Min Side.</a>.';
  } else if (manageSubscriptionRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Hvordan administrerer jeg abonnementet mitt?</strong> <br><br> Dette gjør du enkelt via <a href="https://minside.smp.no/">Min Side.</a>.';
  } else if (paperOnlySubscriptionRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Kan jeg bare få papiravisen uten å kjøpe digital tilgang?</strong> <br><br> Nei, digital tilgang er inkludert i alle våre abonnement.';
  } else if (digitalAccessPaperRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Jeg abonnerer på papiravisen. Hva må jeg gjøre for å få digital tilgang?</strong> <br><br> Alle som abonnerer på papiravisen får automatisk tilgang til alt som publiseres på nett og mobil. Det eneste man må gjøre er å <a href="https://minside.smp.no/"> opprette en Schibsted-konto, eller logge inn</a> hvis du har Schibsted-konto fra før.';
  } else if (singleArticlePurchaseRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Er det mulig å kjøpe/få tilsendt en enkelt artikkel (pluss)?</strong> <br><br> Nei, det er ikke mulig å kjøpe tilgang til/få tilsendt enkelt artikler.';
  } else if (receiptQuestionRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Får jeg kvittering på kjøpet mitt med kort?</strong> <br><br> Kvitteringer for ditt kjøp finner du <a href="https://payment.schibsted.no/account/purchasehistory/?redirect_uri=https://www.smp.no">her.</a>';
  } else if (incorrectChargeRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>De har trukket feil beløp fra mitt kort ved bestilling av abonnement</strong> <br><br> Dersom dette skyldes feil fra vår side vil vi selvsagt rydde opp i situasjonen. Ta kontakt med vårt kundesenter: abonnement@smp.no, så hjelper vi deg.';
  } else if (avoidInvoiceFeeRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Hvordan unngår jeg å betale fakturagebyr?</strong> <br><br> For å unngå fakturagebyr, anbefaler vi deg å opprette e-faktura eller avtalegiro i din nettbank. Alternativt kan kundeservice bistå med å få endret til e-postfaktura. Ved bestilling på nett kan du registrere ditt betalingskort og dette vil automatisk bli belastet, det påløper da ingen gebyrer.';
  } else if (setUpEInvoiceRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Hvordan kan jeg opprette eFaktura?</strong> <br><br> Avtalen må opprettes i mobilbank eller nettbank. Når du betaler en regning i nettbanken din, vil du få spørsmål om du vil inngå avtale om eFaktura fra betalingsmottakere som tilbyr dette. Du kan enkelt takke ja til dette og opprette avtale. Fra 15. mai 2022 må du som eFakturakunde gi en generell aksept for eFaktura for å fortsette å være eFaktura-bruker. Dette omtales som "Ja takk til alle" eller Alltid eFaktura, avhengig av hvilken bank eller betalingsapp du har. For å fortsatt kunne motta regninger og faktura som eFaktura, er det viktig at du aksepterer "Ja takk til alle" i din nettbank eller betalingsapp. Dersom aksepten ikke gjennomføres før fristen, vil du ikke lenger motta eFaktura etter 15. mai 2022. Merk at allerede fra 1. desember 2021 må du gi generell aksept for eFaktura «Ja takk til alle» for å kunne motta regninger fra bedrifter som du tidligere ikke har mottatt eFaktura fra. Vi oppfordrer derfor alle som ønsker å benytte eFaktura om å inngå «Ja takk til alle»-avtale snarest mulig.';
  } else if (paymentReminderRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Hvorfor har jeg fått betalingspåminnelse etter at jeg allerede har betalt fakturaen?</strong> <br><br> Din innbetaling og vår betalingspåminnelse kan ha krysset hverandre. Send oss en kvittering av innbetalingen så vi får sjekket at alt er i orden her: abonnement@smp.no</a>';
  } else if (digitalPurchaseReturnRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Hvordan bruker jeg angreretten på mitt digitale kjøp?</strong> <br><br> I henhold til angrerettloven går angreretten tapt ved kjøp av digitale tjenester i det man med samtykke tar i bruk tjenesten. Du kan avslutte abonnementet <a href="https://minside.smp.no/avslutt">her.</a>';
  } else if (cancellationInvoiceRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Jeg har sagt opp abonnementet mitt, men fått en restgiro. Hvorfor?</strong> <br><br> Dersom abonnementet ble sagt opp etter forfall, så vil du få en faktura for perioden mellom forfall og avslutning av abonnement.';
  } else if (changeBillingPeriodRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Hvordan kan jeg endre lengden på perioden jeg betaler for?</strong> <br><br> Du kan endre fakturaperioden ved å ta kontakt med kundeservice. Alternative vi har er 1-, 3-, og 12-månedsfaktura.';
  } else if (newPaymentCardRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a>   <br> <strong>Jeg har fått nytt betalingskort, hvordan får jeg betalt abonnementet?</strong> <br><br> Betalingsmåte kan endres <a href="https://minside.smp.no/oppdaterkort">her.</a>';
  } else if (promotionalPriceEndRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Jeg har bestilt et abonnement til redusert pris, men ville kun ha abonnement i gitt periode. Hva nå?</strong> <br><br> Alle våre abonnement er løpende til det blir sagt opp. Dersom man bestiller et abonnement til redusert pris og abonnementet ikke blir sagt opp, vil abonnementet løpe videre til ordinær pris.';
  } else if (polarisMediaPaymentRegex.test(userInput)) {
    return 'Fra <a href="https://minside.smp.no/kundeservice" target="_blank">kundeservice:</a> <br> <strong>Hvorfor står det Polaris Media som mottaker av innbetalingen min?</strong> <br><br> Vi er en del av Polaris Media konsernet. Det betyr din innbetaling vil gå til Polaris Media, da det er de som fakturerer våre abonnement.';
  }
  
  
  return ""; // Return an empty string if no FAQ matches
}
const insertKeywordsToChatHistory = () => {
  const keywords = [
    'abonnent', 'Schibsted', 'min side', 'vilkår', 'passord', 'e-post', 'finner abonnementet',
    'e-postadresse', 'eAvis', 'plussartikler', 'kundenummer', 'eAvisen', 'nedlasting',
    'eAvis tilgjengelig', 'tidligere artikkel', 'gamle utgaver', 'stoppe papiravis',
    'refunder papiravis', 'leverer avis', 'levert avis', 'fått papiravis', 'uteblitt avis',
    'abonnementstyper', 'inkludert i abonnement', 'dele abonnement', 'administrere abonnement',
    'papiravisen uten', 'digital tilgang', 'enkel artikkel', 'pluss', 'kvittering',
    'feil beløp', 'fakturagebyr', 'eFaktura', 'betalingspåminnelse', 'angrerett digital',
    'sagt opp restgiro', 'fakturaperiode', 'betalingskort', 'reduksjon pris', 'Polaris Media'
  ];

  // Push a system message with keywords
  chatHistory.push({
    role: 'system',
    content: `recognized keywords: ${keywords.join(', ')}`
  });
};



app.get('/relevantArticles', async (req, res) => {
  try {
    // Fetch the top 20 most recent articles
    const { data: recentArticles, error: recentError } = await supabase
        .from('Articles')
        .select('*')
        .order('publication_date', { ascending: false })
        .limit(20);

    if (recentError) {
        console.error('Error fetching Articles:', recentError);
        return res.status(500).send('Error fetching Articles');
    }

    // Filter to the top 5 based on importance
    if (recentArticles && recentArticles.length > 0) {
        const topArticles = recentArticles
            .sort((a, b) => b.viktighetsgrad - a.viktighetsgrad) // Sort by 'viktighetsgrad' descending
            .slice(0, 3); // Take the top 3

        // Return articles as JSON
        res.json({
            message: "Dette er de siste og mest relevante artiklene for i dag: 😊",
            articles: topArticles
        });
    } else {
        res.status(404).send("Det er for tiden ingen relevante artikler å vise.");
    }
  } catch (error) {
    console.error('Error fetching relevant Articles:', error);
    res.status(500).send("Det oppsto en feil under henting av artikler.");
  }
});

// Endpoint to get Articles specifically tagged with "Ungdom"
app.get('/articlesUngdom', async (req, res) => {
  const tag = 'Ungdom'; // Hardcoded tag value
  const { data, error } = await supabase
    .from('Articles')
    .select('*')
    .ilike('tags', `%${tag}%`);

  if (error) {
    console.error('Error fetching Articles tagged with Ungdom:', error);
    return res.status(500).send('Error fetching Articles');
  }

  if (data.length === 0) {
    return res.status(404).send('No articles found with the tag Ungdom');
  }

  res.json(data);
});


app.get('/categories', async (req, res) => {
  const { data, error } = await supabase
    .from('Articles') // Matches the table name in Supabase
    .select('category'); // Matches the column name in Supabase

  if (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).send('Error fetching categories');
  }

  // Log raw data for debugging
  console.log('Raw data:', data);

  // Extract and filter unique categories
  const categories = Array.from(new Set(data.map(item => item.category))).filter(Boolean);

  // Log categories for debugging
  console.log('Categories:', categories);

  res.json(categories);
});

// Endpoint to get an Article by ID from Supabase
app.get('/Articles/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('Articles')
    .select('title, author, content, category')
    .eq('id', id)
    .single(); // assuming 'id' is a unique column and you're expecting only one result

  if (error) {
    console.error('Error fetching Article:', error);
    return res.status(500).send('Error fetching Article');
  }

  if (data) {
    // Update chat history with article's title, author, and content
    chatHistory.push({ 
      role: 'system', 
      content: `Article Title: ${data.title}` 
    });
    chatHistory.push({ 
      role: 'system', 
      content: `Article Author: ${data.author}`
    });
    chatHistory.push({ 
      role: 'system', 
      content: `Article Content: ${data.content.substring(0, 300)}...` // Limit the content size
    });

    res.json(data);
  } else {
    res.status(404).send('Article not found');
  }
});



// Endpoint to get Articles by category from Supabase
app.get('/Articles/:category', async (req, res) => {
  const { category } = req.params;
  const { data, error } = await supabase
    .from('Articles')
    .select('*')
    .eq('category', category);

  if (error) {
    console.error(error);
    return res.status(500).send('Error fetching Articles');
  }

  res.json(data);
});

app.get('/Articles/:category/latest', async (req, res) => {
  const { category } = req.params;
  const { data, error } = await supabase
    .from('Articles')
    .select('*')
    .eq('category', category)
    .order('publication_date', { ascending: false })
    .limit(3);

  if (error) {
    console.error(error);
    return res.status(500).send('Error fetching latest Articles');
  }

  const articlesAsJson = data.map(article => {
    return { title: article.title, url: article.url, author: article.author, content: article.content};
  });

  res.json(articlesAsJson);
});


app.get('/Articles/:category/important', async (req, res) => {
  const { category } = req.params;
  const { data, error } = await supabase
    .from('Articles')
    .select('*')
    .eq('category', category)
    .order('viktighetsgrad', { ascending: false })
    .limit(3);

  if (error) {
    console.error('Error fetching important Articles:', error);
    return res.status(500).send('Error fetching important Articles');
  }

  const articlesAsJson = data.map(article => {
    return { title: article.title, url: article.url, author: article.author, content: article.content};
  });

  res.json(articlesAsJson);
});


app.get('/Articles/:category/random', async (req, res) => {
  const { category } = req.params;
  try {
    const { data, error } = await supabase
      .rpc('random_article', { cat: category })
      .limit(1); // Assuming the RPC returns a single random article, adjust if it's different.

    if (error) {
      throw error;
    }

    const articlesAsJson = data.map(article => {
      return { title: article.title, url: article.url, author: article.author, content: article.content};
    });

    res.json(articlesAsJson);
  } catch (error) {
    console.error('Error fetching random Article:', error);
    res.status(500).send('Error fetching random Article');
  }
});

const extractKeywords = (userInput) => {
  // Define a list of key phrases or words to look for
  const keyPhrases = ['artificial intelligence', 'machine learning', 'climate change', 'flowers']; // Add more as needed
  let keywords = [];

  // Convert to lowercase for case-insensitive matching
  const inputLower = userInput.toLowerCase();

  // Check if user input includes any key phrases
  keyPhrases.forEach(phrase => {
    if (inputLower.includes(phrase)) {
      keywords.push(phrase);
    }
  });

  return keywords;
};

const searchArticlesInDatabase = async (keywords) => {
  let ArticlesFound = [];

  // Assuming each keyword represents a separate search criterion
  for (let keyword of keywords) {
    let { data: Articles, error } = await supabase
      .from('Articles')
      .select('id, title, author, content, category, publication_date, url, tags')
      .ilike('tags', `%${keyword}%`); // Adjust as needed for your schema

    if (error) {
      console.error('Error searching Articles by keywords:', error);
      continue; // Proceed to the next keyword on error
    }

    // Append found Articles, avoiding duplicates
    Articles.forEach(Article => {
      if (!ArticlesFound.find(a => a.id === Article.id)) {
        ArticlesFound.push(Article);
      }
    });
  }

  console.log(ArticlesFound.length > 0 ? `${ArticlesFound.length} Articles found.` : 'No Articles found based on keywords.');
  return ArticlesFound;
};

app.post('/ask', async (req, res) => {
  const userInput = req.body.message;
  chatHistory.push({ role: 'user', content: userInput }); // Log user input to chat history

  let response = [];

  // First, check if the user is asking for something that can be answered by FAQs
  let faqResponse = await checkSubscriptionFAQs(userInput);
  if (faqResponse) {
      // FAQ response found, append it to the response array and update chat history
      response.push({ type: 'text', content: faqResponse });
      chatHistory.push({ role: 'system', content: faqResponse });
  } else {
      // Check for tags in the message
      const tags = await findTagsInMessage(userInput);
      if (tags.length > 0) {
          // Fetch articles for each found tag and prepare response
          const articles = [];
          for (let tag of tags) {
              const taggedArticles = await fetchArticlesByTag(tag);
              articles.push(...taggedArticles.map(article => ({
                  type: 'article',
                  title: article.title,
                  content: article.content,
                  url: article.url,
                  author: article.author
              })));
          }

          if (articles.length > 0) {
              response.push({
                  type: 'confirm',
                  content: "Jeg fant noen artikler med tags som matcher meldingen din. Ønsker du at jeg foreslår dem?😊",
                  articles: articles
              });
          }
      }

      // If no tags found or no specific content matched, proceed with keyword extraction and article search or OpenAI response
      if (response.length === 0) {
          // Extract keywords from the user input
          const keywords = extractKeywords(userInput);
          if (keywords.length > 0) {
              const articles = await searchArticlesInDatabase(keywords);
              if (articles.length > 0) {
                  // Articles found, prepare article type response
                  articles.forEach(article => {
                      response.push({
                          type: 'article',
                          title: article.title,
                          content: article.content,
                          url: article.url,
                          author: article.author
                      });
                      chatHistory.push({ role: 'system', content: article.title }); // Log article titles to chat history
                  });
              }
          }

          // If no articles or keywords were relevant, fallback to OpenAI's GPT model
          if (response.length === 0) {
              await askOpenAIForResponse(userInput);
          }
      }
  }

  // Send the response array back
  res.json({ response });


async function askOpenAIForResponse(userInput) {
  try {
    const openAIResponse = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: chatHistory,
      max_tokens: 300,
    });
    let responseText = openAIResponse.data.choices[0].message.content.trim();
    // Prepare OpenAI's response to send back
    response.push({ type: 'text', content: responseText });
    chatHistory.push({ role: 'system', content: responseText });
  } catch (error) {
    console.error("Error with OpenAI:", error);
    let errorMessage = "Sorry, I encountered an error processing your request.";
    response.push({ type: 'text', content: errorMessage });
    chatHistory.push({ role: 'system', content: errorMessage });
  }
}});

async function findTagsInMessage(userInput) {
  const allTags = await getAllTags(); // Fetch all tags from your database
  const inputLower = userInput.toLowerCase();
  const foundTags = allTags.filter(tag => inputLower.includes(tag));
  return foundTags;
}

async function getAllTags() {
  let { data: tags, error } = await supabase
      .from('Articles')
      .select('tags');
  if (error) {
      console.error('Error fetching tags:', error);
      return [];
  }
  const allTags = new Set();
  tags.forEach(article => {
      article.tags.split(',').forEach(tag => allTags.add(tag.trim().toLowerCase()));
  });
  return Array.from(allTags);
}

// Endpoint to summarize an article
app.get('/summarizeArticle/:id', async (req, res) => {
  const { id } = req.params;

  // Fetch the article content from Supabase
  const { data: article, error } = await supabase
    .from('Articles')
    .select('content')
    .eq('id', id)
    .single();

  if (error || !article) {
    return res.status(500).send('Error fetching article or article not found');
  }

  // Prepare prompt for GPT-3-turbo
  const prompt = 
  
  `Write an ULTRA-SHORT summary in norwegian about this article in ONLY THREE bullet points that are SEPERATED WITH PARAGRAPHS: \n\n${article.content}`;

  try {
    const openAIResponse = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{role: 'system', content: prompt}],
      max_tokens: 300,
    });

    const summary = openAIResponse.data.choices[0].message.content.trim();
    res.json({ summary });
  } catch (error) {
    console.error("Error with OpenAI:", error);
    res.status(500).send('Error summarizing article');
  }
});

app.get('/articlesInSeries/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the series information for the current article
    const { data: articleData, error: articleError } = await supabase
      .from('Articles')
      .select('*')
      .eq('id', id)
      .single();

    if (articleError) {
      throw articleError;
    }

    // Parse the series data assuming it might be comma-separated
    const seriesIds = articleData.series.split(',').map(s => s.trim());

    // Fetch all articles from the same series
    const { data: seriesArticles, error: seriesError } = await supabase
      .from('Articles')
      .select('*')
      .in('series', seriesIds)
      .not('id', 'eq', id); // Optionally exclude the current article from the list

    if (seriesError) {
      throw seriesError;
    }

    res.json(seriesArticles);
  } catch (error) {
    console.error('Error fetching articles in series:', error);
    res.status(500).send('Error fetching articles in series');
  }
});

app.get('/similarArticles/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the tags for the current article
    const { data: currentArticle, error: currentArticleError } = await supabase
      .from('Articles')
      .select('*')
      .eq('id', id)
      .single();

    if (currentArticleError) {
      console.error('Error fetching article tags:', currentArticleError);
      throw currentArticleError;
    }

    // Split tags and remove extra spaces
    const tags = currentArticle.tags.split(',').map(tag => tag.trim());
    let articlesFound = new Map();

    for (let tag of tags) {
      const { data: articlesByTag, error: tagError } = await supabase
        .from('Articles')
        .select('*')
        .ilike('tags', `%${tag}%`) // Use ILIKE for case-insensitive matching
        .not('id', 'eq', id); // Exclude the current article

      if (tagError) {
        console.error('Error fetching articles by tag:', tagError);
        continue; // Skip to the next tag on error
      }

      // Add or update the count of matching tags for each article
      articlesByTag.forEach(article => {
        if (!articlesFound.has(article.id)) {
          articlesFound.set(article.id, { ...article, tagCount: 1 });
        } else {
          articlesFound.get(article.id).tagCount += 1;
        }
      });
    }

    // Sort articles by the number of matching tags, descending, and limit to the top 3
    const sortedArticles = Array.from(articlesFound.values())
      .sort((a, b) => b.tagCount - a.tagCount)
      .slice(0, 3);

    res.json(sortedArticles);
  } catch (error) {
    console.error('Error fetching similar articles:', error);
    res.status(500).send('Error fetching similar articles');
  }
});

async function fetchArticlesByTag(tag) {
  let { data: articles, error } = await supabase
      .from('Articles')
      .select('*')
      .ilike('tags', `%${tag}%`);  // Use ILIKE for case-insensitive matching

  if (error) {
      console.error('Error fetching articles by tags:', error);
      return [];
  }

  return articles;
}



app.get("", (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  insertKeywordsToChatHistory();
});