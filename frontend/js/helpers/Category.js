const categoryInput = $("#categoryInput");
const categorySelect = $("#categorySelect");
const newCategoryButton = $("#categoryButton");

export const postNewCategory = (categoryInputValue) => {
  $.ajax({
    url: "https://simple-transaction-tracker.herokuapp.com/categories",
    method: "post",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({
      newCategory: {
        categoryName: categoryInputValue,
      },
    }),
  }).done((data) => {
    const newCategoryOption = new Option(categoryInputValue);
    $("#firstOption").remove();
    categorySelect.prepend(newCategoryOption);
    categoryInput.hide();
    newCategoryButton.hide();
    categoryInput.val("");
    alert("New category added!!");
  });
};

export const getCategoryData = () => {
  $.ajax({
    url: "https://simple-transaction-tracker.herokuapp.com/categories",
    type: "get",
    contentType: "application/json",
    dataType: "json",
  }).done((data) => {
    let categoryOption = $.map(data, (item) => {
      return `
               <option value=${item.name.categoryName}>${item.name.categoryName}</option>
              `;
    });
    categorySelect.prepend(categoryOption);
  });
};

getCategoryData();
