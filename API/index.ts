import express, { Request, Response } from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/search/:word', async (req: Request, res: Response) => {
  const word = req.params.word;
  try {
    const result = await scrapeDicio(word);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter informações da palavra.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

async function scrapeDicio(word: string): Promise<{ word: string; meaning: string; additionalInfo: string; phrases: string; antonyms?: string[] }> {
  const url = `https://www.dicio.com.br/${word}`;
  const response = await axios.get(url);

  if (response.status === 200) {
    const $ = cheerio.load(response.data);

    const meaning = $('p.significado.textonovo').first().text().trim();
    const additionalInfo = $('p.adicional:not(.sinonimo)').text().trim();
    const phrases = $('div.frase').text().trim();

    // Chama a função para obter os antônimos
    const antonyms = await scrapeAntonimos(word);

    return { word, meaning, additionalInfo, phrases, antonyms };
  } else {
    throw new Error('Erro ao obter a página.');
  }
}

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
