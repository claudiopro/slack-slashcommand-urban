// src/slashCommand.js
// const commandParser = require("./commandParser");
const validateCommandInput = require("./validateCommandInput");

const createErrorAttachment = error => ({
  color: "danger",
  text: `*Error*:\n${error.message}`,
  mrkdwn_in: ["text"]
});

const createSuccessAttachment = link => ({
  color: "good",
  text: `*<http://${link.shortUrl}|${link.shortUrl}>* (<https://www.rebrandly.com/links/${link.id}|edit>):\n${link.destination}`,
  mrkdwn_in: ["text"]
});

const createAttachment = result => {
  if (result.constructor === Error) {
    return createErrorAttachment(result);
  }

  return createSuccessAttachment(result);
};

const quoteLines = text =>
  text.split("\n").filter(line => !!line).map(line => `>${line}`).join("\n");

const slashCommandFactory = (urbanDictLookup, slackToken) => body =>
  new Promise((resolve, reject) => {
    if (!body) {
      return resolve({
        text: "",
        attachments: [createErrorAttachment(new Error("Invalid body"))]
      });
    }

    if (slackToken !== body.token) {
      return resolve({
        text: "",
        attachments: [createErrorAttachment(new Error("Invalid token"))]
      });
    }

    // const { text } = commandParser(body.text);
    const term = body.text;

    let error;
    if ((error = validateCommandInput(term))) {
      return resolve({
        text: "",
        attachments: [createErrorAttachment(error)]
      });
    }

    urbanDictLookup(term).then(result => {
      return resolve({
        text: `*${result.word}* (${result.thumbs_up}👍): ${result.definition}
${quoteLines(result.example)}
${result.permalink}`,
        attachments: null
      });
    });
  });

module.exports = slashCommandFactory;
