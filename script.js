let defaultDeck = [];
let deck = [];
let hand = [];

let tempHand = [];

document.querySelector('#fileInput').addEventListener('change', handleFileUpload);
document.querySelector('#shuffleDeck').addEventListener('click', shuffleDeck);
document.querySelector('#resetDeck').addEventListener('click', resetDeck);
document.querySelector('#clearHand').addEventListener('click', clearHand);
document.querySelector('#drawCard').addEventListener('click', drawCard);

document.querySelector('#editorFileInput').addEventListener('change', uploadJSON);

function handleFileUpload(event) {
	const file = event.target.files[0];
	if (!file) return;
	const reader = new FileReader();
	reader.onload = function (e) {
		try {
			createDeck(JSON.parse(e.target.result));
		} catch (error) {
			console.error('Invalid JSON file', error);
		}
	};
	reader.readAsText(file);
}

function createDeck(cards) {
	deck = [];
	defaultDeck = cards;

	let index = 1;
	cards.forEach((card) => {
		for (let i = 0; i < card.count; i++) {
			card.id = index;
			index++;
			deck.push(card);
		}
	});

	//appendDeck(cards);
	saveToLocalStorage();
	displayHand();
	//clearHand();
}

function appendDeck(cards) {
	const currentUrl = window.location.href;
	const url = new URL(currentUrl);
	url.searchParams.set('deck', encodeURIComponent(btoa(JSON.stringify(cards))));
	console.log(JSON.stringify(cards));
	history.pushState(null, '', url.toString());
}

function clearHand() {
	const handElement = document.querySelector('#hand');
	const selected = document.querySelectorAll('#hand .selected');
	if (selected.length > 0) {
		selected.forEach((card) => {
			let index = [...card.parentNode.children].indexOf(card);
			console.log(index)
			handElement.children[index].remove();
			hand.splice(index, 1);
		});
		document.querySelector('.card-draw-container').classList.remove('active');
	}
	else {
		hand = [];
	}

	displayHand();
}

function resetDeck() {
	createDeck(defaultDeck);
}

function shuffleDeck() {
	for (let i = deck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[deck[i], deck[j]] = [deck[j], deck[i]];
	}
	saveToLocalStorage();
	displayHand();
}

function drawCard() {
	if (deck.length === 0) return;
	const card = deck.shift();
	hand.push(card);
	saveToLocalStorage();
	displayHand();
}

function displayDeck() {
	const cardContainer = document.querySelector('#deck');
	cardContainer.innerHTML = '';

	deck.forEach(card => {
		cardContainer.appendChild(getCardHTML(card));
	});

	updateStats();
}

function drawCards(draw, keep) {
	if (deck.length < draw) return;
	tempHand = [];
	const container = document.querySelector('.card-draw-container');

	for(let i = 0; i < draw; i++) {
		tempHand.push(deck.shift());
	}

	if (keep === 1) {
		container.querySelector('h1').innerHTML = `Select a Card`
	}

	if (keep > 1) {
		container.querySelector('h1').innerHTML = `Select ${keep} Cards`
	}

	const tempContainer = document.querySelector('#temp');
	displayHandCustom(tempHand, tempContainer);
}

function selectCards() {
	const selected = document.querySelectorAll('#temp .selected');
	selected.forEach((card) => {
		hand.push(tempHand[[...card.parentNode.children].indexOf(card)])
	});

	document.querySelector('.card-draw-container').classList.remove('active');

	displayHand();
}

function displayHandCustom(customHand, customContainer) {
	customContainer.innerHTML = '';

	customHand.forEach(card => {
		customContainer.appendChild(getCardHTML(card));
	});

	setTimeout(()=> {
		document.querySelector('.card-draw-container').classList.add('active');
	}, 200)

	displayHand();
}

function displayHand() {
	const cardContainer = document.querySelector('#hand');
	cardContainer.innerHTML = '';

	hand.forEach(card => {
		cardContainer.appendChild(getCardHTML(card));
	});
	
	updateStats();
	saveToLocalStorage();
	displayDeck();
}

function handleCard(event) {
	const card = event.target;
	card.closest('.card').classList.toggle('selected');
}

function updateStats() {
	let timeBonus = 0;

	hand.forEach(card => {
		if (card.bonusAmount && card.type === 'time') {
			timeBonus += parseInt(card.bonusAmount);
		}
	});

	document.querySelector('#stat-time-bonus bold').innerHTML = timeBonus;
}

function getCardHTML(card) {
	const cardElement = document.createElement('div');
	cardElement.dataset.id = card.id;
	cardElement.setAttribute('onclick', 'handleCard(event)');
	cardElement.classList.add('card');

	let cardContent = `<h3>${card.title}</h3><span class="card-type">${card.type}</span>`;

	if (card.description) {
		cardContent += `<p>${card.description}</p>`;
	}

	if (card.bonusAmount && card.type === 'time') {
		cardContent += `<div class="time-bonus"><span>${card.bonusAmount}</span><span>MIN</span></div>`;
	}

	if (card.requirement) {
		cardContent += `<p class="cost"><strong>Casting Cost:</strong> ${card.requirement}</p>`;
	}

	cardElement.innerHTML = cardContent;
	return cardElement;
}


