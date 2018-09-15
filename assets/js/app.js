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
          totalPages: 0,
          numOfEntries: 0,
          numOfPages: 0,
          isActive: false
        }
  }
  var oldList = JSON.parse(localStorage.getItem('bookList')) || [] ;
  state.booksAdded.push(item);
  oldList.push(state.booksAdded);
  localStorage.setItem('bookList', JSON.stringify(oldList));
};

var addEntry = function(state, bookTaken){
  var startNum = Number($('#start_page_num').val());
  var endNum = Number($('#end_page_num').val());
  var getEntriesArray = bookTaken.book.entries;
  var entryDetails = { 
    content: '', 
    session: getEntriesArray.length + 1,
    date: $('.session_date').text(),
    pageStart: startNum,
    pageEnd: endNum,
    pagesRead: (function() {
      return endNum - startNum
    })(),
  }
  if(startNum>endNum) {
        $('.pages_error').toggleClass('hidden');
      }
  else {
        var oldList = JSON.parse(localStorage.bookList);
        //getEntriesArray.push(entryDetails);
        //oldList.push(getEntriesArray);
        //console.log(oldList);
        //localStorage.setItem('bookList', JSON.stringify(oldList))
    }
}

var changeActiveState = function(bookTaken){
  var oldList = JSON.parse(localStorage.bookList) || [];
  var bookInHand = oldList[bookIndex];
  console.log(oldList);
  bookTaken.book.isActive = true;
  //oldList.push(bookTaken);
  // localStorage.setItem('bookList', JSON.stringify(oldList));  
}


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
  //get book object
  var bookTaken = getBookInHand(title);
  //change the active state
  changeActiveState(bookTaken);
  //find the num of entries of the required book
  var getEntries = bookTaken.book.numOfEntries; 
  //if there's no entires
  if (getEntries === 0) {
    var message = "look's like you have no entries yet, start by adding one here: ";
    var entry = `<div class="js-no_entry">
                    <h3 class="no_entry_message">${message}</h4>
                    <button class="btn-add_entry"> + </button>
                 </div>`
    $('.container').html(entry)
  }
  else {
    alert("enter")
  }
}

function renderEntryInputDetails(){
    var bookTaken = getActiveBook();
    //get sessionNum
    var getEntries = bookTaken.book.numOfEntries + 1;
    var form = `<form id="js-entry_details">
                    <h3 class='session_num'>session #: ${getEntries} </h3>
                    <h4 class='session_date'>${getDate()}</h4>
                    <span>pages from </span><input type="number" id="start_page_num" required></input>
                    <span class="pages_error hidden" >check the pages</span>
                    <span> to </span><input type="number" id="end_page_num" required></input>
                    <button type="submit" class="btn-submit_entry_details">Add entry</button>                    
                </form>`;
    $('.container').html(form)
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
  })
}

function handleAddEntryDetails() {
$('.container').on('click','.btn-add_entry', function(e) {
    renderEntryInputDetails();
  })
}

function handleSubmitEntry() {
$('.container').on('click','.btn-submit_entry_details', function(e) {
    e.preventDefault();
    var bookTaken = getActiveBook();
    addEntry(state, bookTaken);
  })
}

//general methods
var getBookInHand = function(title) {
  var arr = state.booksAdded;
  var bookIndex = arr.findIndex(function (obj) { return obj.book.bookTitle === title; });
  var getBookInHand = state.booksAdded[bookIndex];
  return getBookInHand
}

var getActiveBook = function() {
  var arr = state.booksAdded;
  var bookIndex = arr.findIndex(function (obj) { return obj.book.isActive === true; });
  var getActiveBook = state.booksAdded[bookIndex];
  return getActiveBook
  }

var getTitle = function(){
  var title = $('.js-main_header').text();
  return title
}

var getDate = function(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1;
  var yyyy = today.getFullYear();

  if (dd<10){
    dd = '0'+ dd
  }
  if (mm<10) {
    mm = '0' + mm
  }

  today = dd + '-' + mm + '-' + yyyy;
  return today
}

$(function() {
  handleFormSubmit();
  handleBookSubmit();
  handleAddEntryDetails();
  handleSubmitEntry();
})






