// Questions data for Survey Marketing Cloud
var questionsData = {
    cover: {
        title: "Scopri le tue preferenze digitali",
        description: "Un breve sondaggio per capire meglio le tue abitudini e preferenze tecnologiche. Ci aiuterà a migliorare i nostri servizi.",
        buttonText: "Inizia il sondaggio",
        imageUrl: "https://images.typeform.com/images/RMtyJ36PEuNA/image/default-firstframe.png"
    },
    questions: [
        {
            id: 1,
            type: "multiple_choice", // multiple_choice | likert_scale | multi_likert | yes_no | open_text
            required: true, // true | false
            title: "Qual è la tua esperienza con i prodotti digitali?",
            description: "Aiutaci a capire meglio le tue preferenze per migliorare i nostri servizi",
            answers: [
                {
                    text: "Sono un principiante, ho poca esperienza"
                },
                {
                    text: "Ho un'esperienza intermedia"
                },
                {
                    text: "Sono abbastanza esperto"
                },
                {
                    text: "Sono molto esperto"
                },
                {
                    text: "Sono un esperto professionista"
                }
            ]
        },
        {
            id: 2,
            type: "likert_scale",
            required: true,
            title: "Quanto sei soddisfatto del nostro servizio?",
            description: "Valuta la tua soddisfazione generale",
            scale: {
                min: 1,
                max: 5,
                labels: {
                    min: "1 = Per niente soddisfatto",
                    max: "5 = Molto soddisfatto"
                }
            }
        },
        {
            id: 3,
            type: "yes_no",
            required: false,
            title: "Raccomanderesti il nostro servizio?",
            description: "La tua opinione è importante per noi"
        },
        {
            id: 4,
            type: "multi_likert",
            required: true,
            title: "Come valuteresti le borse Guess da 1 a 5 nei seguenti aspetti?",
            description: "Valuta ogni aspetto separatamente",
            aspects: [
                {
                    name: "Forma",
                    id: "forma"
                },
                {
                    name: "Colori", 
                    id: "colori"
                },
                {
                    name: "Materiali",
                    id: "materiali"
                }
            ],
            scale: {
                min: 1,
                max: 5,
                labels: {
                    min: "1 = Per niente soddisfatto",
                    max: "5 = Molto soddisfatto"
                }
            }
        },
        {
            id: 5,
            type: "open_text",
            required: true,
            title: "Hai suggerimenti per migliorare?",
            description: "Condividi le tue idee e feedback",
            placeholder: "Scrivi qui i tuoi suggerimenti..."
        }
    ]
};