function saveToLocalStorage() {
	localStorage.setItem('deck', JSON.stringify(deck));
	localStorage.setItem('hand', JSON.stringify(hand));
	localStorage.setItem('defaultDeck', JSON.stringify(defaultDeck));
	localStorage.setItem('editorDeck', JSON.stringify(items));
}

function loadFromLocalStorage() {
	const savedDeck = localStorage.getItem('deck');
	const savedHand = localStorage.getItem('hand');
	const savedDefault = localStorage.getItem('defaultDeck');
	const editorDeck = localStorage.getItem('editorDeck');

	if (savedDeck) deck = JSON.parse(savedDeck);
	if (savedHand) hand = JSON.parse(savedHand);
	if (savedDefault) defaultDeck = JSON.parse(savedDefault);
	if (editorDeck) loadItems(JSON.parse(editorDeck));

	else if (new URLSearchParams(window.location.search).has('deck')) {
		createDeck(JSON.parse(atob(decodeURIComponent(new URLSearchParams(window.location.search).get('deck')))))
	}

	displayHand();
}

document.addEventListener('DOMContentLoaded', loadFromLocalStorage);


/*


function saveToLocalStorage() {
	localStorage.setItem('deckData', {
		deck: JSON.stringify(deck),
		hand: JSON.stringify(hand),
		defaultDeck: JSON.stringify(defaultDeck)
	});
}

function loadFromLocalStorage() {
	const deckData = localStorage.getItem('deckData');

	if (deckData.deck && deckData.hand && deckData.defaultDeck) {
		deck = JSON.parse(savedDeck);
		hand = JSON.parse(savedHand);
		defaultDeck = JSON.parse(savedDefault);
	}
	else if (new URLSearchParams(window.location.search).has('deck')) {
		console.log('deck exists');
	}
	
	displayHand();
}
	*/



//EDITOR CODE
let items = [];

// Function to update item whenever an input changes
function autoSave() {
	const editors = document.querySelectorAll('.item-editor:not(.deleted)');
	items = [];

	editors.forEach((editor, index) => {
		const titleElement = editor.querySelector('.title');
		const title = titleElement.value.trim();
		const descriptionElement = editor.querySelector('.description');
		const description = descriptionElement.value.trim();
		const type = editor.querySelector('.type').value;
		const requirementElement = editor.querySelector('.requirement');
		const requirement = requirementElement.value.trim();
		const bonusAmountElement = editor.querySelector('.bonusAmount');
		const bonusAmount = parseInt(bonusAmountElement.value, 10);
		const count = parseInt(editor.querySelector('.count').value, 10) || 1;

		let newItem = {};

		titleElement.closest('.editor-container').style.display = '';
		descriptionElement.closest('.editor-container').style.display = '';
		requirementElement.closest('.editor-container').style.display = '';
		bonusAmountElement.closest('.editor-container').style.display = '';

		if (type === 'time') {
			titleElement.closest('.editor-container').style.display = 'none';
			descriptionElement.closest('.editor-container').style.display = 'none';
			requirementElement.closest('.editor-container').style.display = 'none';

			newItem = {
				title: 'Time Bonus',
				type: type,
				bonusAmount: bonusAmount || 0,
				count: count
			};
		} else if (type === 'powerup') {
			descriptionElement.closest('.editor-container').style.display = 'none';
			requirementElement.closest('.editor-container').style.display = 'none';
			bonusAmountElement.closest('.editor-container').style.display = 'none';

			newItem = {
				title: title || 'No title provided',
				type: type,
				bonusAmount: bonusAmount || 0,
				count: count
			};
		} else if (type === 'curse') {
			bonusAmountElement.closest('.editor-container').style.display = 'none';

			newItem = {
				title: title || 'No title',
				description: description.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>') || 'No description',
				type: type,
				requirement: requirement || 'No requirement',
				bonusAmount: bonusAmount || 0,
				count: count
			};
		}

		// Update the item in the array
		items[index] = newItem;
	});

	items = items.sort((a, b) => {
        const order = { curse: 1, powerup: 2, time: 3 };

        // If both items are "time" cards, sort by bonusAmount
        if (a.type === "time" && b.type === "time") {
            return a.bonusAmount - b.bonusAmount;
        }

        // Otherwise, sort by type order
        return order[a.type] - order[b.type];
    });

	items.sort((a, b) => {
        const typeOrder = { curse: 1, powerup: 2, time: 3 };

        // Sort primarily by type order
        if (typeOrder[a.type] !== typeOrder[b.type]) {
            return typeOrder[a.type] - typeOrder[b.type];
        }

        // If not a time card, sort alphabetically by title
        if (a.type !== 'time') {
            return a.title.localeCompare(b.title);
        }

        // Time cards: sort by bonusAmount (ascending)
        return a.bonusAmount - b.bonusAmount;
    });

	saveToLocalStorage();
	updateItemList();
}

