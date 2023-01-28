const arrowBtnAry = document.querySelectorAll(".arrowButton");

arrowBtnAry.forEach(element => {
  element.addEventListener("click", function () {
    arrowButtonClick(this);
  });
});

function arrowButtonClick(event) {
  event.classList.toggle("active");
  if (event.closest(".groupItem") !== null) {
    event.closest(".groupItem").querySelector(".middleFlex").classList.toggle("hide");
  }
}