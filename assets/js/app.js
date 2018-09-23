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
var addBook = function (title, cover) {
  var item = {
      book : {
          bookTitle: title,
          coverURL: cover,
          entries: [],
          pageOn: 1,
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
    active: true
  }
  if(startNum >= endNum || (startNum <= 0 || endNum <= 0 )) {
        $('.pages_error').toggleClass('hidden');
      }
  else if (startNum < endNum || (startNum >= 0 || endNum >= 0)) {
        $('.pages_error').addClass('hidden');
        //var oldList = JSON.parse(localStorage.bookList);
        getEntriesArray.push(entryDetails);
        //oldList.push(getEntriesArray);
        //console.log(oldList);
        //localStorage.setItem('bookList', JSON.stringify(oldList))
    }
}

var addEntryContent = function(content){
  var getEntry = getEntryBySession();
  getEntry.content = content;
}

var changeIsActiveTrue = function(title){;
  var bookTaken = getBookInHand(title);
  // var oldList = JSON.parse(localStorage.bookList) || [];
  // var bookInHand = oldList[bookIndex];
  // console.log(oldList);
  bookTaken.book.isActive = true;
  //oldList.push(bookTaken);
  // localStorage.setItem('bookList', JSON.stringify(oldList));  
}
var changeBookActiveFalse = function(){
  var item = state.booksAdded;
  var arr = item.map(function(token) {
    return token.book["isActive"] = false
  })
}

var changeEntryActiveState = function(entryTaken){
  entryTaken.active = false
}



var setPageStartToPageOn = function() {
  var entryTaken = getActiveEntry();
  var bookTaken = getActiveBook();
  entryTaken.pageStart = bookTaken.book.pageOn
}
var updateBook = function () {
  //get objects
  var entryTaken = getEntryBySession();
  var bookTaken = getActiveBook();
  //update book
  //up num of pages
  var getPagesFromEntry = entryTaken.pagesRead;
  bookTaken.book.numOfPages += getPagesFromEntry;
  //up num of entries
  bookTaken.book.numOfEntries += 1;
  changeEntryActiveState(entryTaken);
  //up pageOn 
  bookTaken.book.pageOn = entryTaken.pageEnd
}

var updateEdits = function (state){

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
  //find the num of entries of the required book
  var getEntries = bookTaken.book.numOfEntries; 
  //if there's no entires
  if (getEntries === 0) {
    var message = "look's like you have no entries yet, start by adding one here: ";
    var entry = `<div class="js-no_entry">
                    <h3 class="no_entry_message">${message}</h4>
                    <button class="btn-add_entry"> + </button>
                 </div>`
    var backIcon = '<i class="back-home_page fas fa-arrow-left"></i>'
    $('.handle').html(backIcon);
    $('.container').html(entry)
  }
  else {
    renderEntriesList();
  }
}

 function renderEntriesList(){
  var bookTaken = getActiveBook();
  //iterate over each entry and add them into an array
  var entryArrList = bookTaken.book.entries.map(function(entry) {
                  return `<div class="js-entry">
                           <h3># </h3><h3 class="entry_session">${entry.session}</h3> ,<h3 class="entry_pages">pages ${entry.pageStart} - ${entry.pageEnd}</h3>
                           <h4 class="entry_date">${entry.date}</h4>
                           <div class="js-entry_paragraph">
                             <p class="entry_content">${entry.content}</p>
                           </div>
                          </div>`
  })
  var joinedArray = entryArrList.join("");
  var render = `<div class="js-entires_container">
                    ${joinedArray}
                    <button class="btn-add_entry">+</button>
                </div>`
  var backIcon = '<i class="back-home_page fas fa-arrow-left"></i>'
  $('.handle').html(backIcon);
  $('.container').html(render)
}


function renderEntryInputDetails(){
    var bookTaken = getActiveBook();
    //get sessionNum
    var getEntries = bookTaken.book.numOfEntries + 1;
    //check for first entry
    var checkEntry = (function() {
      if(bookTaken.book.numOfEntries === 0){
        return `<input type="number" id="start_page_num" required></input>`
      }
      else if (bookTaken.book.numOfEntries > 0) {
          return `<input type="number" id="start_page_num" value="${bookTaken.book.pageOn}" readonly></input>`
      }
    })();

    var form = `<form id="js-entry_details">
                    <h3 class='session_num'>session #: <span class='session_num_num'>${getEntries} </span></h3>
                    <h4 class='session_date'>${getDate()}</h4>
                    <span>pages from </span>${checkEntry}
                    <span class="pages_error hidden">check the pages</span>
                    <span> to </span><input type="number" id="end_page_num" required></input>
                    <button type="submit" class="btn-submit_entry_details">Add entry</button>                    
                </form>`
    var backIcon = '<i class="back-entries_page fas fa-arrow-left"></i>'
    $('.handle').html(backIcon)
    $('.container').html(form)
}

function renderEntriesInput(){
  //get book object
  var bookTaken = getActiveBook();
  var entryTaken = getEntryBySession();
  var startPage = entryTaken.pageStart;
  var endPage = entryTaken.pageEnd;
  var sessionNum = entryTaken.session;
  var entryDate = entryTaken.date;
  var entryContent = entryTaken.content

  var sessionDetails = `<div class="js-session_details">
                            <h3 class='session_num'>session #: <span class='session_num_num'>${sessionNum}</span></h3>
                            <h4 class='session_date'>${entryDate}</h4>
                            <h4>pages: ${startPage} - ${endPage}</h4>                 
                        </div>`

  var inputArea = `     <div class="js-text_input">
                            <textarea class="text_input_area">${entryContent}</textarea>
                        </div>`

  var entryWindow = `<div class="js-input_window">
                        ${sessionDetails}
                        <hr>
                        ${inputArea}
                        <button class="btn-submit_text_input">+</button>
                     </div>`

  $('.container').html(entryWindow)
}


function renderEntriesEditInput(){
  //get book object
  var bookTaken = getActiveBook();
  var entryTaken = getEntryBySession();
  var startPage = entryTaken.pageStart;
  var endPage = entryTaken.pageEnd;
  var sessionNum = entryTaken.session;
  var entryDate = entryTaken.date;
  var entryContent = entryTaken.content

  var sessionDetails = `<div class="js-session_details">
                            <h3 class='session_num'>session #: <span class='session_num_num'>${sessionNum}</span></h3>
                            <h4 class='session_date'>${entryDate}</h4>
                            <h4>pages: ${startPage} - ${endPage}</h4>                 
                        </div>`

  var inputArea = `     <div class="js-text_input">
                            <textarea class="text_input_area">${entryContent}</textarea>
                        </div>`

  var entryWindow = `<div class="js-input_window">
                        ${sessionDetails}
                        <hr>
                        ${inputArea}
                        <button class="btn-submit_text_input_edit">+</button>
                     </div>`

  var backIcon = '<i class="back-entries_page fas fa-arrow-left"></i>'
  $('.handle').html(backIcon); 
  $('.container').html(entryWindow)
}


function renderEntryView(sessionNum,pages,date,entryContent) {
  var adjustedContent  = entryContent.replace(/\n/g, "<br>");
  
  var sessionDetails = `<div class="js-view_session_details">
                            <h3 class='session_num'>session #: <span class='session_num_num'>${sessionNum}</span></h3>
                            <h4 class='session_date'>${date}</h4>        
                            <h4>${pages}</h4>
                        </div>`

  var contentArea = `<div class="js-view-text_display">
                            <p>${adjustedContent}</p>
                     </div>`

  var entryWindow = `<div class="js-view_window">
                        ${sessionDetails}
                        <hr>
                        ${contentArea}
                        <button class="btn-edit_current_entry">Edit</button>
                     </div>`

  var backIcon = '<i class="back-entries_page fas fa-arrow-left"></i>'
  $('.handle').html(backIcon);     
  $('.container').html(entryWindow)
}

 function renderHomePage(){
  //iterate over each book and add them into an array
  var bookList = state.booksAdded.map(function(item) {
                  return `<div class="js-book_detail">
                            <img class="book_img" src="
                            ${item.book.coverURL}">
                            <div class="book_detail">
                              <h2 class='book_detail_title'>${item.book.bookTitle}</h2>
                              <hr>
                              <h4 class='book_detail_progress'>progress: <span class="'book_detail_progress_num">%76</span></h4>
                              <h4 class='book_detail_page'>p<span class="'book_detail_page_on_num">${item.book.pageOn}</span>/<span class="'book_detail_page_off_num">300</span></h4>
                              <h4 class='book_detail_sessions'>sessions: <span class="'book_detail_sessions_num">${item.book.numOfEntries}</span></h4>
                            </div>
                          </div>`
  })
  var joinedArray = bookList.join("");
  var render = `<div class="js-books_window">
                    ${joinedArray}
                    <button class="btn-add_book">add a new book</button>
                </div>`
  var mainNavIcon = '<i class="fas fa-bars"></i>'
  $('.handle').html(mainNavIcon);
  $('.container').html(render)
}

 function renderSearchPage(){
  var render = `<div class="search_box">
                  <form id="js-search_form">
                    <label for="search-label">Search for your book:  </label>
                    <input type="text" name="js-search_entry" id="js-search_entry" placeholder="title or author of the book">
                    <button class="btn-search_book" type="submit">Search</button>
                  </form>

                  <ul class="js-results">
                  <!--items will be added here-->
                  </ul>
                </div>`

  var backIcon = '<i class="back-home_page fas fa-arrow-left"></i>'
  $('.handle').html(backIcon);
  $('.container').html(render)
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
  getDataFromAPI(adjustedQuery, renderData);
  })
}

