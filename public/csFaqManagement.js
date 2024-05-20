import { showTypingAnimation } from "./chatInteractions.js";
import { createChatLi } from "./chatInteractions.js";
import { hideTypingAnimation } from "./chatInteractions.js";
import { scrollToBottomOfChat } from "./utils.js";


function fetchCSButtons() {
    const chatbox = document.querySelector(".chatbox");
    const introMessage = "Her er de tilgjengelige kategoriene for kundeservice: 😊";
    chatbox.appendChild(createChatLi(introMessage, "incoming"));
    
    // Show typing animation initially for the intro message
    showTypingAnimation();
  
    // Introduce a slight delay before hiding the typing animation of the intro message
    setTimeout(() => {
      hideTypingAnimation(); // Hide typing animation for the intro message
  
      // Immediately show typing animation again for the buttons
      showTypingAnimation();
  
      setTimeout(() => {
        hideTypingAnimation(); // Hide typing animation before showing buttons
        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('faq-buttons-container');
  
        const csButtons = [
            { text: "Innlogging på våre digitale produkter", pattern: "digitalLogin" },
            { text: "Levering av papiravis", pattern: "paperDelivery" },
            { text: "Kjøp og endring av abonnement", pattern: "subscriptionManagement" },
            { text: "Betaling og faktura", pattern: "billingAndInvoices" },
        ];
  
        csButtons.forEach(btn => {
            const button = document.createElement('button');
            button.classList.add('faq-button', 'cs-button');
            button.textContent = btn.text;
            button.onclick = () => handleCSAction(btn.pattern);
            button.setAttribute('data-pattern', btn.pattern);
            buttonsContainer.appendChild(button);
        });
  
        // Append the buttons to the chatbox
        chatbox.appendChild(createChatLi(buttonsContainer, "incoming"));
        scrollToBottomOfChat();
      }, 500); // Delay before showing buttons to simulate typing
    }, 0); // Adjusted to transition immediately to second typing animation
  }
  
  
  function handleCSAction(pattern) {
    const chatbox = document.querySelector(".chatbox");
    showTypingAnimation(); // Start typing animation
  
    setTimeout(() => {
      hideTypingAnimation(); // Hide typing animation initially
      const categoryNames = {
        "digitalLogin": "Innlogging på våre digitale produkter",
        "subscriptionManagement": "Kjøp og endring av abonnement",
        "billingAndInvoices": "Betaling og faktura",
        "paperDelivery": "Levering av papiravis"
      };
  
      if (categoryNames[pattern]) {
        const categoryMessage = `Du valgte "${categoryNames[pattern]}" Trykk på knappene for å få svar på spørsmålet. 😊`;
        chatbox.appendChild(createChatLi(categoryMessage, "incoming"));
        scrollToBottomOfChat();
      }
  
      // Introduce a slight delay before showing options
      showTypingAnimation();
      setTimeout(() => {
        hideTypingAnimation(); // Hide typing animation before showing buttons
        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('faq-buttons-container');
        
        let options;
        if (pattern === "digitalLogin") {
          options = [
            { text: "Konto og innlogging", pattern: "accountAndLogin" },
            { text: "Tilgang og abonnement", pattern: "accessAndSubscription" },
            { text: "Tekniske problemer og assistanse", pattern: "technicalIssues" },
            { text: "Generelle spørsmål om tjenestene", pattern: "generalQuestions" }
          ];
        } else if (pattern === "subscriptionManagement") {
          options = [
            { text: "Abonnementstyper og priser?", answer: "Oversikt over alle abonnementstyper og priser finner du <a href=https://www.smp.no/dakapo/productpage/SPO>her.</a>"},
            { text: "Hva er inkludert i et abonnement?", answer: "Alle abonnenter får følgende inkludert i sitt abonnement: Tilgang til alle saker som ligger på nettavisen (Pluss-saker), eAvisen, den elektroniske versjonen av papiravisen, Digitalt arkiv, +Nyhetsbrev og fordelsbrev, Familiedeling (del din digitale tilgang med inntil 3 familiemedlemmer: Unntak: bedriftsabonnement og UNG). I tillegg får abonnenter som har Komplett- eller Helgeabonnement også papiravis." },
            { text: "Hvordan dele abonnement i familien?", answer: "Du kan dele abonnementet med inntil tre personer i familien (gjelder ikke bedriftsabonnement eller UNG-abonnement). Du kan velge hvem du gir tilgang til på <a href=https://minside.smp.no/familiedeling>Min Side.</a>" },
            { text: "Administrasjon av abonnementet?", answer: "Dette gjør du enkelt via <a href=https://minside.smp.no/>Min Side.</a>" },
            { text: "Kan jeg få bare papiravisen?", answer: "Nei, digital tilgang er inkludert i alle våre abonnement." },
            { text: "Digital tilgang med papiravisen?", answer: "Alle som abonnerer på papiravisen får automatisk tilgang til alt som publiseres på nett og mobil. Det eneste man må gjøre er å <a href=https://minside.smp.no/> opprette en Schibsted-konto, eller logge inn</a> hvis du har Schibsted-konto fra før."},
            { text: "Kjøpe en enkelt artikkel?", answer: "Nei, det er ikke mulig å kjøpe tilgang til/få tilsendt enkelt artikler." }
          ];              
        } else if (pattern === "billingAndInvoices") {
          options = [
            { text: "Betalingsrelaterte spørsmål", pattern: "betalingsspørsmål" },
            { text: "Abonnementshåndtering og endringer", pattern: "Abonnementshåndtering"},
          ];
        } else if (pattern === "paperDelivery") {
          options = [
            { text: "Stoppe papiravisen under reise?", answer: "Papiravisen stoppes enkelt på <a href=https://minside.smp.no/endre-avislevering>MinSide.</a> Du vil fortsatt ha tilgang til å lese eAvisen og plussartiklene på nettavisen." },
            { text: "Refusjon ved midlertidig stopp av papiravisen?", answer: "Nei. Selv om du stanser levering av papiravisen, har du fortsatt tilgang til eAvisen og nettavis. Du har derfor fortsatt tilgang til innholdet du har betalt for." },
            { text: "Leverandør av avisen?", answer: "Vår avis får du på hverdager levert med Polaris Distribusjon eller Posten. Hvis avisen skal leveres utenfor avisens region, brukes i noen tilfeller et lokalt distribusjonsselskap. Hvis det leveres avis på din adresse på lørdager, leveres lørdagsavisen med Polaris Distribusjon eller et lokalt distribusjonsselskap." },
            { text: "Forventet leveringstidspunkt for avisen?", answer: "Det varierer med leveringsmåte. Posten har leveransefrist kl. 17.00 på hverdager. Polaris Distribusjon har leveransefrist mellom kl. 06.30-09.00 på hverdager. Hvis det leveres avis på din adresse på lørdager, er leveransefristen kl. 17.00 Du finner informasjon angående levering på din adresse på Min Side. NB: Ved levering utenfor avisens region, vil Posten/det lokale distribusjonsselskapet kunne bruke 2-3 virkedager på leveransen. Leveringen har også forholdt relatert til den nye Postloven som trådte i kraft juli 2020." },
            { text: "Jeg er abonnent og har ikke fått papiravisen min. Kan jeg få den etterlevert eller godskrevet?", answer: "Vi har dessverre ikke mulighet til å etterlevere <a href=https://minside.smp.no/publication.epaperpage>Eavisen.</a> Eventuell godskriving skjer i henhold til <a href=https://minside.smp.no/vilkaar>gjeldende abonnementsvilkår</a>."},
            { text: "Manglende levering av papiravis?", answer: "Tilbakemelding på dagens avislevering kan gjøres <a href=https://minside.smp.no/tilbakemelding>her.</a>" }
          ];
        }

        if (options) {
          options.forEach(opt => {
            const button = document.createElement('button');
            button.classList.add('faq-button', 'sub-cs-button');
            button.textContent = opt.text;
            button.onclick = () => {
              showTypingAnimation();
              setTimeout(() => {
                if (opt.pattern === "accountAndLogin" || opt.pattern === "accessAndSubscription" || opt.pattern === "technicalIssues" || opt.pattern === "generalQuestions") {
                  handleDigitalLoginSubAction(opt.pattern);
                } else if (opt.pattern === "betalingsspørsmål" || opt.pattern === "Abonnementshåndtering") {
                  handleBillingAndInvoicesSubAction(opt.pattern);
                } else {
                  const answerMessage = `<strong>${opt.text}</strong><br>${opt.answer}`;
                  chatbox.appendChild(createChatLi(answerMessage, "incoming"));
                }
                hideTypingAnimation();
                scrollToBottomOfChat();
              }, 1500);
            };
            buttonsContainer.appendChild(button);
          });
        }
  
        chatbox.appendChild(createChatLi(buttonsContainer, "incoming"));
        scrollToBottomOfChat();
      }, 500); // Delay for processing the user's choice
    }, 1500); // Initial delay to mimic typing and processing
  }
  
  
  function handleDigitalLoginSubAction(pattern) {
    const chatbox = document.querySelector(".chatbox");
    const details = {
      "accountAndLogin": [
        { text: "Hva er en Schibsted-konto (tidligere SPiD)?", answer: "Vi benytter Schibsted-konto for å identifisere deg som kunde, mer informasjon om Schibsted finner du <a href=https://info.privacy.schibsted.com/no/hva-er-en-schibsted-konto/ target=_blank>her</a>." },
        { text: "Finner ikke denne kombinasjonen av e-post og passord", answer: "Dette betyr at passordet ditt er feil. Trykk 'Glemt passord?' der du logger inn, og følg instruksene for å lage et nytt passord." },
        { text: "Jeg har byttet e-postadresse, hva gjør jeg for å få digital tilgang med denne?", answer: "For å bytte e-postadresse på Schibsted-kontoen din må du endre selve <a href=https://payment.schibsted.no/account/summary?redirect_uri=https://www.smp.no>Schibsted-brukeren.</a>"}
      ],
      "accessAndSubscription": [
        { text: "Finner ikke abonnementet mitt?", answer: "Det kan være at du er logget inn med en annen e-postadresse enn den vi har registrert på abonnementet. Logg ut, og logg deretter inn med riktig e-postadresse." },
        { text: "Innlogget, men kan ikke lese eAvis/plussartikler?", answer: "Det kan være at du er logget inn med en annen e-postadresse enn den vi har registrert på abonnementet. Logg ut, og logg deretter inn med riktig e-postadresse." },
        { text: "Hva er Min Side?", answer: "På Min side kan du administrere ditt abonnement. Her kan du administrere alt fra omadressering til familiedeling. For å kunne benytte deg av min side, må du være innlogget med din Schibsted-bruker." },
        { text: "Hvorfor må jeg godkjenne vilkår?", answer: "Når du logger på for første gang, må du godkjenne våre og Schibsted sine brukervilkår og personvernserklæringer." },
      ],
      "technicalIssues": [
        { text: "Nedlastingen av eAvisen stopper, tips?", answer: "Dersom du opplever at nedlastingen av en utgave stanser opp, kan det skyldes flere årsaker. Du har ikke mer tilgjengelig lagringsplass for aviser på din enhet. Appen har en viss mengde tilegnet plass til lagring av aviser, og kan ikke bruke mer enn dette. Nederst i applikasjonen er det en knapp som heter 'Lagrede aviser'. Når du klikker på denne ser du de avisene som ligger lagret på din enhet, og de som det er påbegynt nedlasting av. Dersom du holder fingeren over en av disse utgavene får du valg om å slette utgaven. Prøv å slette et par gamle utgaver og start nedlastingen av dagens utgave på nytt." },
        { text: "Hvor er kundenummeret mitt?", answer: "Kundenummeret ditt står på fakturaen du får tilsendt fra oss, denne finner du bl.a. på Min Side." }
      ],
      "generalQuestions": [
        { text: "Krever eAvis Schibsted-konto?", answer: "Ja, for å lese eAvisa og plussartiklene på nettavisen må du ha en Schibsted-konto, samt et abonnement." },
        { text: "Hvor kan jeg lese eAvisen?", answer: "eAvisen kan leses på PC og Mac, samt alle smarttelefoner og nettbrett som har iOS (iPhone og iPad) og Android. Last ned vår eAvis-app kostnadsfritt fra App store eller Google play, eAvisen fungerer på alle enheter som kjører iOS (iPhone og iPad) eller Android." },
        { text: "Når er eAvisen tilgjengelig?", answer: "eAvisen er tilgjengelig senest kl 22:00 på alle plattformer." },
        { text: "Hvor finner jeg tidligere artikler?", answer: "Avisene tilbake til 2003 er tilgjengelig via digitalt abonnement. Gamle enkeltutgaver kan også kjøpes <a href=https://www.buyandread.com/>her.</a> I tillegg kan eldre aviser leses digitalt på de fleste bibliotek. Man kan også lese tidligere aviser på Nasjonalbiblioteket sin <a href=https://www.nb.no/search?mediatype=aviser>nettside.</a>" }
      ]
    };
    const categoryNames = {
      "accountAndLogin": "Konto og innlogging",
      "accessAndSubscription": "Tilgang og abonnement",
      "technicalIssues": "Tekniske problemer og assistanse",
      "generalQuestions": "Generelle spørsmål om tjenestene"
    };

    showTypingAnimation(); // Start typing animation
    setTimeout(() => {
      hideTypingAnimation(); // Hide typing animation
      const categoryMessage = `Du valgte "${categoryNames[pattern]}" Trykk på knappene for å få svar på spørsmålet. 😊`;
      chatbox.appendChild(createChatLi(categoryMessage, "incoming"));
      scrollToBottomOfChat();
  
      showTypingAnimation(); // Start typing animation for buttons
      setTimeout(() => {
        hideTypingAnimation(); // Hide typing animation before showing buttons
        const questions = details[pattern];
  
        if (questions) {
          const buttonsContainer = document.createElement('div');
          buttonsContainer.classList.add('faq-buttons-container');
  
          questions.forEach(question => {
            const button = document.createElement('button');
            button.classList.add('faq-button', 'sub-cs-button');
            button.textContent = question.text;
            button.onclick = () => {
              showTypingAnimation(); // Show typing for each button click
              setTimeout(() => {
                const answerMessage = `<strong>${question.text}</strong><br>${question.answer}`;
                chatbox.appendChild(createChatLi(answerMessage, "incoming"));
                hideTypingAnimation(); // Hide typing animation after showing answer
                scrollToBottomOfChat();
              }, 1500); // Delay to mimic typing for the answer
            };
            buttonsContainer.appendChild(button);
          });
  
          chatbox.appendChild(createChatLi(buttonsContainer, "incoming"));
          scrollToBottomOfChat();
        }
      }, 500); // Delay before showing buttons to simulate typing
    }, 0); // Initial delay to mimic typing and processing of category choice
  }

  function handleBillingAndInvoicesSubAction(pattern) {
    const chatbox = document.querySelector(".chatbox");
    const categoryNames = {
      "Abonnementshåndtering": "Abonnementshåndtering og endringer",
      "betalingsspørsmål": "Betalingsrelaterte spørsmål"
    };

  const details = {
  "betalingsspørsmål": [
    { text: "Kvittering for kortkjøp?", answer: "Kvitteringer for ditt kjøp finner du  <a href=https://payment.schibsted.no/account/purchasehistory/?redirect_uri=https://www.smp.no>her.</a>" },
    { text: "Feil beløp ved abonnementsbestilling?", answer: "Dersom dette skyldes feil fra vår side vil vi selvsagt rydde opp i situasjonen. Ta kontakt med vårt kundesenter: abonnement@smp.no, så hjelper vi deg." },
    { text: "Unngå fakturagebyr?", answer: "For å unngå fakturagebyr, anbefaler vi deg å opprette e-faktura eller avtalegiro i din nettbank. Alternativt kan kundeservice bistå med å få endret til e-postfaktura. Ved bestilling på nett kan du registrere ditt betalingskort og dette vil automatisk bli belastet, det påløper da ingen gebyrer." },
    { text: "Opprette eFaktura?", answer: "Avtalen må opprettes i mobilbank eller nettbank. Når du betaler en regning i nettbanken din, vil du få spørsmål om du vil inngå avtale om eFaktura fra betalingsmottakere som tilbyr dette. Du kan da enkelt takke ja til dette og opprette avtale. Fra 15. mai 2022 må du som eFakturakunde gi en generell aksept for eFaktura for å fortsette å være eFaktura-bruker. Dette omtales som 'Ja takk til alle' eller Alltid eFaktura, avhengig av hvilken bank eller betalingsapp du har. For å fortsatt kunne motta regninger og faktura som eFaktura, er det viktig at du aksepterer 'Ja takk til alle' i din nettbank eller betalingsapp. Dersom aksepten ikke gjennomføres før fristen, vil du ikke lenger motta eFaktura etter 15. mai 2022. Merk at allerede fra 1. desember 2021 må du gi generell aksept for eFaktura «Ja takk til alle» for å kunne motta regninger fra bedrifter som du tidligere ikke har mottatt eFaktura fra. Vi oppfordrer derfor alle som ønsker å benytte eFaktura om å inngå «Ja takk til alle»-avtale snarest mulig." },
    { text: "Betalingspåminnelse etter betalt faktura?", answer: "Din innbetaling og vår betalingspåminnelse kan ha krysset hverandre. Send oss en kvittering av innbetalingen via e-post så vi får sjekket at alt er i orden: abonnement@smp.no." },
    { text: "Hvorfor Polaris Media som betalingsmottaker?", answer: "Vi er en del av Polaris Media konsernet. Det betyr din innbetaling vil gå til Polaris Media, da det er de som fakturerer våre abonnement." }
  ],
  "Abonnementshåndtering": [
    { text: "Angrerett på digitalt kjøp?", answer: "I henhold til angrerettloven går angreretten tapt ved kjøp av digitale tjenester i det man med samtykke tar i bruk tjenesten. Du kan avslutte abonnementet <a href=https://minside.smp.no/avslutt>her.</a>" },
    { text: "Restgiro etter abonnementssigelse?", answer: "Dersom abonnementet ble sagt opp etter forfall, så vil du få en faktura for perioden mellom forfall og avslutning av abonnement." },
    { text: "Endre fakturaperiode?", answer: "Du kan endre fakturaperioden ved å ta kontakt med kundeservice. Alternativene vi har er 1-, 3- og 12-månedsfaktura." },
    { text: "Oppdatere betalingsinformasjon?", answer: "Betalingsmåte kan endres <a href=https://minside.smp.no/oppdaterkort>her.</a> "},
    { text: "Abonnement fornyet til redusert pris?", answer: "Alle våre abonnement er løpende til det blir sagt opp. Dersom man bestiller et abonnement til reduser pris og abonnementet ikke blir sagt opp, vil abonnementet løpe videre til ordinær pris." }
  ]
    };
  
  showTypingAnimation(); // Start typing animation for the category message
  setTimeout(() => {
    hideTypingAnimation(); // Hide typing animation
    const categoryMessage = `Du valgte "${categoryNames[pattern]}" Trykk på knappene for å få svar på spørsmålet. 😊`;
    chatbox.appendChild(createChatLi(categoryMessage, "incoming"));
    scrollToBottomOfChat();

    showTypingAnimation(); // Start typing animation for buttons
    setTimeout(() => {
      hideTypingAnimation(); // Hide typing animation before showing buttons
      const questions = details[pattern];

      if (questions) {
        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('faq-buttons-container');

        questions.forEach(question => {
          const button = document.createElement('button');
          button.classList.add('faq-button', 'sub-cs-button');
          button.textContent = question.text;
          button.onclick = () => {
            showTypingAnimation(); // Show typing for each button click
            setTimeout(() => {
              const answerMessage = `<strong>${question.text}</strong><br>${question.answer}`;
              chatbox.appendChild(createChatLi(answerMessage, "incoming"));
              hideTypingAnimation(); // Hide typing animation after showing answer
              scrollToBottomOfChat();
            }, 1500); // Delay to mimic typing for the answer
          };
          buttonsContainer.appendChild(button);
        });

        chatbox.appendChild(createChatLi(buttonsContainer, "incoming"));
        scrollToBottomOfChat();
      } else {
        const message = "There are no specific questions available for this category.";
        chatbox.appendChild(createChatLi(message, "incoming"));
      }
    }, 500); // Delay before showing buttons to simulate typing
  }, 0); // Initial delay to mimic typing and processing of category choice
}
  
  function handleQuestionResponse(questionText, answer) {
    const chatbox = document.querySelector(".chatbox");
    const message = `<strong>Question:</strong> ${questionText}<br><strong>Answer:</strong> ${answer}`; // Displaying question and answer
    chatbox.appendChild(createChatLi(message, "incoming"));
    scrollToBottomOfChat();
  }

export {
  handleBillingAndInvoicesSubAction,
  handleCSAction,
  handleDigitalLoginSubAction,
  handleQuestionResponse,
  fetchCSButtons,
}