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

export class Deposit extends Transaction {
  get value() {
    return this.amount;
  }
}

class Transfer extends Transaction {
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
    super(accountIdFrom, accountIdTo);
    this.amount = amount;
    this.account = account;
    this.accountIdFrom = accountIdFrom;
    this.accountIdTo = accountIdTo;
    this.type = type;
    this.category = category;
    this.description = description;
    this.id = id;
  }
}

let transactionAmount;
let transactionUserName;
let userAccountId;
let userAccountIdFrom;
let userAccountIdTo;

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
  return $.ajax({
    url: "https://simple-transaction-tracker.herokuapp.com/transaction",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({
      newTransaction: transactionData,
    }),
  });
};

export const getTransactionData = () => {
  return $.ajax({
    url: "https://simple-transaction-tracker.herokuapp.com/transactions",
    method: "get",
    contentType: "application/json",
    dataType: "json",
  });
};

export const createTransactionTable = (transactionData) => {
  const newTd = `
    <tr class="transactionRow focus:outline-none h-20 text-sm leading-none text-gray-800 dark:text-white  bg-white dark:bg-gray-800  hover:bg-gray-100 dark:hover:bg-gray-900  border-b border-t border-gray-100 dark:border-gray-700">
      <td>${transactionData.id}</td>
      <td>${transactionData.account}</td>
      <td>${transactionData.type}</td>
      <td>${transactionData.category}</td>
      <td>${transactionData.description}</td>
      <td>${transactionData.amount}</td>
      <td>${transactionData.accountIdFrom}</td>
      <td>${transactionData.accountIdTo}</td>
    </tr>
    `;
  // return newTd;
  $("#transactionTable").append(newTd);
};

export const updateTransactionTable = (user) => {
  const td = $.map(user, (element) => {
    return `
      <tr class="transactionRow focus:outline-none h-20 text-sm leading-none text-gray-800 dark:text-white  bg-white dark:bg-gray-800  hover:bg-gray-100 dark:hover:bg-gray-900  border-b border-t border-gray-100 dark:border-gray-700">
        <td>${element.id}</td>
        <td>${element.account}</td>
        <td>${element.type}</td>
        <td>${element.category}</td>
        <td>${element.description}</td>
        <td>${element.amount}</td>
        <td>${element.accountIdFrom}</td>
        <td>${element.accountIdTo}</td>
      </tr>
    `;
  });
  $("#transactionTable").append(td);
  // $.each(user, (index, Array) => {
  //   console.log(Array);
  // });
};
