// Get references to important elements on the webpage
let filterContainer = document.getElementById('filter');  // Container for active filters
let filters = filterContainer.querySelector('.filters');  // Area where filters are displayed
let clearBtn = document.getElementById('clear');  // Button to clear all filters
let ul = document.querySelector('.accounts-container');  // List where accounts are displayed

let filterArray = [];  // This array will store the active filters
getData();  // Call function to get data when the page loads

// Event listener for the "clear" button
clearBtn.addEventListener('click', clearBtnHandler);

// Function to fetch data from a JSON file and display it on the page
async function getData() {
  // Fetch the data from the 'data.json' file
  let res = await fetch('data.json');
  let response = await res.json();  // Convert the response to JSON format

  // Loop through each item in the response and create a list item for each
  response.forEach(res => {
    // Destructure the data to make it easier to use
    let {
      company, contract, logo, location, level, position, role,
      postedAt, featured, new:recent, tools, languages:lang, id,
    } = res;

    // Create a new list item (li) for each account
    let li = document.createElement('li');
    li.className = 'account card';  // Assign class names for styling
    li.id = id;  // Set the id of the list item

    // Set the inner HTML of the list item with account information
    li.innerHTML = `
      <div class="profile">
        <img src="${logo}" alt="image" class="profile-img">  <!-- Display company logo -->
        <div class="profile-info">
          <div class="row flex" id="rowTxts">
            <p class="name">${company}</p>  <!-- Company name -->
            <p class="tag blue">${recent ? 'New!' : ''}</p>  <!-- Tag if it's a new job -->
            <p class="tag black">${featured ? 'Featured' : ''}</p>  <!-- Tag if it's featured -->
          </div>
          <h3>${position}</h3>  <!-- Job position -->
          <div class="row">
            <small>${postedAt} <span>.</span></small>  <!-- Posting date -->
            <small>${contract} <span>.</span></small>  <!-- Contract type -->
            <small>${location}</small>  <!-- Job location -->
          </div>
        </div>
      </div>
      <div class="skillset flex">
        <!-- Skill tags for role, level, languages, and tools -->
        <p class="para" data-role="${role}">${role}</p>
        <p class="para" data-lev="${level}">${level}</p>
        <p class="para" data-lang="${lang[0]}">${lang[0] ? lang[0] : ''}</p>
        <p class="para" data-lang="${lang[1]}">${lang[1] ? lang[1] : ''}</p>
        <p class="para" data-lang="${lang[2]}">${lang[2] ? lang[2] : ''}</p>
        <p class="para" data-tool="${tools[0]}">${tools[0] ? tools[0] : ''}</p>
        <p class="para" data-tool="${tools[1]}">${tools[1] ? tools[1] : ''}</p>
      </div>
    `;
    ul.appendChild(li);  // Add the list item to the accounts container
    removeEmptyTags(li);  // Call function to clean up empty tags
  });

  // Add click event listeners to all skill tags (the "para" elements)
  let pTags = document.querySelectorAll('.para');
  pTags.forEach(p => p.addEventListener('click', () => tagHandler(p)));
}

/* EVENT-HANDLER FUNCTIONS */

// Function that handles clicking on a skill tag
function tagHandler(target) {
  let filter = target.innerText;  // Get the text from the clicked tag
  let dataObj = target.dataset;  // Get the data attribute of the clicked tag
  let name = Object.keys(dataObj);  // Get the name of the data attribute (role, level, etc.)
  let paras = document.querySelectorAll(`[data-${name}]`);  // Find all tags with the same data attribute

  // Add the 'active' class to matching tags
  paras.forEach(p => {
    if(p.innerText === filter) {
      p.classList.add('active');
    }
  });

  activateFilter(filter);  // Add the filter to the active filters list
  filterListItems();  // Update the displayed accounts based on active filters
}

