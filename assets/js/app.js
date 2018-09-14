var state = {
  booksAdded: []
}
//get data
function getDataFromAPI(searchTerm, callback) {
  const key ='JkHqD0lI3xZJpJhwR4gtg';
  const GOODREADS_SEARCH_URL = 'https://www.goodreads.com/search/index.xml?key=' + key + '&q=' + searchTerm;
  const query = {
    q: "select * from xml where url=\""+GOODREADS_SEARCH_URL+"\"",
    format: "json"
  }
  $.get("http://query.yahooapis.com/v1/public/yql", query, callback);
}

//state fun
var addBook = function (state, title, cover) {
  var item = {
      book : {
          bookTitle: title,
          coverURL: cover,
          entries: [],
          numOfEntries: 0
        }
  }
  var oldList = JSON.parse(localStorage.getItem('bookList')) || [] ;
  state.booksAdded.push(item);
  oldList.push(item);
  localStorage.setItem('bookList', JSON.stringify(oldList));
};



//render fun.
function renderResult(result){
  return `
    <li class="js-search_result">
      <a class="js-result_thumb" href="https://www.goodreads.com/book/show/${result.best_book.id.content}" target="_blank" ><img class="js-result_thumb_img" src="${result.best_book.image_url}"></a>
      <br>
      <div class="js-result_info_box">
        <h3 class="js-result_title">${result.best_book.title}</h3>
        <h4 class="js-result_author"><a href="https://www.goodreads.com/author/show/${result.best_book.author.id.content}" target="_blank" >${result.best_book.author.name}</a></h4>
        <h4 class="js-result_more_info"><a href="https://www.goodreads.com/book/show/${result.best_book.id.content}" target="_blank" >more info</a></h4>
      </div>
    </li>
    <hr>
  `;
}

function renderEntriesWindow(title){
  //change header to book title 
  $('.js-main_header').text(title);
  //find the num of entries to the required book
  var arr = state.booksAdded;
  var wantedBook = arr.find(function (obj) { return obj.book.bookTitle === title; });
  var getEntries = wantedBook.book.numOfEntries;
  //if there's no entires
  if (getEntries === 0) {
    var message = "look's like you have no entries yet, start by adding one here: ";
    var entry = `<div class="js-no_entry">
                    <h3 class="no_entry_message">${message}</h4>
                    <button class="add_entry"> + </button>
                 </div>`
    $('main').html(entry)
  }
  else {
    alert("enter")
  }
  //var entries = state.booksAdded.bookTitle
  //$('main').html("") 
}


//callback fun.
function renderData(data){
  const books = data.query.results.GoodreadsResponse.search.results.work;
  const booksNumber = data.query.results.GoodreadsResponse.search.results;
  if (Array.isArray(books)) {
    var results = books.map(function(book){ 
    return renderResult(book) 
    });
  }
  else {
    var results = renderResult(books);
    $(".js-results").html(results)
  }
  $(".js-results").html(results)
}

//event listen
function handleFormSubmit() {
$('#js-search_form').submit(function(event){
  event.preventDefault();
  const query = $(this).find("#js-search_entry").val();
  $(this).find("#js-search_entry").val("");
  var adjustedQuery = encodeURIComponent(query)
  console.log(adjustedQuery);
  getDataFromAPI(adjustedQuery, renderData)
  })
}

function handleBookSubmit() {
$('ul').on('click','.js-result_title', function(e) {
    var title = $(this).text();
    var coverURL = $('.js-result_thumb_img').attr('src');
    addBook(state,title,coverURL);
    renderEntriesWindow(title)
    //localStorage.setItem('bookTitle', title);
    //state.booksAdded.title = title;
})
}

$(function() {
  handleFormSubmit();
  handleBookSubmit()
})






