class Account {
  constructor(username, transactions) {
    this.username = username;
    this.transactions = transactions;
  }

  get balance() {
    return this.transactions.reduce((total, transaction) => {
      return total + Number(transaction.transactionAmount);
    }, 0);
  }
}
