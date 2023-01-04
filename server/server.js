import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config()

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Initial prompt for in-context learning
const init_prompt = "Finja que você é um chatbot especializado no regimento interno do senado federal e constituição federal e responda as perguntas de forma sintética e citando o embasamento legal correspondente. A Constituição Federal pode ser encontrada na internet no link https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm e o Regimento Interno do Senado Federal pode ser encontrado na internet no link https://legis.senado.leg.br/norma/563958/publicacao/16433779 Conforme os exemplos a seguir.Exemplo 1 [Pergunta: Quais são as atribuições da segunda secretaria do senado federal? Resposta: De acordo com o Regimento Interno do Senado Federal, as atribuições da Segunda Secretaria incluem: Coordenar e supervisionar o trâmite de proposições e outros atos legislativos; Controlar a agenda das sessões plenárias e das comissões; Assinar, juntamente com o Presidente da Casa, os atos da Presidência; Substituir o Presidente da Casa em suas faltas e impedimentos; Exercer as demais atribuições que lhe fforem delegadas pelo Presidente da Casa ou pelo Plenário do Senado Federal. Além dessas atribuições específicas, a Segunda Secretaria também pode participar das atividades das comissões e das sessões plenárias do Senado Federal e exercer as atribuições de um senador, inclusive o direito de voto. Embasamento legal: As atribuições da Segunda Secretaria do Senado Federal são estabelecidas no artigo 119 do Regimento Interno do Senado Federal. Este artigo está incluído no Título III do Livro II do Regimento, que trata das disposições gerais sobre a administração e o funcionamento do Senado Federal. ] fim do exemplo 1. Exemplo 2 [Pergunta: É possível fazer o impeachment de ministro do supremo? Resposta: Sim, é possível realizar o impeachment de um ministro do Supremo Tribunal Federal (STF) no Brasil. Para que o impeachment de um ministro do STF seja iniciado, é necessário que haja uma representação, que é uma denúncia formulada por qualquer cidadão, pelo Conselho Nacional de Justiça (CNJ) ou pelo próprio Senado Federal. A partir daí, o processo de impeachment segue os mesmos passos do impeachment do Presidente da República, com a análise da representação pelo Conselho de Ética e Decoro Parlamentar do Senado Federal e, posteriormente, o julgamento pelo plenário do Senado. Embasamento legal: A Constituição Federal estabelece no artigo 52, inciso II, que compete ao Senado Federal julgar os ministros do STF em caso de impedimento. Além disso, a Lei nº 1.079 de 1950 estabelece os crimes e o rito pelos quais um ministro do STF pode ser processado e julgado por impeachment. ] fim do exemplo 2. Exemplo 3 [Pergunta: O presidente da casa pode ser reeleito quantas vezes? qual o fundamento legal que disciplina essa questão? Resposta: O presidente do Senado Federal pode ser reeleito para um novo mandato, desde que não tenha exercido três mandatos consecutivos no mesmo cargo. os membros da Mesa Diretora do Senado, incluindo o presidente, não podem ser reeleitos para mais de três mandatos consecutivos no mesmo cargo. É importante lembrar que essa regra também se aplica aos demais membros da Mesa Diretora, como o vice-presidente, os primeiro e segundo secretários e os terceiro e quarto secretários. Embasamento legal: Essa regra é prevista no artigo 72, inciso IV, alínea 'b', do Regimento Interno do Senado Federal. ] fim do exemplo 3. ";

// Send the initial prompt to the OpenAI API to do in-context learning
openai.createCompletion({
  model: "text-davinci-003",
  prompt: `${init_prompt}`,
  temperature: 0,
  max_tokens: 3000,
  top_p: 1,
  frequency_penalty: 0.5,
  presence_penalty: 0,
  in_context: init_prompt, // include the initial prompt in the in_context field
}).then(response => {
  console.log("In-context learning completed with prompt:", init_prompt);
}).catch(error => {
  console.error("Error completing in-context learning:", error);
});

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from Rui-chatgpt !'
  })
})

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${prompt}`,
      temperature: 0, // Higher values means the model will take more risks.
      max_tokens: 3000, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
      top_p: 1, // alternative to sampling with temperature, called nucleus sampling
      frequency_penalty: 0.5, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
      presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
    });

    res.status(200).send({
      bot: response.data.choices[0].text
    });

  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
})

app.listen(5000, () => console.log('AI server started on http://localhost:5000'))