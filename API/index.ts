import express, { Request, Response } from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import cors from 'cors';
import * as admin from 'firebase-admin';

const app = express();
const port = process.env.PORT || 3000;

const firebaseConfig = {
  apiKey: "AIzaSyDuKi7TJTFB3rnnqLZMJEJTm_epX9-nuco",
  authDomain: "dicioacademy-a75ff.firebaseapp.com",
  projectId: "dicioacademy-a75ff",
  storageBucket: "dicioacademy-a75ff.appspot.com",
  messagingSenderId: "655981910595",
  appId: "1:655981910595:web:5455aa22be14bd183452f6"
};

// Configure o Firebase com suas credenciais
const serviceAccount = require('./dicioacademy-a75ff-firebase-adminsdk-l6on3-79a4065525.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://seu-projeto-firebase.firebaseio.com',
});

app.use(cors());

// Rota para realizar a busca da palavra
app.get('/search/:word', async (req: Request, res: Response) => {
  const word = req.params.word;
  try {
    const result = await scrapeDicio(word);

    // Adicione a palavra às pesquisas recentes no Firebase
    await saveRecentSearch(word);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter informações da palavra.' });
  }
});

// Rota para obter as últimas pesquisas
app.get('/recent-searches', async (req: Request, res: Response) => {
  try {
    // Obtenha as últimas pesquisas do Firebase
    const recentSearches = await getRecentSearches();
    res.json({ recentSearches });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter as últimas palavras pesquisadas.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

// Função para salvar uma pesquisa recente no Firebase
async function saveRecentSearch(word: string) {
  const db = admin.firestore();
  const searchesRef = db.collection('searches');

  // Adicione a palavra à coleção de pesquisas
  await searchesRef.add({
    word,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
}

// Função para obter as últimas pesquisas do Firebase
async function getRecentSearches(): Promise<string[]> {
  const db = admin.firestore();
  const searchesRef = db.collection('searches');

  // Ordene as pesquisas por timestamp em ordem decrescente e limite a 10
  const snapshot = await searchesRef.orderBy('timestamp', 'desc').limit(10).get();
  const searches = snapshot.docs.map((doc) => doc.data().word);

  return searches;
}

// Função para realizar o web scraping no site dicio
async function scrapeDicio(word: string): Promise<{ word: string; meaning: string; additionalInfo: string; phrases: string; antonyms?: string[] }> {
  const url = `https://www.dicio.com.br/${word}`;
  const response = await axios.get(url);

  if (response.status === 200) {
    const $ = cheerio.load(response.data);

    const meaning = $('p.significado.textonovo').first().text().trim();
    const additionalInfo = $('p.adicional:not(.sinonimo)').text().trim();
    const phrases = $('div.frase').text().trim();

    // Chama a função para obter os antônimos
    let antonyms: string[] | undefined;
    try {
      antonyms = await scrapeAntonimos(word);
    } catch (error) {
      console.error((error as Error).message);
    }

    return { word, meaning, additionalInfo, phrases, antonyms };
  } else {
    throw new Error('Erro ao obter a página.');
  }
}

// Função para obter os antônimos do site
async function scrapeAntonimos(word: string): Promise<string[]> {
  const antonimosUrl = `https://www.antonimos.com.br/${word}`;
  const antonimosResponse = await axios.get(antonimosUrl);

  if (antonimosResponse.status === 200) {
    const $ = cheerio.load(antonimosResponse.data);

    // Puxa os antônimos do site
    const antonyms = $('p.ant-list').first().text().trim().split(', ');

    return antonyms;
  } else {
    throw new Error('Erro ao obter os antônimos.');
  }
}