function handleSearchSubmit() {
$('.container').on('submit','#js-search_form', function(e){
  event.preventDefault();
  const query = $(this).find("#js-search_entry").val();
  $(this).find("#js-search_entry").val("");
  var adjustedQuery = encodeURIComponent(query);
  getDataFromAPI(adjustedQuery, renderData);
  })
}

function handleBookSubmit() {
$('.container').on('click','.js-result_title', function(e) {
    var title = $(this).text();
    var coverURL = $(this).closest('.js-search_result').find('.js-result_thumb_img').attr('src');
    console.log(coverURL)
    addBook(title,coverURL);
    renderEntriesWindow(title);
    changeIsActiveTrue(title);
  })
}

function handleAddEntryDetails() {
$('.container').on('click','.btn-add_entry', function(e) {
    renderEntryInputDetails();
  })
}

function handleAddEntry() {
$('.container').on('click','.btn-submit_entry_details', function(e) {
    e.preventDefault();
    var bookTaken = getActiveBook();
    addEntry(state, bookTaken);
    var entryTaken = getActiveEntry();
    updateBook();
    renderEntriesInput()
  })
}

function handleSubmitEntryContent() {
$('.container').on('click','.btn-submit_text_input', function(e) {
    var title= $('.js-main_header').text();
    var content = $('.text_input_area').val();
    addEntryContent(content);
    renderEntriesWindow(title)
  })
}

