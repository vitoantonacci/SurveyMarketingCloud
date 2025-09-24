// Questions data for Survey Marketing Cloud
//?email=%%=v(@CustomerEmail)=%%&Country=%%=v(@country)=%%&Language=%%=v(@language)=%%&age=%%=v(@ageCluster)=%%&gender=%%=v(@gender)=%%

var questionsData = {
    cover: {
        title: "Scopri le tue preferenze digitali",
        description: "Un breve sondaggio per capire meglio le tue abitudini e preferenze tecnologiche. Ci aiuterà a migliorare i nostri servizi.",
        buttonText: "Inizia il sondaggio",
        imageUrl: "https://images.typeform.com/images/RMtyJ36PEuNA/image/default-firstframe.png"
    },
    thankyou: {
        title: "Grazie per il tuo feedback!",
        description: "La tua opinione è preziosa per noi e ci aiuterà a migliorare continuamente i nostri prodotti e servizi. Grazie per aver dedicato il tuo tempo a questo survey.",
        buttonText: "Visita Guess.eu",
        buttonUrl: "https://www.guess.eu",
        imageUrl: "https://images.typeform.com/images/RMtyJ36PEuNA/image/default-firstframe.png"
    },
    error: {
        title: "Ops! Qualcosa è andato storto",
        description: "Ci dispiace, ma si è verificato un problema tecnico durante l'invio delle tue risposte. Non preoccuparti, le tue risposte sono state salvate localmente e puoi riprovare.",
        buttonText: "Riprova il sondaggio",
        buttonUrl: "survey.html",
        imageUrl: "https://images.typeform.com/images/RMtyJ36PEuNA/image/default-firstframe.png"
    },
    questions: [
        {
            id: "q1a2b3c4",
            type: "multiple_choice",
            required: true,
            title: "Qual è la tua esperienza con i prodotti digitali?",
            description: "Aiutaci a capire meglio le tue preferenze per migliorare i nostri servizi",
            answers: [
                { id:"beg",  text:"Sono un principiante, ho poca esperienza", goto:"q2d5e6f7" }, // salta a Likert
                { id:"mid",  text:"Ho un'esperienza intermedia",              goto:"" },         // default: next
                { id:"good", text:"Sono abbastanza esperto",              goto:"q3g8h9i0" },     // salta sì/no
                { id:"very", text:"Sono molto esperto",                   goto:"q4j1k2l3" },     // salta al multi-likert
                { id:"pro",  text:"Sono un esperto professionista",       goto:"q4j1k2l3" }
            ]
        },
        {
            id: "q2d5e6f7",
            type: "likert_scale",
            required: true,
            title: "Quanto sei soddisfatto del nostro servizio?",
            description: "Valuta la tua soddisfazione generale",
            scale: { min:1, max:5, labels:{ min:"1 = Per niente soddisfatto", max:"5 = Molto soddisfatto" } },
            // regole valutate in ordine: la prima che matcha vince
            logic: [
                { when:{ op:"<=", value:2 }, goto:"q5m4n5o6" }, // molto insoddisfatto => chiedi suggerimenti
                { when:{ op:">=", value:4 }, goto:"q3g8h9i0" }  // soddisfatto => vai alla raccomandazione
            ]
        },
        {
            id:"q3g8h9i0",
            type:"yes_no",
            required:true,
            title:"Raccomanderesti il nostro servizio?",
            description:"La tua opinione è importante per noi",
            // anche sui yes/no puoi mettere goto sugli "answers" standardizzati
            answers: [
                { id:"yes", text:"Sì", goto:"q4j1k2l3" },
                { id:"no",  text:"No", goto:"q5m4n5o6" }
            ]
        },
        {
            id: "q4j1k2l3",
            type: "multi_likert",
            required: true,
            title: "Come valuteresti le borse Guess da 1 a 5 nei seguenti aspetti?",
            description: "Valuta ogni aspetto separatamente",
            aspects: [{name:"Forma",id:"forma"},{name:"Colori",id:"colori"},{name:"Materiali",id:"materiali"}],
            scale: { min:1, max:5, labels:{ min:"1 = Per niente soddisfatto", max:"5 = Molto soddisfatto" } },
            logic: [
                // Se qualunque aspetto <=2, chiedi suggerimenti
                { when:{ aspect:"*", op:"<=", value:2 }, goto:"q5m4n5o6" }
            ]
        },
        {
            id:"q5m4n5o6",
            type:"open_text",
            required:false,
            title:"Hai suggerimenti per migliorare?",
            description:"Condividi le tue idee e feedback",
            placeholder:"Scrivi qui i tuoi suggerimenti..."
        }
    ]
};

