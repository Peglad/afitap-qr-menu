import './style.css'
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_apiKey,
  authDomain: import.meta.env.VITE_authDomain,
  projectId: import.meta.env.VITE_projectId,
  storageBucket: import.meta.env.VITE_storageBucket,
  messagingSenderId: parseInt(import.meta.env.VITE_messagingSenderId),
  appId: import.meta.env.VITE_appId
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


function sortObjectKeys(obj) {
  // Retrieve the keys of the object
  const keys = ["Viski", "Votka", "Cin", "Rakı", "Bira", "Duble"];

  // Create a new object and populate it with the sorted keys
  const sortedObj = {};
  keys.forEach(key => {
    sortedObj[key] = obj[key];
  });

  // Append the remainder
  const remainderKeys = Object.keys(obj).filter(key => !keys.includes(key));
  remainderKeys.forEach(key => {
    sortedObj[key] = obj[key];
  });

  return sortedObj;
}

async function getData() {

  const querySnapshot = await getDocs(collection(db, "products"));
  const data = querySnapshot.docs.map(doc => doc.data());

  function setCategoryAsIndex(data) {
    let newData = {};
    for (let i = 0; i < data.length; i++) {
      if (!newData[data[i].category]) {
        newData[data[i].category] = [];
      }
      newData[data[i].category].push(data[i]);
    }
    for (let category in newData) {
      newData[category] = newData[category].sort((a, b) => a.name.localeCompare(b.name));
    }

    newData = sortObjectKeys(newData);
    delete newData["Rakı"];

    return newData;
  }

  const newData = setCategoryAsIndex(data);
  console.log(newData);

  return newData;
}

function createSection(data) {
  const menuContainer = document.querySelector('.menu-container');

  for (let category in data) {
    const menuSection = document.createElement('div');
    menuSection.classList.add('menu-section');
    menuContainer.appendChild(menuSection);

    const menuHeader = document.createElement('div');
    menuHeader.classList.add('menu-header');
    menuHeader.textContent = category;
    menuSection.appendChild(menuHeader);

    const menuItems = document.createElement('div');
    menuItems.classList.add('menu-items');

    const p = document.createElement('p');
    p.innerHTML = 'Meyve ve soft içeceklerimiz ikramdır';
    menuItems.appendChild(p);
    p.classList.add('info-text');

    for (let i = 0; i < data[category].length; i++) {

      const image_path = data[category][i].image ? data[category][i].image : '/placeholder.png';
      const menuItem = document.createElement('div');
      menuItem.classList.add('menu-item');
      menuItem.innerHTML = `
        <img src="${image_path}" alt="${data[category][i].name}" class="item-image">
        <div class="item-details">
          <span class="item-name">${data[category][i].name}</span>
          <span class="price">${data[category][i].price}₺</span>
        </div>
      `;
      menuItems.appendChild(menuItem);
    }
    menuSection.appendChild(menuItems);

  }
}

getData().then(data => {
  createSection(data);

  // Toggle menu sections
  document.querySelectorAll('.menu-header').forEach(header => {
    header.addEventListener('click', () => {
      const items = header.nextElementSibling;
      items.style.display = items.style.display === 'block' ? 'none' : 'block';
    });
  });

  // Image preview
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const closeBtn = document.getElementsByClassName('close')[0];

  document.querySelectorAll('.item-image').forEach(img => {
    img.onclick = function() {
      modal.style.display = 'block';
      modalImg.src = this.src;
    }
  });

  closeBtn.onclick = function() {
    modal.style.display = 'none';
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
}).catch(error => {
  console.error(error);
})



