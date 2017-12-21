/**
 *  @file addressBook.js
 *  @brief Address book maintenance
 */
var Contacts = {};

// $(() => {
	// // initialize table
	// setTimeout(() => {
		// chrome.runtime.sendMessage({
			// type: "GetContacts"
		// },
			// function (entries) {
			// console.log("Contacts received", entries);
			// // The response will be received as a 'config' message above
			// Contacts.entries = entries || [];
		// });

	// }, 500);
// });

document.addEventListener('DOMContentLoaded', () => {
	Contacts = {
		/* index: window.localStorage.getItem("Contacts:index"), */
		entries: [],
		$table: document.getElementById("contacts-table"),
		$form: document.getElementById("contacts-form"),
		$button_save: document.getElementById("contacts-op-save"),
		$button_discard: document.getElementById("contacts-op-discard"),

		init: function () {
			$("#addContactBtn").click( ()=>{
				$("#addContactBtn").hide();
				$("#contactsForm").show();
			});
			// initialize storage index
			// if (!Contacts.index) {
			// window.localStorage.setItem("Contacts:index", Contacts.index = 1);
			// }
			chrome.runtime.sendMessage({
				type: "GetContacts"
			},
				(entries) => {
					console.log("Contacts received", entries);
					// The response will be received as a 'config' message above
					Contacts.entries = entries || [];
					Contacts.entries.forEach( Contacts.tableAdd );
			});

			// initialize form
			Contacts.$form.reset();
			Contacts.$button_discard.addEventListener("click", function (event) {
				Contacts.$form.reset();
				Contacts.$form.id_entry.value = 0;
				$("#contactsForm").hide();
				$("#addContactBtn").show();
			}, true);
			Contacts.$form.addEventListener("submit", function (event) {
				var entry = {
					id: parseInt(this.id_entry.value),
					name: this.name.value,
					url: this.url.value,
					email: this.email.value,
					publicKey: this.publicKey.value
				};
				if (!entry.id) { // add
					Contacts.entries.push(entry);
					Contacts.storeAdd(entry);
					Contacts.tableAdd(entry);
				} else { // edit
					Contacts.storeEdit(entry);
					Contacts.tableEdit(entry);
				}

				this.reset();
				this.id_entry.value = 0;
				event.preventDefault();
				$("#contactsForm").hide();
				$("#addContactBtn").show();
			}, true);

			Contacts.$table.addEventListener("click", function (event) {
				var op = event.target.getAttribute("data-op");
				if (/edit|remove/.test(op)) {
					var id = event.target.getAttribute("data-id");
					var entry = Contacts.entries.find( (el) => { return el.id == id } );
					if (op == "edit") {
						Contacts.$form.name.value = entry.name;
						Contacts.$form.url.value = entry.url;
						Contacts.$form.email.value = entry.email;
						Contacts.$form.id_entry.value = entry.id;
						Contacts.$form.publicKey.value = entry.publicKey;
						$("#addContactBtn").hide();
						$("#contactsForm").show();
					} else if (op == "remove") {
						if (confirm('Are you sure you want to remove "' + entry.name + '" from your contacts?')) {
						debugger;
							Contacts.storeRemove(entry);
							Contacts.tableRemove(entry);
						}
					}
					event.preventDefault();
				}
			}, true);
		},

		storeAdd: function (entry) {
			entry.id = Math.floor(Math.random() * 10 ** 10);
			this.saveContacts();
		},
		storeEdit: function (entry) {
			Contacts.entries.some(function (e, i) {
				if (e.id == entry.id) {
					Contacts.entries[i] = entry;
					return true;
				}
			});
			this.saveContacts();
		},
		storeRemove: function (entry) {
			Contacts.entries.some(function (e, i) {
				if (e.id == entry.id) {
					Contacts.entries.splice(i, 1);
					return true;
				}
			});
			this.saveContacts();
		},
		saveContacts: function () {
			chrome.runtime.sendMessage({
				type: "SaveContacts",
				value: Contacts.entries
			},
				()=> {
				console.log("Contacts saved");
			});
		},
		
		populateRow: function (opts){
			var td,
			tr = opts.row,
			entry = opts.entry;
			[entry.url, entry.name, entry.publicKey, entry.email].forEach(function (field) {
				td = document.createElement("td");
				td.appendChild(document.createTextNode(field));
				tr.appendChild(td);
			});

			td = document.createElement("td");
			td.innerHTML = '<a data-op="edit" data-id="' + entry.id + '">Edit</a> | <a data-op="remove" data-id="' + entry.id + '">Remove</a>';
			opts.row.appendChild(td);
		},

		tableAdd: function (entry) {
			var tr = document.createElement("tr");
			Contacts.populateRow({
				entry: entry,
				row: tr
			});
			tr.setAttribute("id", "entry-" + entry.id);
			Contacts.$table.appendChild(tr);
		},

		tableEdit: function (entry) {
			var tr = document.getElementById("entry-" + entry.id);
			tr.innerHTML = "";
			Contacts.populateRow({
				entry: entry,
				row: tr
			});
		},
		tableRemove: function (entry) {
			var tr = document.getElementById("entry-" + entry.id);
			Contacts.$table.removeChild(tr);
		}
	};
	Contacts.init();
});