// Common logo SVG function
function getGuessLogo() {
    return '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 337.9 69.8" style="enable-background:new 0 0 337.9 69.8;" xml:space="preserve">' +
        '<g>' +
        '<path d="M41.8,35.7l1.1,0.1c4.3,0.3,5.8,1,6.3,1.4c0.4,0.3,1.2,1.5,1.2,6.2v15.5c0,0.7-0.2,1.3-0.5,1.6c-0.2,0.2-1,0.7-3.9,1.7c-1.4,0.5-2.8,0.8-4.3,1c-1.5,0.2-2.9,0.3-4,0.3c-6.6,0-12.2-2.4-16.7-7.2c-4.5-4.8-6.8-11.6-6.8-20.2c0-10.5,2.3-18.1,6.8-22.6c4.5-4.5,9.8-6.8,15.7-6.8c5.9,0,10.5,1.9,14.1,5.7c2,2.2,4,5.7,6,10.2l0.3,0.7h4.2L60.5,0.5h-4.1l-0.3,0.7c-0.3,0.8-0.8,1.5-1.2,1.9c-0.2,0.2-0.8,0.5-2.2,0.5c-0.2,0-1.1-0.1-6-1.5C43.1,1,39.2,0.5,35.3,0.5c-10.7,0-19.5,3.7-26,11.1c-5.9,6.7-8.9,14.8-8.9,24.1c0,10.6,3.8,19.2,11.2,25.6c6.7,5.7,15.1,8.6,24.9,8.6c5.3,0,10.8-1,16.5-2.9c7.6-2.6,9.2-4.2,9.2-5.7V42.1c0-2.7,0.5-4.6,1.6-5.4c0.3-0.3,1.3-0.7,4.2-0.9l1.1-0.1v-4.1H41.8V35.7z"></path>' +
        '<path d="M122.1,5.7l1.1,0.1c3.2,0.3,5.4,1.1,6.5,2.2c0.6,0.6,1.6,2.7,1.6,9.2v25.4c0,6-0.7,10.5-2.2,13.3c-2.5,5-7.4,7.4-15,7.4c-6.8,0-11.3-2.3-13.8-7.1c-1.3-2.7-2-6.5-2-11.4V13.3c0-4.2,0.8-5.6,1.3-6c0.5-0.5,2-1.3,6.6-1.6l1.1-0.1V1.6h-30v4.1l1.1,0.1c4.5,0.3,6,1.2,6.5,1.6c0.5,0.4,1.3,1.8,1.3,6v30.5c0,6.2,1.1,11.3,3.2,15.1c4,7.2,11.6,10.9,22.5,10.9c11.1,0,18.7-3.7,22.7-11c2.1-3.9,3.2-9.4,3.2-16.3V17.1c0-6.3,0.9-8.4,1.5-9c0.7-0.8,2.3-1.8,6.6-2.3l1-0.1v-4h-24.9V5.7z"></path>' +
        '<path d="M212.6,50.3c-2.4,5.3-5,8.6-7.9,9.9c-3,1.4-7.7,2.1-14.1,2.1c-7.4,0-9.9-0.3-10.7-0.5c-0.2-0.1-1-0.3-1-2.3v-23h13.9c4.9,0,6.5,0.9,7,1.5c0.7,0.7,1.7,2.5,2.5,6.9l0.2,1h4.4V21h-4.4l-0.2,1c-0.8,4.4-1.8,6.2-2.5,6.9c-0.5,0.6-2.1,1.5-7.1,1.5h-13.9V9.8c0-1.5,0.2-1.9,0.2-1.9c0,0,0.3-0.2,1.7-0.2h13.3c6.8,0,9.3,0.9,10.3,1.7c1,0.7,2.3,2.7,3.3,7.6l0.2,1h4.6l-0.4-16.3h-54.1v4.1l1.1,0.1c4.3,0.3,5.8,1.2,6.2,1.6c0.5,0.5,1.2,1.9,1.2,6v43.4c0,4.5-0.8,5.6-1.2,5.9c-0.5,0.4-2,1.2-6.3,1.6l-1.1,0.1v4h54.8l5.1-18.8h-5L212.6,50.3z"></path>' +
        '<path d="M261.6,30.6l-8.6-5.3c-3.1-1.9-5.4-3.7-6.8-5.4c-1.3-1.6-2-3.4-2-5.7c0-2.4,0.8-4.3,2.5-5.6c1.8-1.4,3.8-2.1,6.2-2.1c3.2,0,6.4,1.2,9.7,3.5c3.3,2.3,5.7,6.5,7.2,12.4l0.2,0.9h4.5l-2.4-23.1h-4l-0.2,0.9c-0.2,0.9-0.5,1.5-0.8,2c-0.2,0.3-0.8,0.4-1.5,0.4c-0.2,0-1-0.2-5-1.6c-3.2-1.1-6.1-1.7-8.4-1.7c-5.7,0-10.3,1.8-13.8,5.2c-3.5,3.5-5.2,7.9-5.2,13.1c0,4,1.5,7.7,4.5,11c1.6,1.7,3.7,3.4,6.2,5l8.3,5.2c4.7,2.9,7.8,5.1,9.2,6.5c2.1,2.1,3.1,4.6,3.1,7.5c0,3.2-1,5.6-3,7.3c-2.1,1.8-4.4,2.7-7.3,2.7c-5.4,0-9.8-2.1-13.5-6.4c-2.1-2.5-4-5.9-5.6-10.1l-0.3-0.8h-4.4l3.2,23.1h4.2l0.2-1c0.1-0.7,0.3-1.3,0.6-1.8c0.2-0.3,0.6-0.5,1.3-0.5c0.2,0,1,0.2,5.3,1.6c3.4,1.2,6.7,1.8,9.8,1.8c6.3,0,11.5-1.8,15.6-5.4c4.1-3.6,6.2-8.2,6.2-13.7c0-4.1-1.2-7.6-3.5-10.6C271,37.1,267,34,261.6,30.6z"></path>' +
        '</g>' +
        '<path d="M334.3,40c-2.3-2.9-6.2-6-11.6-9.4l-8.6-5.3c-3.1-1.9-5.4-3.7-6.8-5.4c-1.3-1.6-2-3.4-2-5.7c0-2.4,0.8-4.3,2.5-5.6c1.8-1.4,3.8-2.1,6.2-2.1c3.2,0,6.4,1.2,9.7,3.5c3.3,2.3,5.7,6.5,7.2,12.4l0.2,0.9h4.5l-2.4-23.1h-4l-0.2,0.9c-0.2,0.9-0.5,1.5-0.8,2c-0.2,0.3-0.8,0.4-1.6,0.4c-0.2,0-1-0.2-5-1.6c-3.2-1.1-6.1-1.7-8.4-1.7c-5.7,0-10.3,1.8-13.8,5.2c-3.5,3.5-5.2,7.9-5.2,13.1c0,4,1.5,7.7,4.5,11c1.6,1.7,3.7,3.4,6.2,5l8.3,5.2c4.7,2.9,7.8,5.1,9.2,6.5c2.1,2.1,3.1,4.6,3.1,7.5c0,3.2-1,5.6-3,7.3c-2.1,1.8-4.4,2.7-7.3,2.7c-5.4,0-9.8-2.1-13.5-6.4c-2.1-2.5-4-5.9-5.6-10.1l-0.3-0.8h-4.4l3.2,23.1h4.2l0.2-1c0.1-0.7,0.3-1.3,0.6-1.8c0.2-0.3,0.6-0.5,1.3-0.5c0.2,0,1,0.2,5.3,1.6c3.4,1.2,6.7,1.8,9.8,1.8c6.3,0,11.5-1.8,15.6-5.4c4.1-3.6,6.2-8.2,6.2-13.7C337.8,46.6,336.6,43,334.3,40z"></path>' +
        '</svg>';
}

// Function to generate unique alphanumeric IDs
function generateUniqueId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}