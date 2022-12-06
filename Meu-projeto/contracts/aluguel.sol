// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Aluguel {
    address payable gerente;
    address payable public locador;
    
    bool public alert = false;
    
    uint256 public atraso = 0;
    uint256 public aluguel = 30 ether;
    uint256 public pagamento;

    constructor(){
        //atribui o endereço do gerente à variável
        gerente = payable(msg.sender); 
    }
    
    function pagar() public payable{
        setPagamento();
        require(msg.value >= pagamento);
        gerente.transfer(address(this).balance);
        alert = false;
    }
    
    function setAtraso(uint256 dias) public{
        atraso = dias;
        setPagamento();
    }
    
    function setPagamento() public{
        if(atraso > 0){
            alert = true;
            pagamento = aluguel + (aluguel*2/100) + (aluguel*3/1000*atraso);
        } else{
            pagamento = aluguel;
        }
    }
    
}