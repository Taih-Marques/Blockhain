const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const web3 = new Web3(ganache.provider());
const { abi, evm } = require("../compile");

let aluguel;
let contas;

beforeEach(async () => {
  contas = await web3.eth.getAccounts();
  aluguel = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ from: contas[0], gas: "1000000" });
});

describe("Contrato Aluguel", () => {
  it("Deploy a contract", () => {
    // console.log(inbox);
    assert.ok(aluguel.options.address);
  });

  it("Definir atraso", async () => {
    await aluguel.methods.setAtraso(1).send({
      from: contas[0],

    });
    const atraso = await aluguel.methods.getAtraso().call({
      from: contas[0],
    })

    assert.strictEqual(Number(atraso), 1);
  });
  
  it("Definir pagamento", async() => {
    // Verificaar pagamento sem atraso
    await aluguel.methods.setPagamento().send({
      from: contas[0]
    })
    const pagamento = await aluguel.methods.getPagamento().call({
      from: contas[0]
    })

    assert.strictEqual(pagamento, web3.utils.toWei("30", "ether"))

    //Definir atraso e verificar pagamento com atraso
    await aluguel.methods.setAtraso(1).send({
      from: contas[1],
    });

    await aluguel.methods.setPagamento().send({
      from: contas[1],
    })
    const pagamento2 = await aluguel.methods.getPagamento().call({
      from: contas[1]
    })
    assert.strictEqual(pagamento2, web3.utils.toWei("60", "ether"))

  })

  it("Somente o locador pode pagar", async () => {
    try {
      await aluguel.methods.pagar().call({
        from: contas[1]
      });

      assert(false);
    } catch (err) {
      assert.ok(err);
    }
  });
  it("Testando o contrato como um todo", async () => {
    await aluguel.methods.setPagamento().send({
      from: contas[0],
    });
   

    const saldoInicial = await web3.eth.getBalance(contas[0]);

    await aluguel.methods.getPagamento().send({ from: contas[0] });

    const saldoFinal = await web3.eth.getBalance(contas[0]);

    const diferenca = saldoFinal - saldoInicial;

    assert(diferenca < web3.utils.toWei("30", "ether"));

  });
});