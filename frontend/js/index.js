$(() => {
  //Start coding here!
  //Form Check
  $("form").submit((event) => {
    event.preventDefault();
    console.log("Submitted");
  });

  //create user account summary list via data stored in server
  $.ajax({
    url: "http://localhost:3000/accounts",
    type: "get",
    contentType: "application/json",
    dataType: "json",
  }).done((data) => {
    console.log(data);
    let account_summary = $.map(data, (user) => {
      return `
              <li>Account Name:${user.username}: Total Balance:${user.transactions}</li>
            `;
    });
    $("#summary_list").append(account_summary);
  });

  //Get the value from account input
  $("#create_account_button").click((e) => {
    e.preventDefault();
    if (
      $("#account_input").val() === "" ||
      $.inArray($("#account_input").val(), name) !== -1
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
          console.log(data);
          //create user account summary
          $("#summary_list")
          .append(`
                  <li>Account Name: ${data.username}: Total Balance: ${data.transactions}</li>
              `);
        //Reset input
        $("#account_input").val('');
        })
        .fail((error) => {
          console.log(error);
        });
    }
  });
});
