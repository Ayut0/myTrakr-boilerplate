export class Transaction {
  constructor(amount, account, accountIdFrom, accountIdTo, type, category, description) {
    this.amount = amount;
    this.account = account;
    this.accountIdFrom = accountIdFrom;
    this.accountIdTo = accountIdTo;
    this.type = type;
    this.category = category;
    this.description = description;
  }
  commit() {
    if (this.value < 0 && this.amount > this.account.balance) return;
    this.account.transactions.push(this.value);
    // this.account.balance += this.value;
  }
}

class Withdrawal extends Transaction {
  get value() {
    return -this.amount;
  }
}

class Deposit extends Transaction {
  get value() {
    return this.amount;
  }
}

class Transfer extends Transaction{
  constructor(accountIdFrom, accountIdTo){
    this.accountIdFrom = accountIdFrom;
    this.accountIdTo = accountIdTo;
    super(accountIdFrom, accountIdTo)
  }
}

let transactionAmount;
let transactionUserName;
let userAccountId;
let userAccountIdFrom;
let userAccountIdTo;
// let filteredAccount;
// let targetAccount;
// let targetAccountName;
// let targetAccountBalance;

export const validatedTransaction = (typeOfTransaction)=>{
  //Deposit and Withdraw
  if (typeOfTransaction === "Deposit" || typeOfTransaction === "Withdraw") {
    userAccountId = $("#accountSelect").val();
    transactionUserName = $("[name=accountSelect] option:selected").text();

    if (typeOfTransaction === "Deposit") {
      transactionAmount = Number($("#amount").val());
    } else {
      transactionAmount = -Number($("#amount").val());
    }
  }

  //Transfer
  if (typeOfTransaction === "Transfer") {
    userAccountId = $("#fromSelect").val();
    transactionUserName = $("[name=fromSelect] option:selected").text();
    userAccountIdFrom = $("[name=fromSelect] option:selected").text();
    userAccountIdTo = $("[name=toSelect] option:selected").text();

    //Check if the sender and receiver are the same account;
    if (userAccountIdFrom === userAccountIdTo) {
      alert(
        "I'm afraid you're about to transfer money to the same account...."
      );
      return;
    }

    if (transactionUserName === userAccountIdFrom) {
      transactionAmount = -Number($("#amount").val());
    } else {
      transactionAmount = Number($("#amount").val());
    }
  } else {
    userAccountIdFrom = null;
    userAccountIdTo = null;
  }
}

export const postNewTransaction = (transactionData) =>{
  $.ajax({
    url: "http://localhost:3000/transaction",
    type: "post",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({
      newTransaction: transactionData,
    }),
  })
    .done((data) => {
      //Update transaction table
      const instancedTransaction = new Transaction(
        data[0].userName,
        data[0].transactionAmount
      );
      //Get user data to update their balance
      $.ajax({
        url: "http://localhost:3000/accounts",
        type: "get",
        dataType: "json",
      }).done((data) => {
        $("#summary_list").empty();
        console.log(data);
        const userData = data.map((item) => {
          const instancedAccount = new Account(
            item.username,
            item.transactions
          );
          return instancedAccount;
        });
        console.log(userData);
      });

      const td = $.map(data, (item) => {
        return `
            <tr class="transactionRow focus:outline-none h-20 text-sm leading-none text-gray-800 dark:text-white  bg-white dark:bg-gray-800  hover:bg-gray-100 dark:hover:bg-gray-900  border-b border-t border-gray-100 dark:border-gray-700">
              <td>${item.id}</td>
              <td>${item.userName}</td>
              <td>${item.type}</td>
              <td>${item.category}</td>
              <td>${item.description}</td>
              <td>${item.transactionAmount}</td>
              <td>${item.accountIdFrom}</td>
              <td>${item.accountIdTo}</td>
            </tr>
            `;
      });
      $("#transactionTable").append(td);
      $("#amount").val("");
      $("#description").val("");
    })
    .fail((error) => {
      alert(error);
    });;

  alert("Your transaction went through!!");
}
