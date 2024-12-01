const googleTranslate = require('google-translate-api-browser');
const fs = require('fs').promises;
const OpenAI = require('openai');

var count = 0;
async function translateTextWithRetry(texts, targetLanguage, provider, apikey, attempt = 1, maxRetries = 3) {
  try {

    let result = null;
    let resultArray = [];

    switch(provider){
      case "google(free)":
        const textToTranslate = texts.join(' ||| ');
        result = await googleTranslate.translate(textToTranslate, { to: targetLanguage, corsUrl: "http://cors-anywhere.herokuapp.com/" });
        resultArray = result.text.split(' ||| ');
        break;
      case "chatgpt":
        const openai = new OpenAI({ apiKey: apikey });
        const jsonInput = { texts: texts };

        const prompt = `You are a specialized translator. Translate the array of texts provided into "${targetLanguage}" while maintaining the size and structure of the input JSON.
                - Return ONLY a valid JSON object with the same structure as the input, where the key "texts" contains the array of translated texts.
                - The output array must have exactly the same number of elements as the input array.
                - Each element in the output array must correspond to the same index as the input array.
                - Preserve all line breaks and the original formatting of each text.
                - Ensure the final JSON is valid and retains the complete structure.

                Input:
                ${JSON.stringify(jsonInput)}
                `;

        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          temperature: 0.3,
        });

        const translatedJson = JSON.parse(completion.choices[0].message.content);
        resultArray = translatedJson.texts;
        break;
      default:
        throw new Error("Provider not found");
    }

    if (texts.length != resultArray.length) {
      console.log(`Tentativa ${attempt} de ${maxRetries} falhou. Diferença no total de textos:`, texts.length, resultArray.length);
      await fs.writeFile(
        `debug/errorTranslate${count}.json`,
        JSON.stringify({
          attempt,
          texts,
          translatedText: resultArray
        }, null, 2)
      );

      if (attempt >= maxRetries) {
        throw new Error(`Falha após ${maxRetries} tentativas. Total de textos diferentes.`);
      }

      // Aguarda e tenta novamente
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      return translateTextWithRetry(texts, targetLanguage, provider, apikey, attempt + 1, maxRetries);
    }

    count++;
    return Array.isArray(texts) ? resultArray : result.text;

  } catch (error) {
    if (attempt >= maxRetries) {
      throw error;
    }

    console.error(`Tentativa ${attempt} de ${maxRetries} falhou com erro:`, error);
    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    return translateTextWithRetry(texts, targetLanguage, provider, apikey, attempt + 1, maxRetries);
  }
}

// Função wrapper para manter a interface original
async function translateText(texts, targetLanguage, provider, apikey) {
  return translateTextWithRetry(texts, targetLanguage, provider, apikey);
}

module.exports = { translateText };
