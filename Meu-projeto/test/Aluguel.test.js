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
  it("Permite que uma conta seja adicionada", async () => {

    await aluguel.methods.setAtraso(3).send({
      from: contas[0],
      gas: "3000000",
    });

    await aluguel.methods.pagar().call({
      from: contas[0],
      value: web3.utils.toWei("0.2", "ether"),
    });

    const locador = await aluguel.methods.setPagamento().call({
      from: contas[0],
    });

    assert.strictEqual(contas[0], locador[0]);
    assert.strictEqual(1, locador.length);

  });

  it("Permite que varias contas sejam adicionadas", async () => {
    await aluguel.methods.pagar().call({
      from: contas[0],
      value: web3.utils.toWei("0.2", "ether"),
    });
    await aluguel.methods.pagar().call({
      from: contas[1],
      value: web3.utils.toWei("0.2", "ether"),
    });
    await aluguel.methods.pagar().call({
      from: contas[2],
      value: web3.utils.toWei("0.2", "ether"),
    });

    const locador = await aluguel.methods.setPagamento().call({
      from: contas[0],
    });

    assert.strictEqual(contas[0], locador[0]);
    assert.strictEqual(contas[1], locador[1]);
    assert.strictEqual(contas[2], locador[2]);

    assert.strictEqual(3, locador.length);
  });
  it("Verificando a quantidade mínima de ether", async () => {
    try {
      await aluguel.methods.pagar().send({
        from: contas[0],
        value: 0,
      });

      assert(false);
    } catch (err) {
      assert.ok(err);
    }
  });

  it("Somente o gerente pode fazer o sorteio", async () => {
    try {
      await aluguel.methods.pagar().call({
        from: contas[1],
      });

      assert(false);
    } catch (err) {
      assert.ok(err);
    }
  });
  it("Testando o contrato como um todo", async () => {
    await aluguel.methods.pagar().send({
      from: contas[0],
      value: web3.utils.toWei("2", "ether"),
    });

    const saldoInicial = await web3.eth.getBalance(contas[0]);

    await aluguel.methods.setPagamento().send({ from: contas[0] });

    const saldoFinal = await web3.eth.getBalance(contas[0]);

    const diferenca = saldoFinal - saldoInicial;

    assert(diferenca > web3.utils.toWei("1.8", "ether"));
  });
});
