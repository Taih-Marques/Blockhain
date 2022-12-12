import React, { useState, useEffect } from "react";
// Configuração para requisições na rede
import web3 from "./web3";
// Informação do contrato
import aluguel from "./aluguel";

const App = () => {
  // Cria variáveis e funções de alteração
  const [gerente, setGerente] = useState("");
  const [locador, setLocador] = useState("");
  const [saldo, setSaldo] = useState("");
  const [pagamento, setPagamento] = useState("");
  const [atraso, setAtraso] = useState("");
  const [mensagem, setMensagem] = useState("");

  // Função assincrona que carrega os dados do contrato
  const carregarDados = async () => {
    // Pega a carteira do gerente do contrato
    const _gerente = await aluguel.methods.getGerente().call();
    // Pega a carteira dos jogadores
    const _locador = await aluguel.methods.getLocador().call();
    // Pega o valor total vinculado ao contrato
    const _saldo = await web3.eth.getBalance(aluguel.options.address);

    // Armazena os valores nas variáveis de gerente, locador e saldo
    setGerente(_gerente);
    setLocador(_locador);
    setSaldo(_saldo);
  };
  // Antes da página carregar ele chama seu conteúdo
  useEffect(() => {
    // Busca dados do contrato
    carregarDados();
  }, []);

  // * Realiza um pagamento
  const pagar = async (event) => {
    try {
      // Evita que a página seja recarregada
      event.preventDefault();
      // Altera valor da mensagem exibida
      setMensagem("Aguardando a  validação da transação...");
      // Pega contas do metamask
      const contas = await web3.eth.getAccounts();
      // console.log(contas);

      // Joga passando valor da conta principal e o valor de ether em wei
      await aluguel.methods.pagar().send({
        from: contas[0],
        value: web3.utils.toWei(pagamento, "ether"),
      });
      // Recarrega dados da página
      await carregarDados();
      // Altera mensagem
      setMensagem("Transação concluida!");
    } catch (error) {
      // Caso o usuário cancele a solicitação no metamask
      if (error.code === 4001) {
        setMensagem("Transação cancelada!");
      } else {
        // Caso algo esteja fora das políticas do contrato
        setMensagem("Transação vai contra regras do contrato");
      }
    }
  };
  // * Realiza sorteio
  const setDiasAtraso = async (event) => {
    try {
      event.preventDefault();
      // Altera mensagem
      setMensagem("Aguardando processamento...");
      // Pega contas do metamask
      const contas = await web3.eth.getAccounts();
      // Solicita sorte e manda conta que está realizando o sorteio
      await aluguel.methods.setAtraso(atraso).send({
        from: contas[0],
      });
      // Altera mensagem
      setMensagem(`Definido ${atraso} dias de atraso`);
    } catch (error) {
      // Caso o usuário cancele a solicitação no metamask
      if (error.code === 4001) {
        setMensagem("Transação cancelada!");
      } else {
        // Caso algo esteja fora das políticas do contrato
        setMensagem("Transação vai contra regras do contrato");
      }
    }
  };
  return (
    <div>
      <h2>Contrato de Aluguel</h2>
      <p>Este contrato é gerenciado por {gerente}</p>
      <p>
        Existem {locador.length} pagando a conta{" "}
        {web3.utils.fromWei(saldo, "ether")} ether
      </p>
      <br />
      <form onSubmit={setDiasAtraso}>
        <h4>Digite quantos dias de atraso:</h4>
        <div>
          <input
            value={atraso}
            // Altera o valor que está sendo apostado
            onChange={(event) => setAtraso(event.target.value)}
          />
        </div>
        <button>Pagar</button>
      </form>
      <hr />
      <form onSubmit={pagar}>
        <h4>Quantidade de ether para ser enviado:</h4>
        <div>
          <input
            value={pagamento}
            // Altera o valor que está sendo apostado
            onChange={(event) => setPagamento(event.target.value)}
          />
        </div>
        <button>Pagar</button>
      </form>
      <hr />
      {/* Mostra mensagem ao usuário */}
      <h1>{mensagem}</h1>
    </div>
  );
};

export default App;