function addItem() {
	const editorContainer = document.getElementById('editorContainer');
	const newEditor = document.createElement('div');
	newEditor.classList.add('item-editor');

	newEditor.innerHTML = `
		<h3>Edit Card</h3>
		<div class="editor-container">
			<label for="type">Type:</label>
			<select class="type">
				<option value="curse">Curse</option>
				<option value="powerup">Powerup</option>
				<option value="time">Time Bonus</option>
			</select>
		</div>
		<div class="editor-container">
			<label for="title">Title:</label>
			<input type="text" class="title" placeholder="Title">
		</div>
		<div class="editor-container">
			<label for="description">Description:</label>
			<textarea class="description" placeholder="Description" rows="5"></textarea>
		</div>
		<div class="editor-container">
			<label for="requirement">Casting Cost:</label>
			<input type="text" class="requirement" placeholder="Requirements">
		</div>
		<div class="editor-container">
			<label for="bonusAmount">Bonus Amount:</label>
			<input type="number" class="bonusAmount" placeholder="Minutes">
		</div>
		<div class="editor-container">
			<label for="count">Count in deck:</label>
			<input type="number" class="count" placeholder="Count" value="1">
		</div>
		<div class="remove-card" onclick="removeEditorCard(event)"><i class="ph ph-x"></i></div>
      `;

	editorContainer.appendChild(newEditor);
	// Add autoSave event listeners to the new editor fields
	newEditor.querySelectorAll('input, textarea, select').forEach((input) => {
		input.addEventListener('input', autoSave);
	});

	// Auto save for the newly added editor
	autoSave();
}

function removeEditorCard(event) {
	const card = event.target;
	card.closest('.item-editor').classList.toggle('deleted');
	autoSave();
}

function updateItemList() {
	const list = document.getElementById('itemsList');
	list.innerHTML = ''; // Clear current list

	items.forEach((item, index) => {
		const li = document.createElement('li');

		if (item.type === 'time') {
			li.innerHTML = `<strong>Time Bonus</strong> (${item.type}), Bonus Time: ${item.bonusAmount} MIN, Count: ${item.count}`;
		} else if (item.type === 'powerup') {
			li.innerHTML = `<strong>${item.title}</strong> (${item.type}) - Count: ${item.count}`;
		} else if (item.type === 'curse') {
			li.innerHTML = `<strong>${item.title}</strong> (${item.type}) - ${item.description.replace(/<br><br>/g, '\n\n').replace(/<br>/g, '\n')} - Casting Cost: ${item.requirement}, Count: ${item.count}`;
		}
		list.appendChild(li);
	});
}

function loadItems(data) {
	// Clear existing editors
	document.getElementById('editorContainer').innerHTML = '';

	// Clear the items array
	items = [];

	// Create editor sections based on the JSON data
	data.forEach(item => {
		addItem();  // Create a new item editor
		const editors = document.querySelectorAll('.item-editor');
		const lastEditor = editors[editors.length - 1];

		lastEditor.querySelector('.title').value = item.title || '';
		if (item.description) lastEditor.querySelector('.description').value = item.description.replace(/<br><br>/g, '\n\n').replace(/<br>/g, '\n') || '';
		lastEditor.querySelector('.type').value = item.type || 'curse';
		lastEditor.querySelector('.requirement').value = item.requirement || '';
		lastEditor.querySelector('.bonusAmount').value = item.bonusAmount || '';
		lastEditor.querySelector('.count').value = item.count || 1;

		// Add the item to the items array after loading into the editor
		autoSave();
	});
}

function downloadJSON() {
	if (items.length === 0) {
		alert('No items to download!');
		return;
	}

	// Prompt the user for a file name
	const fileName = prompt('Name the JSON file:', 'cards.json');
	if (!fileName) {
		alert('File name is required!');
		return;
	}

	// Ensure the file name ends with .json
	const validFileName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;

	const json = JSON.stringify(items, null, 2);
	const blob = new Blob([json], { type: 'application/json' });
	const link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = validFileName;
	link.click();
}

function uploadJSON() {
	const file = event.target.files[0];
	if (!file) {
		alert('Please select a file!');
		return;
	}

	const reader = new FileReader();
	reader.onload = function (event) {
		const fileContent = event.target.result;
		try {
			const data = JSON.parse(fileContent);
			if (Array.isArray(data)) {
				loadItems(data);
			} else {
				alert('Invalid JSON format!');
			}
		} catch (error) {
			alert('Error reading file!');
		}
	};

	reader.readAsText(file);
}

// Set event listeners for existing inputs on page load
document.querySelectorAll('.item-editor input, .item-editor textarea, .item-editor select').forEach((input) => {
	input.addEventListener('input', autoSave);
});