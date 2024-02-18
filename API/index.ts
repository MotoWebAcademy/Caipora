import express, { Request, Response } from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000; //define porta dp server

app.use(cors());

app.get('/search/:word', async (req: Request, res: Response) => { //definindo a rota
  const word = req.params.word;
  try {
    const result = await scrapeDicio(word); //chama a função que vai pegar os significados
    res.json(result); //retorna um json
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter informações da palavra.' });
  }
});

app.listen(port, () => { //inicia o servidpr
  console.log(`Server is running at http://localhost:${port}`);
});

//funcao que faz o web scraping no site dicio
async function scrapeDicio(word: string): Promise<{ word: string; meaning: string; additionalInfo: string; phrases: string }> {
  const url = `https://www.dicio.com.br/${word}`;
  const response = await axios.get(url);

  if (response.status === 200) {
    const $ = cheerio.load(response.data);

    // Puxar o conteúdo relevante da palavra
    const meaning = $('p.significado.textonovo').first().text().trim();
    const additionalInfo = $('p.adicional:not(.sinonimo)').text().trim();
    const phrases = $('div.frase').text().trim();

    return { word, meaning, additionalInfo, phrases };
  } else {
    throw new Error('Erro ao obter a página.');
  }
}