function handleEntryView() {
$('.container').on('click','.js-entry', function(e) {
    var sessionNum = $(this).find('.entry_session').text();
    var pages = $(this).find('.entry_pages').text();
    var date = $(this).find('.entry_date').text();
    var entryContent = $(this).find('.entry_content').text();
    renderEntryView(sessionNum,pages,date,entryContent);
  })
}

function handleEntryEdit() {
$('.container').on('click','.btn-edit_current_entry', function(e) {
    getEntryBySession();
    renderEntriesEditInput()
  })
}

function handleSubmitEntryEdit() {
$('.container').on('click','.btn-submit_text_input_edit', function(e) {
    var title= $('.js-main_header').text();
    var content = $('.text_input_area').val();
    addEntryContent(content);
    renderEntriesWindow(title)
  })
}

function handleAddNewBook(){
  $('.container').on('click','.btn-add_book', function(e) {
    renderSearchPage();
  })
}

function handleViewBookEntries() {
$('.container').on('click','.book_detail_title', function(e) {
    var title= $(this).text();
    changeIsActiveTrue(title);
    renderEntriesWindow(title)
  })
}



//navigation listeners
function handleBackHome() {
$('.navbar').on('click','.back-home_page', function(e) {
    $('.js-main_header').text('Reflect')
    var bookTaken = getActiveBook();
    changeBookActiveFalse(bookTaken);
    renderHomePage();
  })
}

function handleBackEntries() {
$('.navbar').on('click','.back-entries_page', function(e) {
    var bookTaken = getActiveBook();
    var title = bookTaken.book.bookTitle;
    renderEntriesWindow(title)
  })
}








































//general methods
var getBookInHand = function(title) {
  var arr = state.booksAdded;
  var bookIndex = arr.findIndex(function (obj) { return obj.book.bookTitle === title; });
  var getBookInHand = state.booksAdded[bookIndex];
  return getBookInHand
}

var checkActiveBook = function(){
  var books = state.booksAdded;
  function hasValue (obj, key, value) {
    return obj.book.hasOwnProperty(key) 
  }
}

var getActiveEntry = function() {
  var activeBookIndex = getActiveBook();
  var entry = activeBookIndex.book.entries;
  var getActiveEntry = entry.find(function (obj){ return obj.active === true; });
  return getActiveEntry
}

var getEntryBySession = function() {
  var activeBookIndex = getActiveBook();
  var entry = activeBookIndex.book.entries;
  var activeSession = Number($('.session_num_num').text());
  var getActiveEntry = entry.find(function (obj){ return obj.session === activeSession; });
  return getActiveEntry
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
  handleAddEntry();
  handleSubmitEntryContent();
  handleEntryView();
  handleEntryEdit();
  handleSubmitEntryEdit();
  handleBackHome();
  handleAddNewBook();
  handleSearchSubmit();
  handleViewBookEntries();
  handleBackEntries()
})






