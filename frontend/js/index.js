$(() => {
  //Start coding here!
  //Form Check
  $("form").submit((event) => {
    event.preventDefault();
    console.log("Submitted");
  });

  let userList = [];
  //create user account summary list via data stored in server
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
  });

  //Get the value from account input
  $("#create_account_button").click((e) => {
    e.preventDefault();
    // console.log(userList);

    if (
      $("#account_input").val() === "" ||
      $.inArray($("#account_input").val(), userList) !== -1
    ) {
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
            username: `${$("#account_input").val()}`,
            transactions: [],
          },
        }),
      })
        .done((data) => {
          console.log(data.username);
          userList.push(data.username);
          //create user account summary
          $("#summary_list")
          .append(`
                  <li>Account Name: ${data.username}: Total Balance: ${data.transactions}</li>
              `);
        //Reset input
        $("#account_input").val('');
        return userList;
        })
        .fail((error) => {
          console.log(error);
        });
    }
  });
  const fromSelect = $("#fromButton");
  const toSelect = $("#toButton");
  const accountSelect = $("#accountButton"
  )

  //Get value of ratio buttons
  $("input:radio[name='r1']").change(() =>{
    let checkedRadio = $("input:radio[name='r1']:checked").val();
    console.log(checkedRadio);
    if(checkedRadio === "Deposit" || checkedRadio === "Withdraw"){
      fromSelect.hide();
      toSelect.hide();
    }else{
      fromSelect.show();
      toSelect.show();
    }

    checkedRadio === "Transfer" ? accountSelect.hide(): accountSelect.show();
  })

  //Add new category
  const categoryInput = $("#categoryInput");
  const categorySelect = $("#categorySelect");
  const newCategoryButton = $("#categoryButton")
  categoryInput.hide();
  newCategoryButton.hide();

  categorySelect.change((event) =>{
    event.preventDefault();
    // console.log($("[name = category]").val());
    if($("[name = category]").val() === "addNewCategory"){
      categoryInput.show();
      newCategoryButton.show();
    }else{
      categoryInput.hide();
      newCategoryButton.hide();
    }
  });

  newCategoryButton.click((event) =>{
    event.preventDefault()
    //Form validation
    if(categoryInput.val() === ''){
      console.log('Empty');
      return
    }else{
      console.log(categoryInput.val());
    }
  })
});
