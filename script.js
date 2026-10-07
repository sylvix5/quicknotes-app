const noteForm = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const noteCategory = document.querySelector("#note-category");
const searchInput = document.querySelector("#search-input");
const notesList = document.querySelector("#notes-list");
const noteCount = document.querySelector("#note-count");
const errorMessage = document.querySelector("#error-message");

let notes = [];

// Load notes from localStorage on startup
function loadNotes() {
    const savedNotes = localStorage.getItem("quicknotes_data");
    if (savedNotes) {
        try {
            notes = JSON.parse(savedNotes);
        } catch (e) {
            notes = [];
        }
    }
}

// Save notes to localStorage
function saveNotes() {
    localStorage.setItem("quicknotes_data", JSON.stringify(notes));
}

// Format current date and time cleanly
function getFormattedDate() {
    const now = new Date();
    return now.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    }) + ' at ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Update note count message
function updateCount(displayedCount, totalCount) {
    if (totalCount === 0) {
        noteCount.textContent = "You have no notes yet.";
    } else if (totalCount === 1) {
        noteCount.textContent = "You have 1 note.";
    } else {
        if (displayedCount !== totalCount) {
            noteCount.textContent = `Showing ${displayedCount} of ${totalCount} notes.`;
        } else {
            noteCount.textContent = `You have ${totalCount} notes.`;
        }
    }
}

// Render notes list using DOM methods (never innerHTML for user text)
function render(filterText = "") {
    notesList.textContent = "";

    const lowerFilter = filterText.toLowerCase().trim();
    const filteredNotes = notes.filter(note => 
        note.text.toLowerCase().includes(lowerFilter)
    );

    updateCount(filteredNotes.length, notes.length);

    if (filteredNotes.length === 0) {
        const emptyLi = document.createElement("li");
        emptyLi.className = "empty-search-message";
        emptyLi.textContent = notes.length === 0 ? "No notes added yet." : "No notes match your search.";
        emptyLi.style.color = "#6b7280";
        emptyLi.style.fontStyle = "italic";
        notesList.appendChild(emptyLi);
        return;
    }

    filteredNotes.forEach(note => {
        const li = document.createElement("li");
        li.className = `note-card category-${note.category.toLowerCase()}`;

        const contentWrapper = document.createElement("div");
        contentWrapper.className = "note-content-wrapper";

        const pText = document.createElement("p");
        pText.className = "note-text";
        pText.textContent = note.text;

        const metaDiv = document.createElement("div");
        metaDiv.className = "note-meta";

        const categorySpan = document.createElement("span");
        categorySpan.className = "category-badge";
        categorySpan.textContent = note.category;

        const dateSpan = document.createElement("span");
        dateSpan.textContent = note.createdAt;

        metaDiv.appendChild(categorySpan);
        metaDiv.appendChild(dateSpan);

        contentWrapper.appendChild(pText);
        contentWrapper.appendChild(metaDiv);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => {
            deleteNote(note.id);
        });

        li.appendChild(contentWrapper);
        li.appendChild(deleteBtn);
        notesList.appendChild(li);
    });
}

// Add a new note
noteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = noteInput.value.trim();

    // Validation checks
    if (text === "") {
        errorMessage.textContent = "Please type a note first.";
        return;
    }
    if (text.length > 200) {
        errorMessage.textContent = "Notes must be 200 characters or fewer.";
        return;
    }

    // Clear error if validation passes
    errorMessage.textContent = "";

    const newNote = {
        id: Date.now().toString(),
        text: text,
        category: noteCategory.value,
        createdAt: getFormattedDate()
    };

    notes.unshift(newNote);
    saveNotes();
    
    noteInput.value = "";
    noteCategory.selectedIndex = 0;
    
    render(searchInput.value);
});

// Delete note by ID
function deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    saveNotes();
    render(searchInput.value);
}

// Search feature implementation
searchInput.addEventListener("input", (e) => {
    render(e.target.value);
});

// Initial startup call
loadNotes();
render();