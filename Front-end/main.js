async function searchWord() { //funcao para busca da palavra
    const wordInput = document.getElementById('word');
    const word = wordInput.value;

    if (!word) { //verifica se o campo esta vazio
        alert('Por favor, digite uma palavra.');
        return;
    }

    try { //faz a busca da palavra na api
        const encodedWord = encodeURIComponent(word);
        const response = await fetch(`http://localhost:3000/search/${encodedWord}`);
        const data = await response.json(); //recebe resposta em json
        displayResult(data); //chama a funcao
    } catch (error) {
        console.error(error);
        alert('Erro ao buscar informações da palavra.');
    }
}

function displayResult(data) { //exibe os resultados na interface
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.innerHTML = '';

    const heading = document.createElement('h2');
    heading.textContent = `Palavra: ${data.word}`;
    resultContainer.appendChild(heading);

    const meaningContainer = createPropertyContainer('Significado', data.meaning);
    const additionalInfoContainer = createPropertyContainer('Informações Adicionais', data.additionalInfo);
    const phrasesContainer = createPropertyContainer('Frases', data.phrases);

    resultContainer.appendChild(meaningContainer);
    resultContainer.appendChild(additionalInfoContainer);
    resultContainer.appendChild(phrasesContainer);
}

function createPropertyContainer(label, value) {
    const container = document.createElement('div');
    container.classList.add('property');

    const labelElement = document.createElement('strong');
    labelElement.textContent = `${label}: `;
    container.appendChild(labelElement);

    const valueElement = document.createElement('span');
    valueElement.textContent = value;
    container.appendChild(valueElement);

    return container;
}

// Funcao para falar a palavra
function speakWord() {
    const wordInput = document.getElementById('word');
    const word = wordInput.value;

    if (!word) {
        alert('Por favor, digite uma palavra.');
        return;
    }

    // Usa a API Web Speech para falar a palavra
    const speechSynthesis = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(word);

    speechSynthesis.speak(utterance);
}
