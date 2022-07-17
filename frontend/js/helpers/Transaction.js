export class Transaction {
  constructor(
    amount,
    account,
    accountIdFrom,
    accountIdTo,
    type,
    category,
    description,
    id
  ) {
    this.amount = amount;
    this.account = account;
    this.accountIdFrom = accountIdFrom;
    this.accountIdTo = accountIdTo;
    this.type = type;
    this.category = category;
    this.description = description;
    this.id = id;
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

class Transfer extends Transaction {
  constructor(accountIdFrom, accountIdTo) {
    super(accountIdFrom, accountIdTo);
    this.accountIdFrom = accountIdFrom;
    this.accountIdTo = accountIdTo;
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

export const validatedTransaction = (typeOfTransaction) => {
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
};

export const generateTransaction = (data, type) => {
  if (type === "Transfer") {
    return new Transfer(
      data.amount,
      data.account,
      data.accountIdFrom,
      data.accountIdTo,
      data.type,
      data.category,
      data.description,
      data.id
    );
  } else if (type === "Deposit") {
    return new Deposit(
      data.amount,
      data.account,
      data.accountIdFrom,
      data.accountIdTo,
      data.type,
      data.category,
      data.description,
      data.id
    );
  } else if (type === "Withdraw") {
    return new Withdrawal(
      data.amount,
      data.account,
      data.accountIdFrom,
      data.accountIdTo,
      data.type,
      data.category,
      data.description,
      data.id
    );
  }
};

export const postNewTransaction = (transactionData) => {
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
      console.log(data);
      //Update transaction table
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
      $("#amount").val("");
      $("#description").val("");
    })
    .fail((error) => {
      alert(error);
    });

  alert("Your transaction went through!!");
};

export const getTransactionData = () => {
  return $.ajax({
    url: "http://localhost:3000/transactions",
    type: "get",
    contentType: "application/json",
    dataType: "json",
  });
};