// Function that handles removing a filter
function removeFilterHandler(elem) {
  let paras = document.querySelectorAll('p');
  elem.remove();  // Remove the filter from the list

  let text = elem.innerText.trim();  // Get the text of the filter
  let idx = filterArray.findIndex(item => {
    return item === text;
  });
  
  filterArray.splice(idx, 1);  // Remove the filter from the filter array
  filterListItems();  // Update the displayed accounts
  
  paras.forEach(p => {
    if(p.innerText === text) {
      p.classList.remove('active');  // Remove 'active' class from matching tags
    }
  });
  
  if(filters.innerHTML === '') {
    filterContainer.classList.remove('active');  // Hide filter container if no filters are active
  }
}

// Function that clears all filters when the "clear" button is clicked
function clearBtnHandler() {
  let lists = document.querySelectorAll('li');
  let paras = document.querySelectorAll('p');

  filters.innerHTML = '';  // Clear the filters display
  filterArray = [];  // Empty the filter array
  filterContainer.classList.remove('active');  // Hide the filter container
  
  // Show all accounts and remove the 'active' class from all tags
  lists.forEach(li => {
    li.classList.remove('hide');
  });
  paras.forEach(p => {
    p.classList.remove('active');
  });
}

/* LOGICS & HELPER FUNCTIONS */

// Function to remove empty tags from the list items
function removeEmptyTags(list) {
  let tags = list.querySelectorAll('.tag');
  let paras = list.querySelectorAll('.para');

  tags.forEach(tag => {
    if(tag.innerHTML === '') {
      tag.remove();  // Remove tags that have no content
    } 
    if(tag.innerHTML === 'Featured') {  
      list.classList.add('active');  // Highlight 'featured' accounts
    }
  });

  paras.forEach(p => {
    if(p.innerHTML === '') {
      p.remove();  // Remove skill tags that have no content
    }
  });
} 

// Function to add a new filter and display it
function activateFilter(data) {
  if(filterArray.includes(data)) { return; }  // Avoid adding duplicate filters

  filterContainer.classList.add('active');  // Show the filter container

  // Create a new filter element
  let filterElem = document.createElement('div');
  filterElem.className = 'filter flex';
  filterElem.innerHTML = `
    <p class="filter-txt para">${data}</p>
    <div class="remove"></div>
  `;

  filters.appendChild(filterElem);  // Add the filter element to the display
  filterArray.push(data);  // Add the filter to the filter array

  // Add click event to the 'remove' button of the filter
  let remove = filterElem.lastElementChild;
  remove.addEventListener('click', () => removeFilterHandler(filterElem));
}

// Function to show or hide accounts based on the active filters
function filterListItems() {
  let lists = document.querySelectorAll('li');

  for(let i = 0; i < lists.length; i++) {
    lists[i].classList.add('hide');  // Hide all accounts initially
  }

  let set = new Set(filterArray);  // Remove duplicate filters
  let arr = [...set];  // Convert set back to array

  // Loop through each account to check if it matches the active filters
  for(let j = 0; j < lists.length; j++) {
    let roles = lists[j].querySelectorAll('[data-role]');
    let levels = lists[j].querySelectorAll('[data-lev]');
    let langs = lists[j].querySelectorAll('[data-lang]');
    let tools = lists[j].querySelectorAll('[data-tool]');

    // Collect all skills (roles, levels, languages, tools) from the account
    let listItems = pushItemsToArray([roles, levels, langs, tools]); 

    // Check if every active filter matches the account's skills
    let boolean = arr.every(item => {
      return listItems.includes(item);
    });

    if(boolean) {
      lists[j].classList.remove('hide');  // Show the account if it matches the filters
    }
  }
}

// Helper function to collect skill text from different categories (roles, levels, etc.)
function pushItemsToArray(arr) {
  let arrayOfTexts = [];

  // Loop through each category and add the skill text to the array
  for(let i = 0; i < arr.length; i++) {
    arr[i].forEach(item => {
      arrayOfTexts.push(item.innerText);
    });
  }

  return arrayOfTexts;  // Return the array of skill texts
}