class Account {
  constructor(username) {
    this.username = username;
    this.transactions = [1];
  }
  

  get balance() {
    return this.transactions.reduce((total, transaction) => {
      return total + transaction;
    }, 0);
  }
}
