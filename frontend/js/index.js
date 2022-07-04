$(() => {
  //Start coding here!
  //Creating new account
  $("#accountForm").submit((event) => {
    event.preventDefault();
    const newAccountName = $("#account_input").val();
    if (newAccountName === "" || $.inArray(newAccountName, userList) !== -1) {
      alert("Pls enter valid user name");
    } else {
      //Create New Account
      $.ajax({
        url: "http://localhost:3000/accounts",
        type: "post",
        contentType: "application/json",
        dataType: "json",
        data: JSON.stringify({
          newAccount: {
            username: `${newAccountName}`,
            transactions: [],
          },
        }),
      })
        .done((data) => {
          userList.push(data.username);
          //Add a new user option tag
          createUserList(data.username, accountSelectList);
          createUserList(data.username, fromList);
          createUserList(data.username, toList);
          //create user account summary
          $("#summary_list").append(`
                  <li>Account Name: ${data.username}: Total Balance: ${data.transactions}</li>
              `);
          //Reset input
          $("#account_input").val("");
          alert("New account added");
          return userList;
        })
        .fail((error) => {
          alert(error);
        });
    }
  });

  //create user account summary list via data stored in server
  let userList = [];
  $(document).ready(() => {
    $.ajax({
      url: "http://localhost:3000/accounts",
      type: "get",
      contentType: "application/json",
      dataType: "json",
    }).done((data) => {
      let account_summary = $.map(data, (user) => {
        return `
                <li>Account Name: ${user.username}: Total Balance: ${user.transactions}</li>
              `;
      });
      $("#summary_list").append(account_summary);
      $.each(data, (index, value) => {
        createUserList(value.username, accountSelectList);
        createUserList(value.username, fromList);
        createUserList(value.username, toList);
      });
    });
  });

  // Function creates a user list
  function createUserList(newUserName, selectTag) {
    return selectTag.append(`
      <option value=${newUserName}>${newUserName}</option>
      `);
  }
  const accountSelectList = $("#accountSelect");
  const fromList = $("#fromSelect");
  const toList = $("#toSelect");

  //Show and hide select buttons
  const fromSelect = $("#fromButton");
  const toSelect = $("#toButton");
  const accountSelect = $("#accountButton");

  //Get value of ratio buttons
  $("input:radio[name='transactionType']").change(() => {
    let checkedRadio = $("input:radio[name='transactionType']:checked").val();
    console.log(checkedRadio);
    if (checkedRadio === "Deposit" || checkedRadio === "Withdraw") {
      fromSelect.hide();
      toSelect.hide();
    } else {
      fromSelect.show();
      toSelect.show();
    }

    checkedRadio === "Transfer" ? accountSelect.hide() : accountSelect.show();
  });

  //Add new category
  const categoryInput = $("#categoryInput");
  const categorySelect = $("#categorySelect");
  const newCategoryButton = $("#categoryButton");
  categoryInput.hide();
  newCategoryButton.hide();

  //Create category list
  $(document).ready(() => {
    $.ajax({
      url: "http://localhost:3000/categories",
      type: "get",
      contentType: "application/json",
      dataType: "json",
    }).done((data) => {
      console.log(data);
      let categoryOption = $.map(data, (item) => {
        return `
               <option value=${item.name.categoryName}>${item.name.categoryName}</option>
              `;
      });
      categorySelect.prepend(categoryOption);
    });
  });

  categorySelect.change((event) => {
    event.preventDefault();
    // console.log($("[name = category]").val());
    if ($("[name = category]").val() === "addNewCategory") {
      categoryInput.show();
      newCategoryButton.show();
    } else {
      categoryInput.hide();
      newCategoryButton.hide();
    }
  });

  newCategoryButton.click((event) => {
    event.preventDefault();
    const categoryInputValue = categoryInput.val();
    //Form validation and adding new category
    categoryInputValue.length > 0 &&
      $.ajax({
        url: "http://localhost:3000/categories",
        type: "post",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        data: JSON.stringify({
          newCategory: {
            categoryName: categoryInputValue,
          },
        }),
      }).done((data) => {
        const newCategoryOption = new Option(categoryInputValue);
        // $("#firstOption").remove();
        categorySelect.prepend(newCategoryOption);
        categoryInput.hide();
        newCategoryButton.hide();
        categoryInput.val("");
      });
  });

  //Add new transaction
  $("#transactionForm").submit((event) => {
    event.preventDefault();
    const transactionType = $("input[name='transactionType']:checked").val();
    const transactionCategory = categorySelect.val();
    const transactionAmount = Number($("#amount").val());
    const transactionDescription = $("#description").val();
    console.log(
      transactionType,
      transactionCategory,
      transactionAmount,
      transactionDescription
    );

    $.ajax({
      //Couldn't check the data
      url: "http://localhost:3000/transaction",
      type: "post",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
        newTransaction: {
          accountId: "1", // account ID for Deposits or Withdraws
          accountIdFrom: "1", // sender ID if type = 'Transfer', otherwise null
          accountIdTo: "1", // receiver ID if type = 'Transfer', otherwise null
          // all info from form
          type: `${transactionType}`,
          category: `${transactionCategory}`,
          description: `${transactionDescription}`,
          transactionAmount: `${transactionAmount}`,
        },
      }),
    })
      .done((data) => {
        console.log(data);
        $("#amount").val("");
        $("#description").val("");
        alert("New transaction added");
      })
      .fail((error) => {
        alert(error);
      });
  });
});
