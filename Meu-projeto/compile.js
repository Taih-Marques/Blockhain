const path = require("path"); // linhas para indicar o caminho onde o arquivo será lido
const fs = require("fs"); // e garantir a compatibilidade de sistemas operacionais
const solc = require("solc");

// Pega o arquivo Inbox.sol e atribui a variável
const AluguelPath = path.resolve(__dirname, "contracts", "Aluguel.sol");
const source = fs.readFileSync(LoteriaPath, "utf8");

// * Mais informações sobre o input e output
// * https://docs.soliditylang.org/en/v0.7.4/using-the-compiler.html#output-description
var input = {
  language: "Solidity",
  sources: {
    "Aluguel.sol": {
      content: source,
    },
    // Pode-se adicionar outros contratos, caso exista
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};
let contratoCompilado = JSON.parse(solc.compile(JSON.stringify(input)));


// Pedimos apenas o nosso contrato para exportação
module.exports = contratoCompilado.contracts["Aluguel.sol"].Aluguel;